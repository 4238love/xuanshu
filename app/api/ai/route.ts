import { NextRequest, NextResponse } from 'next/server';
import {
  AI_PROVIDER_MAX_TOKENS,
  DEFAULT_AI_MAX_TOKENS,
  DEFAULT_AI_TEMPERATURE,
  type AIProvider,
} from '@/types/ai';

type AIConfigMode = 'official' | 'custom';

type AIMessagePayload = {
  role: string;
  content: string;
};

interface ClientAIRequestBody {
  mode?: AIConfigMode;
  provider?: AIProvider;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  messages?: AIMessagePayload[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ResolvedUpstreamConfig {
  mode: AIConfigMode;
  provider: AIProvider;
  baseURL: string;
  apiKey: string;
  model: string;
  messages: AIMessagePayload[];
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

interface OfficialAIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface OfficialAIMeta {
  baseURLHost: string | null;
  model: string | null;
  thirdPartyHost: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface MessageValidationResult {
  messages?: AIMessagePayload[];
  error?: string;
  status?: number;
}

interface UpstreamRequestSpec {
  url: string;
  headers: Record<string, string>;
  body: string;
}

const enableDebugLog =
  process.env.NODE_ENV !== 'production' && process.env.AI_PROXY_DEBUG !== '0';
const DEFAULT_UPSTREAM_TIMEOUT_MS = 30_000;
const DEFAULT_STREAM_UPSTREAM_TIMEOUT_MS = 300_000;

const ALLOWED_MESSAGE_ROLES = new Set(['system', 'user', 'assistant']);
const KNOWN_PROVIDERS = new Set<AIProvider>([
  'openai',
  'claude',
  'qianfan',
  'dashscope',
  'hunyuan',
  'moonshot',
  'zhipu',
  'minimax',
  'custom',
]);

const TRUSTED_UPSTREAM_HOSTS = new Set([
  'api.openai.com',
  'api.anthropic.com',
  'aip.baidubce.com',
  'dashscope.aliyuncs.com',
  'api.hunyuan.cloud.tencent.com',
  'api.moonshot.cn',
  'open.bigmodel.cn',
]);

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function debugLog(message: string, payload?: unknown) {
  if (!enableDebugLog) return;
  if (payload === undefined) {
    console.log(message);
    return;
  }
  console.log(message, payload);
}

function parseNumber(
  value: string | number | undefined,
  fallback: number,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeTemperature(value: number | undefined): number {
  return parseNumber(value, DEFAULT_AI_TEMPERATURE, 0, 2);
}

function normalizeCustomMaxTokens(value: number | undefined): number {
  return Math.floor(
    parseNumber(value, DEFAULT_AI_MAX_TOKENS, 1, AI_PROVIDER_MAX_TOKENS.custom)
  );
}

function normalizeOfficialMaxTokens(value: number | undefined): number {
  return Math.floor(
    parseNumber(value, DEFAULT_AI_MAX_TOKENS, 1, AI_PROVIDER_MAX_TOKENS.openai)
  );
}

function getRateLimitWindowMs(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_RATE_LIMIT_WINDOW_MS, 60_000, 1_000, 3_600_000));
}

function getRateLimitMaxRequests(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_RATE_LIMIT_MAX_REQUESTS, 12, 1, 120));
}

function getMaxRequestBytes(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_MAX_REQUEST_BYTES, 262_144, 1_024, 1_048_576));
}

function getMaxMessages(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_MAX_MESSAGES, 48, 1, 200));
}

function getMaxMessageChars(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_MAX_MESSAGE_CHARS, 24_000, 1, 200_000));
}

function getMaxTotalChars(): number {
  return Math.floor(parseNumber(process.env.AI_PROXY_MAX_TOTAL_CHARS, 120_000, 1, 500_000));
}

function getUpstreamTimeoutMs(stream: boolean): number {
  return Math.floor(
    parseNumber(
      stream ? process.env.AI_PROXY_STREAM_TIMEOUT_MS : process.env.AI_PROXY_UPSTREAM_TIMEOUT_MS,
      stream ? DEFAULT_STREAM_UPSTREAM_TIMEOUT_MS : DEFAULT_UPSTREAM_TIMEOUT_MS,
      1_000,
      3_600_000
    )
  );
}

function isCustomModeAvailable(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return process.env.AI_ENABLE_CUSTOM_MODE === '1';
}

function isPrivateHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (
    normalized === 'localhost' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    const parts = normalized.split('.').map((part) => Number(part));
    const [first, second] = parts;

    if (first === 10 || first === 127) {
      return true;
    }

    if (first === 169 && second === 254) {
      return true;
    }

    if (first === 192 && second === 168) {
      return true;
    }

    if (first === 172 && second >= 16 && second <= 31) {
      return true;
    }
  }

  return normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
}

function getAllowedCustomHosts(): Set<string> {
  const fromEnv = (process.env.AI_ALLOWED_UPSTREAM_HOSTS ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const allowedHosts = new Set([...TRUSTED_UPSTREAM_HOSTS, ...fromEnv]);
  const officialHost = getBaseURLHost(process.env.AI_OFFICIAL_BASE_URL?.trim() ?? '');

  if (officialHost) {
    allowedHosts.add(officialHost.toLowerCase());
  }

  return allowedHosts;
}

function validateUpstreamBaseURL(baseURL: string, mode: AIConfigMode): string | null {
  let url: URL;

  try {
    url = new URL(baseURL);
  } catch {
    return '上游 API 地址无效';
  }

  const isLocalDevelopmentHost =
    process.env.NODE_ENV !== 'production' &&
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1');

  if (url.protocol !== 'https:' && !isLocalDevelopmentHost) {
    return '仅允许使用 HTTPS 上游地址';
  }

  if (isPrivateHostname(url.hostname) && process.env.AI_ALLOW_PRIVATE_UPSTREAMS !== '1') {
    return '不允许代理到内网或本机地址';
  }

  if (mode === 'custom' && process.env.NODE_ENV === 'production') {
    const allowedHosts = getAllowedCustomHosts();
    const targetHost = url.host.toLowerCase();

    if (!allowedHosts.has('*') && !allowedHosts.has(targetHost)) {
      return '当前环境未允许该自定义上游地址';
    }
  }

  return null;
}

function getOfficialAIConfig(): OfficialAIConfig {
  return {
    baseURL: process.env.AI_OFFICIAL_BASE_URL?.trim() ?? '',
    apiKey: process.env.AI_OFFICIAL_API_KEY?.trim() ?? '',
    model: process.env.AI_OFFICIAL_MODEL?.trim() ?? '',
    temperature: normalizeTemperature(
      parseNumber(process.env.AI_OFFICIAL_TEMPERATURE, DEFAULT_AI_TEMPERATURE)
    ),
    maxTokens: normalizeOfficialMaxTokens(
      parseNumber(process.env.AI_OFFICIAL_MAX_TOKENS, DEFAULT_AI_MAX_TOKENS)
    ),
  };
}

function getBaseURLHost(baseURL: string): string | null {
  if (!baseURL) return null;

  try {
    return new URL(baseURL).host;
  } catch {
    return null;
  }
}

function buildOfficialAIMeta(config = getOfficialAIConfig()): OfficialAIMeta | null {
  if (!isOfficialAIConfigured(config)) {
    return null;
  }

  const baseURLHost = getBaseURLHost(config.baseURL);

  return {
    baseURLHost,
    model: config.model || null,
    thirdPartyHost: Boolean(baseURLHost && !TRUSTED_UPSTREAM_HOSTS.has(baseURLHost.toLowerCase())),
  };
}

function inferProvider(provider: unknown, baseURL: string): AIProvider {
  if (typeof provider === 'string' && KNOWN_PROVIDERS.has(provider as AIProvider)) {
    return provider as AIProvider;
  }

  const baseURLHost = getBaseURLHost(baseURL)?.toLowerCase();
  if (baseURLHost === 'aip.baidubce.com') {
    return 'qianfan';
  }

  return 'custom';
}

function isOfficialAIConfigured(config = getOfficialAIConfig()): boolean {
  return Boolean(config.baseURL && config.apiKey && config.model);
}

function isQianfanConfig(config: ResolvedUpstreamConfig): boolean {
  return config.mode === 'custom' && config.provider === 'qianfan';
}

function buildDefaultCompletionsURL(baseURL: string): string {
  return `${baseURL}/chat/completions`;
}

function splitQianfanCredentials(apiKey: string): {
  accessToken: string | null;
  accessKey: string | null;
  secretKey: string | null;
} {
  const parts = apiKey
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length === 2) {
    return {
      accessToken: null,
      accessKey: parts[0],
      secretKey: parts[1],
    };
  }

  return {
    accessToken: apiKey.trim() || null,
    accessKey: null,
    secretKey: null,
  };
}

async function resolveQianfanAccessToken(
  apiKey: string
): Promise<{ accessToken?: string; error?: string; status?: number }> {
  const credentials = splitQianfanCredentials(apiKey);

  if (credentials.accessToken) {
    return { accessToken: credentials.accessToken };
  }

  if (!credentials.accessKey || !credentials.secretKey) {
    return {
      error:
        '\u767e\u5ea6\u5343\u5e06\u9700\u8981\u586b\u5199 access_token\uff0c\u6216\u8005\u4f7f\u7528 "API Key;Secret Key" \u683c\u5f0f',
      status: 400,
    };
  }

  const tokenURL = new URL('https://aip.baidubce.com/oauth/2.0/token');
  tokenURL.searchParams.set('grant_type', 'client_credentials');
  tokenURL.searchParams.set('client_id', credentials.accessKey);
  tokenURL.searchParams.set('client_secret', credentials.secretKey);

  const response = await fetch(tokenURL.toString(), {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
  });
  const payloadText = await response.text();

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(payloadText) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const errorMessage =
      (typeof payload.error_description === 'string' ? payload.error_description : null) ||
      (typeof payload.error_msg === 'string' ? payload.error_msg : null) ||
      `\u83b7\u53d6\u767e\u5ea6\u5343\u5e06 access_token \u5931\u8d25: ${response.status}`;

    return {
      error: errorMessage,
      status: response.status,
    };
  }

  const accessToken =
    typeof payload.access_token === 'string' ? payload.access_token.trim() : '';

  if (!accessToken) {
    return {
      error: '\u83b7\u53d6\u767e\u5ea6\u5343\u5e06 access_token \u5931\u8d25',
      status: 502,
    };
  }

  return { accessToken };
}

function buildQianfanURL(baseURL: string, model: string, accessToken: string): string {
  const url = new URL(baseURL);
  const normalizedPath = url.pathname.replace(/\/+$/, '');
  const chatPrefix = '/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';

  if (!normalizedPath) {
    url.pathname = `${chatPrefix}/${encodeURIComponent(model)}`;
  } else if (normalizedPath === chatPrefix) {
    url.pathname = `${chatPrefix}/${encodeURIComponent(model)}`;
  }

  url.searchParams.set('access_token', accessToken);
  return url.toString();
}

async function buildUpstreamRequest(
  config: ResolvedUpstreamConfig
): Promise<{ request?: UpstreamRequestSpec; error?: string; status?: number }> {
  if (!isQianfanConfig(config)) {
    return {
      request: {
        url: buildDefaultCompletionsURL(config.baseURL),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: config.messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: config.stream,
        }),
      },
    };
  }

  const tokenResult = await resolveQianfanAccessToken(config.apiKey);
  if (!tokenResult.accessToken) {
    return {
      error: tokenResult.error ?? '\u83b7\u53d6\u767e\u5ea6\u5343\u5e06 access_token \u5931\u8d25',
      status: tokenResult.status ?? 400,
    };
  }

  return {
    request: {
      url: buildQianfanURL(config.baseURL, config.model, tokenResult.accessToken),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: config.messages,
        temperature: config.temperature,
        max_output_tokens: config.maxTokens,
        stream: config.stream,
      }),
    },
  };
}

function validateMessages(messages: unknown): MessageValidationResult {
  if (!Array.isArray(messages)) {
    return { error: 'messages 参数必须是数组', status: 400 };
  }

  if (messages.length === 0) {
    return { error: '缺少有效的 messages 参数', status: 400 };
  }

  if (messages.length > getMaxMessages()) {
    return { error: '消息数量超过当前代理限制', status: 413 };
  }

  const maxMessageChars = getMaxMessageChars();
  const maxTotalChars = getMaxTotalChars();
  const normalizedMessages: AIMessagePayload[] = [];
  let totalChars = 0;

  for (const item of messages) {
    if (!item || typeof item !== 'object') {
      return { error: 'messages 中存在无效消息项', status: 400 };
    }

    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;

    if (typeof role !== 'string' || !ALLOWED_MESSAGE_ROLES.has(role)) {
      return { error: 'messages 中存在不支持的 role', status: 400 };
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return { error: 'messages 中存在空内容消息', status: 400 };
    }

    if (content.length > maxMessageChars) {
      return { error: '单条消息长度超过当前代理限制', status: 413 };
    }

    totalChars += content.length;
    if (totalChars > maxTotalChars) {
      return { error: '请求体大小或消息总长度超过当前代理限制', status: 413 };
    }

    normalizedMessages.push({ role, content });
  }

  return { messages: normalizedMessages };
}

function resolveUpstreamConfig(
  body: ClientAIRequestBody
): { config?: ResolvedUpstreamConfig; error?: string; status?: number } {
  const hasLegacyCustomFields = Boolean(body.baseURL || body.apiKey || body.model);
  const mode: AIConfigMode =
    body.mode === 'custom' || (!body.mode && hasLegacyCustomFields) ? 'custom' : 'official';
  const messageValidation = validateMessages(body.messages);

  if (!messageValidation.messages) {
    return {
      error: messageValidation.error ?? '请求消息格式错误',
      status: messageValidation.status ?? 400,
    };
  }

  const messages = messageValidation.messages;
  const stream = Boolean(body.stream);

  if (mode === 'official') {
    const officialConfig = getOfficialAIConfig();
    if (!isOfficialAIConfigured(officialConfig)) {
      return {
        error:
          '官方 API 未在服务端完成配置（需要 AI_OFFICIAL_BASE_URL / AI_OFFICIAL_API_KEY / AI_OFFICIAL_MODEL）',
        status: 500,
      };
    }

    return {
      config: {
        mode,
        provider: 'custom',
        baseURL: officialConfig.baseURL,
        apiKey: officialConfig.apiKey,
        model: officialConfig.model,
        messages,
        temperature: officialConfig.temperature,
        maxTokens: officialConfig.maxTokens,
        stream,
      },
    };
  }

  if (!isCustomModeAvailable()) {
    return {
      error: '生产环境已禁用自定义 API 代理，如需启用请配置 AI_ENABLE_CUSTOM_MODE=1',
      status: 403,
    };
  }

  const baseURL = body.baseURL?.trim() ?? '';
  const apiKey = body.apiKey?.trim() ?? '';
  const model = body.model?.trim() ?? '';

  if (!baseURL || !apiKey || !model) {
    return { error: '自定义模式缺少必要参数（baseURL / apiKey / model）', status: 400 };
  }

  return {
    config: {
      mode,
      provider: inferProvider(body.provider, baseURL),
      baseURL,
      apiKey,
      model,
      messages,
      temperature: normalizeTemperature(body.temperature),
      maxTokens: normalizeCustomMaxTokens(body.maxTokens),
      stream,
    },
  };
}

function getExpectedOrigin(request: NextRequest): string | null {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');

  if (!host) {
    return null;
  }

  const protocol =
    request.headers.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');

  return `${protocol}://${host}`;
}

function isSameOriginRequest(request: NextRequest): boolean {
  const expectedOrigin = getExpectedOrigin(request);
  if (!expectedOrigin) {
    return true;
  }

  const origin = request.headers.get('origin');
  if (origin) {
    return origin === expectedOrigin;
  }

  const referer = request.headers.get('referer');
  if (referer) {
    return referer === expectedOrigin || referer.startsWith(`${expectedOrigin}/`);
  }

  return process.env.NODE_ENV !== 'production';
}

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function consumeRateLimit(request: NextRequest): RateLimitResult {
  const now = Date.now();
  const limit = getRateLimitMaxRequests();
  const windowMs = getRateLimitWindowMs();
  const key = getClientKey(request);

  for (const [storedKey, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(storedKey);
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    const nextValue = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, nextValue);
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - nextValue.count),
      resetAt: nextValue.resetAt,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

function withRateLimitHeaders(response: NextResponse, rateLimit: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(rateLimit.resetAt / 1000)));
  return response;
}

function withRetryAfterHeader(response: NextResponse, retryAfterMs: number): NextResponse {
  response.headers.set('Retry-After', String(Math.max(1, Math.ceil(retryAfterMs / 1000))));
  return response;
}

function mergeAbortSignals(...signals: Array<AbortSignal | null | undefined>): AbortSignal | undefined {
  const activeSignals = signals.filter((signal): signal is AbortSignal => Boolean(signal));

  if (activeSignals.length === 0) {
    return undefined;
  }

  if (activeSignals.length === 1) {
    return activeSignals[0];
  }

  const controller = new AbortController();

  const abortWithReason = (signal: AbortSignal) => {
    if (!controller.signal.aborted) {
      controller.abort(signal.reason);
    }
  };

  for (const signal of activeSignals) {
    if (signal.aborted) {
      abortWithReason(signal);
      return controller.signal;
    }

    signal.addEventListener('abort', () => abortWithReason(signal), { once: true });
  }

  return controller.signal;
}

function getProxyErrorMessage(error: unknown): string {
  if (
    error instanceof DOMException &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  ) {
    return '上游 AI 响应超时，请稍后重试，或缩短问题后再试。';
  }

  if (error instanceof Error) {
    if (/timeout/i.test(error.message)) {
      return '上游 AI 响应超时，请稍后重试，或缩短问题后再试。';
    }

    return error.message;
  }

  return '代理请求失败';
}

function isJsonRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  return typeof contentType === 'string' && contentType.toLowerCase().startsWith('application/json');
}

async function getRequestSizeBytes(request: NextRequest): Promise<number | null> {
  const contentLength = request.headers.get('content-length');
  if (!contentLength) {
    try {
      const rawBody = await request.clone().text();
      return Buffer.byteLength(rawBody);
    } catch {
      return null;
    }
  }

  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function GET() {
  const officialConfigured = isOfficialAIConfigured();
  const officialMeta = buildOfficialAIMeta();
  const customModeAvailable = isCustomModeAvailable();

  return NextResponse.json({
    officialConfigured,
    officialMeta,
    defaultMode: officialConfigured ? 'official' : customModeAvailable ? 'custom' : 'official',
    customModeAvailable,
    sessionOnlySecrets: true,
    rateLimit: {
      windowMs: getRateLimitWindowMs(),
      maxRequests: getRateLimitMaxRequests(),
    },
    requestLimits: {
      maxRequestBytes: getMaxRequestBytes(),
      maxMessages: getMaxMessages(),
      maxMessageChars: getMaxMessageChars(),
      maxTotalChars: getMaxTotalChars(),
    },
  });
}

export async function POST(request: NextRequest) {
  const rateLimit = consumeRateLimit(request);

  if (!isSameOriginRequest(request)) {
    return withRateLimitHeaders(
      NextResponse.json({ error: '仅允许来自本站的请求访问 AI 代理' }, { status: 403 }),
      rateLimit
    );
  }

  if (!rateLimit.allowed) {
    const retryAfterMs = Math.max(0, rateLimit.resetAt - Date.now());
    return withRetryAfterHeader(
      withRateLimitHeaders(
        NextResponse.json(
          {
            error: 'AI 请求过于频繁，请稍后再试',
            retryAfterMs,
          },
          { status: 429 }
        ),
        rateLimit
      ),
      retryAfterMs
    );
  }

  if (!isJsonRequest(request)) {
    return withRateLimitHeaders(
      NextResponse.json({ error: '仅支持 application/json 请求' }, { status: 415 }),
      rateLimit
    );
  }

  const requestSizeBytes = await getRequestSizeBytes(request);
  if (requestSizeBytes !== null && requestSizeBytes > getMaxRequestBytes()) {
    return withRateLimitHeaders(
      NextResponse.json({ error: '请求体大小超过当前代理限制' }, { status: 413 }),
      rateLimit
    );
  }

  try {
    const body = (await request.json()) as ClientAIRequestBody;
    const resolved = resolveUpstreamConfig(body);

    if (!resolved.config) {
      return withRateLimitHeaders(
        NextResponse.json(
          { error: resolved.error ?? '请求参数错误' },
          { status: resolved.status ?? 400 }
        ),
        rateLimit
      );
    }

    const config = resolved.config;
    const validationError = validateUpstreamBaseURL(config.baseURL, config.mode);
    if (validationError) {
      return withRateLimitHeaders(
        NextResponse.json({ error: validationError }, { status: 400 }),
        rateLimit
      );
    }

    const upstream = await buildUpstreamRequest(config);
    if (!upstream.request) {
      return withRateLimitHeaders(
        NextResponse.json(
          { error: upstream.error ?? '\u4e0a\u6e38\u914d\u7f6e\u89e3\u6790\u5931\u8d25' },
          { status: upstream.status ?? 400 }
        ),
        rateLimit
      );
    }

    const { url, headers, body: requestBody } = upstream.request;

    debugLog('[AI代理] 收到请求', {
      mode: config.mode,
      model: config.model,
      stream: config.stream,
      messagesCount: config.messages.length,
    });
    debugLog('[AI代理] 请求 URL', url);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: requestBody,
      signal: mergeAbortSignals(
        request.signal,
        AbortSignal.timeout(getUpstreamTimeoutMs(config.stream))
      ),
    });

    debugLog('[AI代理] 响应状态', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI代理] 上游接口错误', {
        status: response.status,
        bodyPreview: errorText.slice(0, 500),
      });

      try {
        const errorData = JSON.parse(errorText) as Record<string, unknown>;
        const upstreamError =
          (typeof (errorData.error as Record<string, unknown> | undefined)?.message === 'string'
            ? (errorData.error as Record<string, string>).message
            : null) ||
          (typeof errorData.error_msg === 'string' ? errorData.error_msg : null) ||
          (typeof errorData.message === 'string' ? errorData.message : null) ||
          `请求失败: ${response.status}`;

        return withRateLimitHeaders(
          NextResponse.json({ error: upstreamError }, { status: response.status }),
          rateLimit
        );
      } catch {
        return withRateLimitHeaders(
          NextResponse.json(
            { error: `请求失败: ${response.status} - ${errorText.slice(0, 200)}` },
            { status: response.status }
          ),
          rateLimit
        );
      }
    }

    if (config.stream) {
      const headers = new Headers();
      headers.set('Content-Type', 'text/event-stream');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Connection', 'keep-alive');
      headers.set('X-RateLimit-Limit', String(rateLimit.limit));
      headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
      headers.set('X-RateLimit-Reset', String(Math.floor(rateLimit.resetAt / 1000)));

      return new NextResponse(response.body, {
        status: 200,
        headers,
      });
    }

    const data = await response.json();
    return withRateLimitHeaders(NextResponse.json(data), rateLimit);
  } catch (error) {
    console.error('[AI代理] 代理请求失败', error);

    return withRateLimitHeaders(
      NextResponse.json(
        { error: getProxyErrorMessage(error) },
        { status: 500 }
      ),
      rateLimit
    );
  }
}
