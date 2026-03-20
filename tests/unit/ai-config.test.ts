import {
  addConfig,
  buildAIProxyRequestBody,
  getAIConfigStorage,
  resetAIConfig,
  shouldUseStreamingAIProxy,
  testAPIConnection,
} from '@/lib/ai/config';
import {
  AI_CONFIG_STORAGE_KEY,
  AI_SESSION_SECRET_STORAGE_KEY,
  DEFAULT_AI_MAX_TOKENS,
  DEFAULT_AI_TEMPERATURE,
} from '@/types/ai';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

function installBrowserStorage() {
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();

  Object.defineProperty(global, 'window', {
    value: {},
    configurable: true,
    writable: true,
  });

  Object.defineProperty(global, 'localStorage', {
    value: localStorage,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorage,
    configurable: true,
    writable: true,
  });

  return { localStorage, sessionStorage };
}

function uninstallBrowserStorage() {
  delete (global as typeof globalThis & { window?: unknown }).window;
  delete (global as typeof globalThis & { localStorage?: unknown }).localStorage;
  delete (global as typeof globalThis & { sessionStorage?: unknown }).sessionStorage;
}

describe('AI config storage', () => {
  afterEach(() => {
    uninstallBrowserStorage();
    jest.restoreAllMocks();
  });

  test('persists custom API keys only in session storage', () => {
    const { localStorage, sessionStorage } = installBrowserStorage();

    const config = addConfig({
      name: 'My OpenAI',
      provider: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'secret-key',
      model: 'gpt-4o',
      temperature: DEFAULT_AI_TEMPERATURE,
      maxTokens: DEFAULT_AI_MAX_TOKENS,
      isDefault: true,
    });

    const persisted = JSON.parse(localStorage.getItem(AI_CONFIG_STORAGE_KEY) ?? '{}') as {
      configs?: Array<{ apiKey?: string }>;
    };
    const sessionSecrets = JSON.parse(
      sessionStorage.getItem(AI_SESSION_SECRET_STORAGE_KEY) ?? '{}'
    ) as Record<string, string>;

    expect(persisted.configs).toHaveLength(1);
    expect(persisted.configs?.[0]?.apiKey).toBe('');
    expect(sessionSecrets[config.id]).toBe('secret-key');
    expect(getAIConfigStorage().configs[0]?.apiKey).toBe('secret-key');
  });

  test('migrates legacy localStorage secrets into session storage on read', () => {
    const { localStorage, sessionStorage } = installBrowserStorage();

    localStorage.setItem(
      AI_CONFIG_STORAGE_KEY,
      JSON.stringify({
        configs: [
          {
            id: 'legacy-config',
            name: 'Legacy',
            provider: 'openai',
            baseURL: 'https://api.openai.com/v1',
            apiKey: 'legacy-secret',
            model: 'gpt-4o',
            temperature: DEFAULT_AI_TEMPERATURE,
            maxTokens: DEFAULT_AI_MAX_TOKENS,
            isDefault: true,
            createdAt: 1,
          },
        ],
        activeConfigId: 'legacy-config',
        mode: 'custom',
      })
    );

    const storage = getAIConfigStorage();
    const persisted = JSON.parse(localStorage.getItem(AI_CONFIG_STORAGE_KEY) ?? '{}') as {
      configs?: Array<{ apiKey?: string }>;
    };
    const sessionSecrets = JSON.parse(
      sessionStorage.getItem(AI_SESSION_SECRET_STORAGE_KEY) ?? '{}'
    ) as Record<string, string>;

    expect(storage.configs[0]?.apiKey).toBe('legacy-secret');
    expect(sessionSecrets['legacy-config']).toBe('legacy-secret');
    expect(persisted.configs?.[0]?.apiKey).toBe('');
  });

  test('buildAIProxyRequestBody omits custom connection details in official mode and includes them in custom mode', () => {
    installBrowserStorage();

    const config = {
      id: 'cfg-1',
      name: 'OpenAI',
      provider: 'openai' as const,
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'secret-key',
      model: 'gpt-4o',
      temperature: 0.9,
      maxTokens: 1500,
      isDefault: true,
      createdAt: 1,
    };

    const officialBody = buildAIProxyRequestBody({
      mode: 'official',
      config,
      messages: [{ role: 'user', content: 'hello' }],
      stream: false,
    });

    const customBody = buildAIProxyRequestBody({
      mode: 'custom',
      config,
      messages: [{ role: 'user', content: 'hello' }],
      stream: false,
    });

    expect(officialBody).toEqual({
      mode: 'official',
      messages: [{ role: 'user', content: 'hello' }],
      stream: false,
    });
    expect(customBody).toMatchObject({
      mode: 'custom',
      provider: 'openai',
      temperature: 0.9,
      maxTokens: 1500,
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'secret-key',
      model: 'gpt-4o',
    });
  });

  test('shouldUseStreamingAIProxy disables streaming only for qianfan custom mode', () => {
    installBrowserStorage();

    const qianfanConfig = {
      id: 'cfg-qianfan',
      name: 'Qianfan',
      provider: 'qianfan' as const,
      baseURL: 'https://aip.baidubce.com',
      apiKey: 'ak;sk',
      model: 'ernie-4.0-8k',
      temperature: DEFAULT_AI_TEMPERATURE,
      maxTokens: DEFAULT_AI_MAX_TOKENS,
      isDefault: true,
      createdAt: 1,
    };

    const openaiConfig = {
      ...qianfanConfig,
      id: 'cfg-openai',
      provider: 'openai' as const,
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'secret-key',
      model: 'gpt-4o',
    };

    expect(shouldUseStreamingAIProxy(qianfanConfig, 'custom')).toBe(false);
    expect(shouldUseStreamingAIProxy(qianfanConfig, 'official')).toBe(true);
    expect(shouldUseStreamingAIProxy(openaiConfig, 'custom')).toBe(true);
  });

  test('testAPIConnection sends qianfan checks through the local proxy', async () => {
    installBrowserStorage();

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 'SUANMING_API_OK' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const config = {
      id: 'cfg-qianfan',
      name: 'Qianfan',
      provider: 'qianfan' as const,
      baseURL: 'https://aip.baidubce.com',
      apiKey: 'ak;sk',
      model: 'ernie-4.0-8k',
      temperature: DEFAULT_AI_TEMPERATURE,
      maxTokens: DEFAULT_AI_MAX_TOKENS,
      isDefault: true,
      createdAt: 1,
    };

    const result = await testAPIConnection(config, 'custom');

    expect(result).toEqual({
      success: true,
      message: '连接成功！',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;

    expect(url).toBe('/api/ai');
    expect(init.method).toBe('POST');
    expect(body).toMatchObject({
      mode: 'custom',
      provider: 'qianfan',
      baseURL: 'https://aip.baidubce.com',
      apiKey: 'ak;sk',
      model: 'ernie-4.0-8k',
      stream: false,
    });
  });

  test('resetAIConfig clears persisted configs and session secrets', () => {
    const { localStorage, sessionStorage } = installBrowserStorage();

    addConfig({
      name: 'Reset me',
      provider: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'secret-key',
      model: 'gpt-4o',
      temperature: DEFAULT_AI_TEMPERATURE,
      maxTokens: DEFAULT_AI_MAX_TOKENS,
      isDefault: true,
    });

    resetAIConfig();

    expect(localStorage.getItem(AI_CONFIG_STORAGE_KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(AI_CONFIG_STORAGE_KEY) ?? '{}')).toEqual({
      configs: [],
      activeConfigId: null,
      mode: 'official',
    });
    expect(sessionStorage.getItem(AI_SESSION_SECRET_STORAGE_KEY)).toBeNull();
  });
});
