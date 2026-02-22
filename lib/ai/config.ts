// AI API配置管理模块 - 支持多配置管理
import {
  AIConfig,
  AIConfigMode,
  AIProvider,
  AIConfigStorage,
  AI_CONFIG_STORAGE_KEY,
  AIProviderBaseURLs,
  AIProviderDefaultModels,
  DEFAULT_AI_CONFIG_MODE,
  defaultAIConfig,
} from '@/types/ai';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      const configs = Array.isArray(parsed.configs) ? parsed.configs : [];
      const fallbackMode: AIConfigMode =
        configs.length > 0 ? 'custom' : DEFAULT_AI_CONFIG_MODE;

      return {
        configs,
        activeConfigId: typeof parsed.activeConfigId === 'string' ? parsed.activeConfigId : null,
        mode: parsed.mode === 'custom' || parsed.mode === 'official' ? parsed.mode : fallbackMode,
      };
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
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(storage));
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

  const newConfig: AIConfig = {
    ...config,
    id: generateId(),
    createdAt: Date.now(),
  };

  // 如果是第一个配置，设为默认
  if (storage.configs.length === 0) {
    newConfig.isDefault = true;
  }

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

  storage.configs[index] = {
    ...storage.configs[index],
    ...updates,
  };

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

  if (existingIndex >= 0) {
    storage.configs[existingIndex] = config;
  } else {
    storage.configs.push(config);
  }

  // 如果没有激活的配置，激活这个
  if (!storage.activeConfigId) {
    storage.activeConfigId = config.id;
  }

  saveAIConfigStorage(storage);
}

/**
 * 更新AI配置的单个字段（兼容旧接口）
 */
export function updateAIConfig(updates: Partial<AIConfig>): AIConfig {
  const current = getAIConfig();
  const updated = { ...current, ...updates, id: current.id };
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
  saveAIConfigStorage(storage);
}

/**
 * 检查API配置是否有效
 */
export function isAIConfigValid(config: AIConfig, mode: AIConfigMode = getAIConfigMode()): boolean {
  if (mode === 'official') {
    return true;
  }

  return !!(config.apiKey && config.model && config.baseURL);
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
  const baseBody = {
    model: config.model,
    messages,
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 2000,
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
        model: config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens ?? 2000,
        stream,
      };

    case 'qianfan':
    case 'hunyuan':
      return {
        model: config.model,
        messages,
        temperature: config.temperature ?? 0.7,
        max_output_tokens: config.maxTokens ?? 2000,
        stream,
      };

    case 'dashscope':
      return {
        model: config.model,
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
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
  const baseURL = config.baseURL || AIProviderBaseURLs[config.provider];

  switch (config.provider) {
    case 'qianfan':
      // 百度文心一言：需要在URL中指定模型
      // 例如: https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k
      return `${baseURL}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${config.model}`;
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
  const baseBody: Record<string, unknown> = {
    mode,
    messages,
    temperature: temperature ?? config.temperature ?? 0.7,
    maxTokens: maxTokens ?? config.maxTokens ?? 2000,
    stream,
  };

  if (mode === 'official') {
    return baseBody;
  }

  return {
    ...baseBody,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model,
  };
}

/**
 * 测试API连接
 * 使用代理API来避免浏览器的CORS跨域问题
 */
export async function testAPIConnection(
  config: AIConfig,
  mode: AIConfigMode = getAIConfigMode()
): Promise<{ success: boolean; message: string }> {
  if (mode === 'custom' && !isAIConfigValid(config, mode)) {
    return { success: false, message: '请填写完整的自定义API配置信息' };
  }

  // 百度文心一言特殊处理：需要先获取access_token
  if (mode === 'custom' && config.provider === 'qianfan') {
    // apiKey格式应该是 "AK;SK" 或者需要用户分别填写AK和SK
    // 这里假设apiKey字段中AK和SK用分号分隔
    const [apiKey, secretKey] = config.apiKey.split(';');
    if (!apiKey || !secretKey) {
      return { success: false, message: '百度文心一言需要填写API Key和Secret Key，格式：API Key;Secret Key' };
    }
    const accessToken = await getQianfanAccessToken(apiKey, secretKey);
    if (!accessToken) {
      return { success: false, message: '获取access_token失败，请检查AK/SK是否正确' };
    }
    try {
      const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${config.model}?access_token=${accessToken}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          temperature: 0.7,
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
          config,
          messages: [{ role: 'user', content: 'Hi' }],
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2000,
          stream: false,
        })
      ),
    });

    if (response.ok) {
      return { success: true, message: '连接成功！' };
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
