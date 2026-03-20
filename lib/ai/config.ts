// AI API配置管理模块 - 支持多配置管理
import {
  AIConfig,
  AIConfigMode,
  AIProvider,
  AIConfigStorage,
  AI_CONFIG_STORAGE_KEY,
  AI_SESSION_SECRET_STORAGE_KEY,
  AIProviderBaseURLs,
  AIProviderDefaultModels,
  DEFAULT_AI_CONFIG_MODE,
  DEFAULT_AI_TEMPERATURE,
  DEFAULT_AI_MAX_TOKENS,
  AI_PROVIDER_MAX_TOKENS,
  defaultAIConfig,
} from '@/types/ai';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

type AISecretStorage = Record<string, string>;

function normalizeTemperature(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_AI_TEMPERATURE;
  }

  return Math.min(2, Math.max(0, value as number));
}

function normalizeMaxTokens(provider: AIProvider, value: number | undefined): number {
  const providerCap = AI_PROVIDER_MAX_TOKENS[provider] ?? AI_PROVIDER_MAX_TOKENS.custom;
  const fallback = Math.min(DEFAULT_AI_MAX_TOKENS, providerCap);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(providerCap, Math.floor(value as number)));
}

function normalizeConfig(config: AIConfig): AIConfig {
  return {
    ...config,
    name: config.name.trim(),
    baseURL: config.baseURL.trim(),
    apiKey: config.apiKey.trim(),
    model: config.model.trim(),
    temperature: normalizeTemperature(config.temperature),
    maxTokens: normalizeMaxTokens(config.provider, config.maxTokens),
  };
}

function stripSecret(config: AIConfig): AIConfig {
  return {
    ...config,
    apiKey: '',
  };
}

function getAISecretStorage(): AISecretStorage {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(AI_SESSION_SECRET_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[0] === 'string' && typeof entry[1] === 'string'
      )
    );
  } catch (error) {
    console.error('读取 AI 会话密钥失败:', error);
    return {};
  }
}

function saveAISecretStorage(storage: AISecretStorage): void {
  if (typeof window === 'undefined') return;

  try {
    if (Object.keys(storage).length === 0) {
      sessionStorage.removeItem(AI_SESSION_SECRET_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(AI_SESSION_SECRET_STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('保存 AI 会话密钥失败:', error);
  }
}

function setConfigSecret(id: string, apiKey: string): void {
  if (!id || typeof window === 'undefined') return;

  const trimmed = apiKey.trim();
  const storage = getAISecretStorage();

  if (trimmed) {
    storage[id] = trimmed;
  } else {
    delete storage[id];
  }

  saveAISecretStorage(storage);
}

function deleteConfigSecret(id: string): void {
  if (!id || typeof window === 'undefined') return;

  const storage = getAISecretStorage();
  if (!(id in storage)) {
    return;
  }

  delete storage[id];
  saveAISecretStorage(storage);
}

function hydrateConfigs(configs: AIConfig[]): { configs: AIConfig[]; migrated: boolean } {
  const secrets = getAISecretStorage();
  let migrated = false;

  const hydrated = configs.map((config) => {
    const secret = secrets[config.id];
    const legacySecret = config.apiKey.trim();

    if (!secret && legacySecret && config.id) {
      secrets[config.id] = legacySecret;
      migrated = true;
    }

    return normalizeConfig({
      ...config,
      apiKey: secret ?? legacySecret,
    });
  });

  if (migrated) {
    saveAISecretStorage(secrets);
  }

  return { configs: hydrated, migrated };
}

export interface BuildAIProxyRequestBodyInput {
  mode: AIConfigMode;
  config: AIConfig;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * 获取AI配置存储结构
 * 从localStorage读取用户保存的所有配置
 */
export function getAIConfigStorage(): AIConfigStorage {
  const emptyStorage: AIConfigStorage = {
    configs: [],
    activeConfigId: null,
    mode: DEFAULT_AI_CONFIG_MODE,
  };

  if (typeof window === 'undefined') {
    return emptyStorage;
  }

  try {
    const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AIConfigStorage>;
      const parsedConfigs = Array.isArray(parsed.configs) ? (parsed.configs as AIConfig[]) : [];
      const { configs, migrated } = hydrateConfigs(parsedConfigs);
      const fallbackMode: AIConfigMode =
        configs.length > 0 ? 'custom' : DEFAULT_AI_CONFIG_MODE;

      const resolvedStorage: AIConfigStorage = {
        configs,
        activeConfigId: typeof parsed.activeConfigId === 'string' ? parsed.activeConfigId : null,
        mode: parsed.mode === 'custom' || parsed.mode === 'official' ? parsed.mode : fallbackMode,
      };

      if (migrated) {
        saveAIConfigStorage(resolvedStorage);
      }

      return resolvedStorage;
    }
  } catch (error) {
    console.error('读取AI配置失败:', error);
  }

  return emptyStorage;
}

/**
 * 获取当前激活的AI配置
 * 返回默认配置或第一个配置
 */
export function getAIConfig(): AIConfig {
  const storage = getAIConfigStorage();

  // 如果有激活的配置
  if (storage.activeConfigId) {
    const activeConfig = storage.configs.find(c => c.id === storage.activeConfigId);
    if (activeConfig) {
      return activeConfig;
    }
  }

  // 如果有默认配置
  const defaultConfig = storage.configs.find(c => c.isDefault);
  if (defaultConfig) {
    return defaultConfig;
  }

  // 如果有配置，返回第一个
  if (storage.configs.length > 0) {
    return storage.configs[0];
  }

  // 返回新的默认配置
  return {
    ...defaultAIConfig,
    id: generateId(),
  };
}

/**
 * 获取当前AI配置模式
 */
export function getAIConfigMode(): AIConfigMode {
  return getAIConfigStorage().mode;
}

/**
 * 设置AI配置模式
 */
export function setAIConfigMode(mode: AIConfigMode): void {
  const storage = getAIConfigStorage();
  storage.mode = mode;
  saveAIConfigStorage(storage);
}

/**
 * 保存完整的配置存储结构
 */
function saveAIConfigStorage(storage: AIConfigStorage): void {
  if (typeof window === 'undefined') return;

  try {
    const persistedStorage: AIConfigStorage = {
      ...storage,
      configs: storage.configs.map((config) => stripSecret(normalizeConfig(config))),
    };
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(persistedStorage));
  } catch (error) {
    console.error('保存AI配置失败:', error);
  }
}

/**
 * 获取所有保存的配置列表
 */
export function getAllConfigs(): AIConfig[] {
  const storage = getAIConfigStorage();
  return storage.configs;
}

/**
 * 添加新配置
 */
export function addConfig(config: Omit<AIConfig, 'id' | 'createdAt'>): AIConfig {
  const storage = getAIConfigStorage();

  const newConfig = normalizeConfig({
    ...config,
    id: generateId(),
    createdAt: Date.now(),
  });

  // 如果是第一个配置，设为默认
  if (storage.configs.length === 0) {
    newConfig.isDefault = true;
  }

  setConfigSecret(newConfig.id, newConfig.apiKey);
  storage.configs.push(newConfig);

  // 如果没有激活的配置，激活新配置
  if (!storage.activeConfigId) {
    storage.activeConfigId = newConfig.id;
  }

  saveAIConfigStorage(storage);
  return newConfig;
}

/**
 * 更新配置
 */
export function updateConfig(id: string, updates: Partial<AIConfig>): AIConfig | null {
  const storage = getAIConfigStorage();
  const index = storage.configs.findIndex(c => c.id === id);

  if (index === -1) {
    return null;
  }

  storage.configs[index] = normalizeConfig({
    ...storage.configs[index],
    ...updates,
  });

  setConfigSecret(id, storage.configs[index].apiKey);

  saveAIConfigStorage(storage);
  return storage.configs[index];
}

/**
 * 删除配置
 */
export function deleteConfig(id: string): boolean {
  const storage = getAIConfigStorage();
  const index = storage.configs.findIndex(c => c.id === id);

  if (index === -1) {
    return false;
  }

  deleteConfigSecret(id);
  storage.configs.splice(index, 1);

  // 如果删除的是激活的配置，激活另一个
  if (storage.activeConfigId === id) {
    storage.activeConfigId = storage.configs.length > 0 ? storage.configs[0].id : null;
  }

  // 如果删除的是默认配置，将第一个设为默认
  if (storage.configs.length > 0 && !storage.configs.some(c => c.isDefault)) {
    storage.configs[0].isDefault = true;
  }

  saveAIConfigStorage(storage);
  return true;
}

/**
 * 激活指定配置
 */
export function setActiveConfig(id: string): boolean {
  const storage = getAIConfigStorage();
  const config = storage.configs.find(c => c.id === id);

  if (!config) {
    return false;
  }

  storage.activeConfigId = id;
  saveAIConfigStorage(storage);
  return true;
}

/**
 * 设置默认配置
 */
export function setDefaultConfig(id: string): boolean {
  const storage = getAIConfigStorage();
  const config = storage.configs.find(c => c.id === id);

  if (!config) {
    return false;
  }

  // 取消其他配置的默认状态
  storage.configs.forEach(c => {
    c.isDefault = c.id === id;
  });

  saveAIConfigStorage(storage);
  return true;
}

/**
 * 保存或更新配置（兼容旧接口）
 */
export function saveAIConfig(config: AIConfig): void {
  const storage = getAIConfigStorage();
  const existingIndex = storage.configs.findIndex(c => c.id === config.id);
  const normalized = normalizeConfig(config);

  if (existingIndex >= 0) {
    storage.configs[existingIndex] = normalized;
  } else {
    storage.configs.push(normalized);
  }

  setConfigSecret(normalized.id, normalized.apiKey);

  // 如果没有激活的配置，激活这个
  if (!storage.activeConfigId) {
    storage.activeConfigId = normalized.id;
  }

  saveAIConfigStorage(storage);
}

/**
 * 更新AI配置的单个字段（兼容旧接口）
 */
export function updateAIConfig(updates: Partial<AIConfig>): AIConfig {
  const current = getAIConfig();
  const updated = normalizeConfig({ ...current, ...updates, id: current.id });
  saveAIConfig(updated);
  return updated;
}

/**
 * 重置AI配置为默认值
 */
export function resetAIConfig(): void {
  const storage = getAIConfigStorage();
  storage.configs = [];
  storage.activeConfigId = null;
  storage.mode = DEFAULT_AI_CONFIG_MODE;
  saveAISecretStorage({});
  saveAIConfigStorage(storage);
}

/**
 * 检查API配置是否有效
 */
export function isAIConfigValid(config: AIConfig, mode: AIConfigMode = getAIConfigMode()): boolean {
  if (mode === 'official') {
    return true;
  }

  const normalized = normalizeConfig(config);
  return !!(normalized.apiKey && normalized.model && normalized.baseURL);
}

/**
 * 获取指定provider的API地址
 */
export function getProviderBaseURL(provider: AIProvider): string {
  return AIProviderBaseURLs[provider] || '';
}

/**
 * 获取指定provider的默认模型
 */
export function getProviderDefaultModel(provider: AIProvider): string {
  return AIProviderDefaultModels[provider] || '';
}

/**
 * 获取请求头信息
 * 不同provider需要不同的认证方式
 */
export function getAuthHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (config.provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    case 'claude':
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    // 百度文心一言：使用AK/SK获取access_token后，通过access_token鉴权
    // 这里的apiKey应该填入获取到的access_token
    case 'qianfan':
      // 如果是AK/SK格式，需要先换取access_token，这里假设apiKey已经是access_token
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    // 腾讯混元：兼容OpenAI格式，使用API Key
    case 'hunyuan':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    case 'dashscope':
    case 'moonshot':
    case 'zhipu':
    case 'minimax':
    case 'custom':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
  }

  return headers;
}

/**
 * 构建请求体
 * 不同provider的请求格式可能略有不同
 */
export function buildRequestBody(config: AIConfig, messages: Array<{ role: string; content: string }>, stream = true): Record<string, unknown> {
  const normalized = normalizeConfig(config);
  const baseBody = {
    model: normalized.model,
    messages,
    temperature: normalized.temperature ?? DEFAULT_AI_TEMPERATURE,
    max_tokens: normalized.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
    stream,
  };

  switch (config.provider) {
    case 'openai':
    case 'moonshot':
    case 'zhipu':
    case 'minimax':
    case 'custom':
      return baseBody;

    case 'claude':
      return {
        model: normalized.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: normalized.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
        stream,
      };

    case 'qianfan':
    case 'hunyuan':
      return {
        model: normalized.model,
        messages,
        temperature: normalized.temperature ?? DEFAULT_AI_TEMPERATURE,
        max_output_tokens: normalized.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
        stream,
      };

    case 'dashscope':
      return {
        model: normalized.model,
        messages,
        temperature: normalized.temperature ?? DEFAULT_AI_TEMPERATURE,
        max_tokens: normalized.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
        stream,
      };

    default:
      return baseBody;
  }
}

/**
 * 从响应中提取内容
 * 不同provider的响应格式不同
 */
export function extractContentFromResponse(config: AIConfig, data: unknown): string {
  const response = data as Record<string, unknown>;

  switch (config.provider) {
    case 'openai':
    case 'moonshot':
    case 'zhipu':
    case 'minimax':
    case 'custom':
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0] as Record<string, unknown>;
        if (choice.message) {
          return (choice.message as Record<string, string>).content || '';
        }
      }
      break;

    case 'claude':
      if (response.content && Array.isArray(response.content) && response.content.length > 0) {
        return (response.content[0] as Record<string, string>).text || '';
      }
      break;

    case 'qianfan':
    case 'hunyuan':
      if (response.result) {
        return response.result as string;
      }
      break;

    case 'dashscope':
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0] as Record<string, unknown>;
        if (choice.message) {
          return (choice.message as Record<string, string>).content || '';
        }
      }
      break;
  }

  return '';
}

export function getAIResponseValidationError(content: string): string | null {
  const normalized = content.trim();

  if (!normalized) {
    return 'AI 未返回有效内容，请检查当前接口和模型配置。';
  }

  const checks: Array<{ pattern: RegExp; message: string }> = [
    {
      pattern: /support assistant/i,
      message: '当前接口返回的是客服/支持型助手，不是命理分析模型，请切换接口或模型。',
    },
    {
      pattern: /Cursor|Kiro|Anthropic, the AI code editor|software development workflows/i,
      message: '当前接口返回的是编程或客服领域助手，未进入命理分析模式，请检查模型来源。',
    },
    {
      pattern: /garbled characters|text encoding issue|plain English/i,
      message: '当前接口没有正确处理中文内容，疑似编码或网关配置异常。',
    },
    {
      pattern: /outside the scope of what I can assist with/i,
      message: '当前接口对命理问题进行了范围拒答，说明接入的不是预期模型。',
    },
  ];

  const hit = checks.find((item) => item.pattern.test(normalized));
  return hit?.message ?? null;
}

/**
 * 百度文心一言特殊处理：获取access_token
 * 百度文心一言需要先用AK/SK换取access_token，然后使用access_token调用API
 */
export async function getQianfanAccessToken(apiKey: string, secretKey: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
      {
        method: 'POST',
      }
    );
    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('获取百度access_token失败:', error);
    return null;
  }
}

/**
 * 获取API请求的完整URL
 * 不同provider可能需要不同的URL格式
 */
export function getAPIURL(config: AIConfig): string {
  const normalized = normalizeConfig(config);
  const baseURL = normalized.baseURL || AIProviderBaseURLs[normalized.provider];

  switch (normalized.provider) {
    case 'qianfan':
      // 百度文心一言：需要在URL中指定模型
      // 例如: https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k
      return `${baseURL}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${normalized.model}`;
    case 'hunyuan':
      // 腾讯混元
      return `${baseURL}/chat/completions`;
    case 'dashscope':
    case 'moonshot':
    case 'zhipu':
    case 'minimax':
    case 'openai':
    case 'claude':
    case 'custom':
    default:
      return `${baseURL}/chat/completions`;
  }
}

/**
 * 构建发送到 /api/ai 代理的请求体
 * 官方模式不携带 baseURL/apiKey/model，敏感信息仅存在服务端环境变量
 */
export function buildAIProxyRequestBody({
  mode,
  config,
  messages,
  temperature,
  maxTokens,
  stream = true,
}: BuildAIProxyRequestBodyInput): Record<string, unknown> {
  const normalized = normalizeConfig(config);
  const baseBody: Record<string, unknown> = {
    mode,
    messages,
    stream,
  };

  if (mode === 'official') {
    return baseBody;
  }

  return {
    ...baseBody,
    provider: normalized.provider,
    temperature: temperature ?? normalized.temperature ?? DEFAULT_AI_TEMPERATURE,
    maxTokens: normalizeMaxTokens(
      normalized.provider,
      maxTokens ?? normalized.maxTokens ?? DEFAULT_AI_MAX_TOKENS
    ),
    baseURL: normalized.baseURL,
    apiKey: normalized.apiKey,
    model: normalized.model,
  };
}

export function shouldUseStreamingAIProxy(
  config: AIConfig,
  mode: AIConfigMode = getAIConfigMode()
): boolean {
  if (mode !== 'custom') {
    return true;
  }

  return normalizeConfig(config).provider !== 'qianfan';
}

/**
 * 测试API连接
 * 使用代理API来避免浏览器的CORS跨域问题
 */
export async function testAPIConnection(
  config: AIConfig,
  mode: AIConfigMode = getAIConfigMode()
): Promise<{ success: boolean; message: string }> {
  const normalizedConfig = normalizeConfig(config);
  const runProxyConnectionTest = async (): Promise<{ success: boolean; message: string }> => {
    const probeToken = 'SUANMING_API_OK';

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildAIProxyRequestBody({
            mode,
            config: normalizedConfig,
            messages: [
              {
                role: 'system',
                content: `You are a connectivity probe. Reply with exactly ${probeToken}.`,
              },
              {
                role: 'user',
                content: `Reply with exactly ${probeToken}.`,
              },
            ],
            temperature: normalizedConfig.temperature ?? DEFAULT_AI_TEMPERATURE,
            maxTokens: normalizedConfig.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
            stream: false,
          })
        ),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const errorMessage =
          (typeof error.error === 'string' ? error.error : null) ??
          (typeof error.message === 'string' ? error.message : null) ??
          '';
        return {
          success: false,
          message: `\u8fde\u63a5\u5931\u8d25: ${response.status} ${errorMessage}`.trim(),
        };
      }

      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const content = extractContentFromResponse(normalizedConfig, data);
      const validationError = getAIResponseValidationError(content);

      if (validationError) {
        return { success: false, message: validationError };
      }

      if (content.includes(probeToken)) {
        return { success: true, message: '\u8fde\u63a5\u6210\u529f\uff01' };
      }

      return { success: true, message: '\u8fde\u63a5\u6210\u529f\uff0c\u6a21\u578b\u5df2\u8fd4\u56de\u6709\u6548\u5185\u5bb9\u3002' };
    } catch (error) {
      return {
        success: false,
        message: `\u8fde\u63a5\u5931\u8d25: ${error instanceof Error ? error.message : '\u672a\u77e5\u9519\u8bef'}`,
      };
    }
  };
  if (mode === 'custom' && normalizedConfig.provider === 'qianfan' && isAIConfigValid(config, mode)) {
    return runProxyConnectionTest();
  }

  if (mode === 'custom' && !isAIConfigValid(config, mode)) {
    return { success: false, message: '请填写完整的自定义API配置信息' };
  }

  // 百度文心一言特殊处理：需要先获取access_token
  if (mode === 'custom' && normalizedConfig.provider === 'qianfan') {
    // apiKey格式应该是 "AK;SK" 或者需要用户分别填写AK和SK
    // 这里假设apiKey字段中AK和SK用分号分隔
    const [apiKey, secretKey] = normalizedConfig.apiKey.split(';');
    if (!apiKey || !secretKey) {
      return { success: false, message: '百度文心一言需要填写API Key和Secret Key，格式：API Key;Secret Key' };
    }
    const accessToken = await getQianfanAccessToken(apiKey, secretKey);
    if (!accessToken) {
      return { success: false, message: '获取access_token失败，请检查AK/SK是否正确' };
    }
    try {
      const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${normalizedConfig.model}?access_token=${accessToken}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          temperature: DEFAULT_AI_TEMPERATURE,
        }),
      });
      if (response.ok) {
        return { success: true, message: '连接成功！' };
      } else {
        const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        return { success: false, message: `连接失败: ${response.status} ${String(error.error_msg ?? '')}` };
      }
    } catch (error) {
      return { success: false, message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  }

  try {
    // 使用代理API来避免CORS问题
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        buildAIProxyRequestBody({
          mode,
          config: normalizedConfig,
          messages: [
            { role: 'system', content: '你是命理分析助手。请只输出“命理接口可用”这六个字。' },
            { role: 'user', content: '请只输出：命理接口可用' },
          ],
          temperature: normalizedConfig.temperature ?? DEFAULT_AI_TEMPERATURE,
          maxTokens: normalizedConfig.maxTokens ?? DEFAULT_AI_MAX_TOKENS,
          stream: false,
        })
      ),
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const content = extractContentFromResponse(normalizedConfig, data);
      const validationError = getAIResponseValidationError(content);

      if (validationError) {
        return { success: false, message: validationError };
      }

      return { success: true, message: content.includes('命理接口可用') ? '连接成功！' : '连接成功，模型已返回有效内容。' };
    } else {
      const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const errorMessage =
        (typeof error.error === 'string' ? error.error : null) ??
        (typeof error.message === 'string' ? error.message : null) ??
        '';
      return { success: false, message: `连接失败: ${response.status} ${errorMessage}` };
    }
  } catch (error) {
    return { success: false, message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}
