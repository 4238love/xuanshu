import { NextRequest, NextResponse } from 'next/server';

type AIConfigMode = 'official' | 'custom';

type AIMessagePayload = {
  role: string;
  content: string;
};

interface ClientAIRequestBody {
  mode?: AIConfigMode;
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

const enableDebugLog =
  process.env.NODE_ENV !== 'production' && process.env.AI_PROXY_DEBUG !== '0';

function debugLog(message: string, payload?: unknown) {
  if (!enableDebugLog) return;
  if (payload === undefined) {
    console.log(message);
    return;
  }
  console.log(message, payload);
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getOfficialAIConfig(): OfficialAIConfig {
  return {
    baseURL: process.env.AI_OFFICIAL_BASE_URL?.trim() ?? '',
    apiKey: process.env.AI_OFFICIAL_API_KEY?.trim() ?? '',
    model: process.env.AI_OFFICIAL_MODEL?.trim() ?? '',
    temperature: parseNumber(process.env.AI_OFFICIAL_TEMPERATURE, 0.7),
    maxTokens: Math.max(1, Math.floor(parseNumber(process.env.AI_OFFICIAL_MAX_TOKENS, 2000))),
  };
}

function isOfficialAIConfigured(config = getOfficialAIConfig()): boolean {
  return Boolean(config.baseURL && config.apiKey && config.model);
}

function buildCompletionsURL(baseURL: string): string {
  if (baseURL.includes('aip.baidubce.com')) {
    // Baidu Wenxin uses full endpoint URL with token in baseURL
    return baseURL;
  }
  return `${baseURL}/chat/completions`;
}

function normalizeMessages(messages: unknown): AIMessagePayload[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const role = (item as Record<string, unknown>).role;
      const content = (item as Record<string, unknown>).content;
      if (typeof role !== 'string' || typeof content !== 'string') return null;
      return { role, content };
    })
    .filter((item): item is AIMessagePayload => item !== null);
}

function resolveUpstreamConfig(
  body: ClientAIRequestBody
): { config?: ResolvedUpstreamConfig; error?: string; status?: number } {
  const hasLegacyCustomFields = Boolean(body.baseURL || body.apiKey || body.model);
  const mode: AIConfigMode =
    body.mode === 'custom' || (!body.mode && hasLegacyCustomFields) ? 'custom' : 'official';
  const messages = normalizeMessages(body.messages);

  if (messages.length === 0) {
    return { error: '缺少有效的 messages 参数', status: 400 };
  }

  const stream = Boolean(body.stream);

  if (mode === 'official') {
    const officialConfig = getOfficialAIConfig();
    if (!isOfficialAIConfigured(officialConfig)) {
      return {
        error: '官方 API 未在服务端完成配置（需要 AI_OFFICIAL_BASE_URL / AI_OFFICIAL_API_KEY / AI_OFFICIAL_MODEL）',
        status: 500,
      };
    }

    return {
      config: {
        mode,
        baseURL: officialConfig.baseURL,
        apiKey: officialConfig.apiKey,
        model: officialConfig.model,
        messages,
        temperature: body.temperature ?? officialConfig.temperature,
        maxTokens: body.maxTokens ?? officialConfig.maxTokens,
        stream,
      },
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
      baseURL,
      apiKey,
      model,
      messages,
      temperature: body.temperature ?? 0.7,
      maxTokens: body.maxTokens ?? 2000,
      stream,
    },
  };
}

export async function GET() {
  const officialConfigured = isOfficialAIConfigured();
  return NextResponse.json({
    officialConfigured,
    defaultMode: officialConfigured ? 'official' : 'custom',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClientAIRequestBody;
    const resolved = resolveUpstreamConfig(body);

    if (!resolved.config) {
      return NextResponse.json({ error: resolved.error ?? '请求参数错误' }, { status: resolved.status ?? 400 });
    }

    const config = resolved.config;
    const url = buildCompletionsURL(config.baseURL);

    debugLog('[AI代理] 收到请求', {
      mode: config.mode,
      model: config.model,
      stream: config.stream,
      messagesCount: config.messages.length,
    });
    debugLog('[AI代理] 请求URL', url);

    const response = await fetch(url, {
      method: 'POST',
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
          (typeof errorData.message === 'string' ? errorData.message : null) ||
          `请求失败: ${response.status}`;
        return NextResponse.json({ error: upstreamError }, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: `请求失败: ${response.status} - ${errorText.slice(0, 200)}` },
          { status: response.status }
        );
      }
    }

    if (config.stream) {
      const headers = new Headers();
      headers.set('Content-Type', 'text/event-stream');
      headers.set('Cache-Control', 'no-cache');
      headers.set('Connection', 'keep-alive');

      return new NextResponse(response.body, {
        status: 200,
        headers,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[AI代理] 代理请求失败', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '代理请求失败' },
      { status: 500 }
    );
  }
}
