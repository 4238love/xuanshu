const ORIGINAL_ENV = process.env;

type AIRouteModule = typeof import('@/app/api/ai/route');

function createJsonRequest(
  body: unknown,
  headers: Record<string, string> = {}
): Parameters<AIRouteModule['POST']>[0] {
  const serializedBody = JSON.stringify(body);

  return new Request('https://app.example.com/api/ai', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(serializedBody)),
      'x-forwarded-host': 'app.example.com',
      'x-forwarded-proto': 'https',
      origin: 'https://app.example.com',
      ...headers,
    },
    body: serializedBody,
  }) as unknown as Parameters<AIRouteModule['POST']>[0];
}

async function loadRouteModule(env: Record<string, string>): Promise<AIRouteModule> {
  jest.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    ...env,
  };
  return import('@/app/api/ai/route');
}

describe('/api/ai route', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  test('GET returns proxy metadata and rate-limit settings', async () => {
    const { GET } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
      AI_ENABLE_CUSTOM_MODE: '0',
      AI_PROXY_RATE_LIMIT_WINDOW_MS: '30000',
      AI_PROXY_RATE_LIMIT_MAX_REQUESTS: '7',
    });

    const response = await GET();
    const data = (await response.json()) as {
      officialConfigured: boolean;
      officialMeta: { baseURLHost: string | null; model: string | null; thirdPartyHost: boolean } | null;
      defaultMode: string;
      customModeAvailable: boolean;
      sessionOnlySecrets: boolean;
      rateLimit: { windowMs: number; maxRequests: number };
      requestLimits: {
        maxRequestBytes: number;
        maxMessages: number;
        maxMessageChars: number;
        maxTotalChars: number;
      };
    };

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      officialConfigured: true,
      defaultMode: 'official',
      customModeAvailable: false,
      sessionOnlySecrets: true,
      rateLimit: {
        windowMs: 30000,
        maxRequests: 7,
      },
      requestLimits: {
        maxRequestBytes: 262144,
        maxMessages: 48,
        maxMessageChars: 24000,
        maxTotalChars: 120000,
      },
    });
    expect(data.officialMeta).toMatchObject({
      baseURLHost: 'api.openai.com',
      model: 'gpt-4o',
      thirdPartyHost: false,
    });
  });

  test('POST rejects cross-origin requests before proxying upstream', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest(
        {
          messages: [{ role: 'user', content: 'hello' }],
        },
        {
          origin: 'https://evil.example.com',
        }
      )
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(403);
    expect(typeof data.error).toBe('string');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
  });

  test('POST keeps custom mode disabled in production unless explicitly enabled', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_ENABLE_CUSTOM_MODE: '0',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest({
        mode: 'custom',
        baseURL: 'https://api.example.com/v1',
        apiKey: 'custom-secret',
        model: 'model-x',
        messages: [{ role: 'user', content: 'hello' }],
      })
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(403);
    expect(data.error).toContain('AI_ENABLE_CUSTOM_MODE=1');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('POST rate-limits repeated requests from the same client', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
      AI_PROXY_RATE_LIMIT_MAX_REQUESTS: '1',
      AI_PROXY_RATE_LIMIT_WINDOW_MS: '60000',
    });

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const headers = { 'x-forwarded-for': '203.0.113.10' };
    const first = await POST(
      createJsonRequest(
        {
          messages: [{ role: 'user', content: 'hello' }],
          stream: false,
        },
        headers
      )
    );
    const second = await POST(
      createJsonRequest(
        {
          messages: [{ role: 'user', content: 'hello again' }],
          stream: false,
        },
        headers
      )
    );
    const secondData = (await second.json()) as { retryAfterMs?: number };

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(secondData.retryAfterMs).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('POST uses server-side official config even if client supplies custom fields', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
      AI_OFFICIAL_TEMPERATURE: '0.4',
      AI_OFFICIAL_MAX_TOKENS: '32000',
    });

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest({
        mode: 'official',
        baseURL: 'https://malicious.example.com/v1',
        apiKey: 'client-secret',
        model: 'bad-model',
        temperature: 5,
        maxTokens: 999999,
        stream: false,
        messages: [{ role: 'user', content: 'hello' }],
      })
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      model: string;
      temperature: number;
      max_tokens: number;
      stream: boolean;
    };

    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer server-secret',
      'Content-Type': 'application/json',
    });
    expect(body).toMatchObject({
      model: 'gpt-4o',
      temperature: 0.4,
      max_tokens: 16384,
      stream: false,
    });
  });

  test('POST rejects non-JSON requests', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      new Request('https://app.example.com/api/ai', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
          'content-length': '2',
          'x-forwarded-host': 'app.example.com',
          'x-forwarded-proto': 'https',
          origin: 'https://app.example.com',
        },
        body: '{}',
      }) as unknown as Parameters<AIRouteModule['POST']>[0]
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(415);
    expect(data.error).toContain('application/json');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('POST rejects unsupported message roles', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest({
        mode: 'official',
        stream: false,
        messages: [{ role: 'tool', content: 'hello' }],
      })
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(data.error).toContain('role');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('POST rejects oversized message payloads', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'production',
      AI_OFFICIAL_BASE_URL: 'https://api.openai.com/v1',
      AI_OFFICIAL_API_KEY: 'server-secret',
      AI_OFFICIAL_MODEL: 'gpt-4o',
      AI_PROXY_MAX_TOTAL_CHARS: '10',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest({
        mode: 'official',
        stream: false,
        messages: [{ role: 'user', content: 'this request body is intentionally too large' }],
      })
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(413);
    expect(typeof data.error).toBe('string');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('POST exchanges qianfan AK/SK server-side and forwards chat requests to the qianfan endpoint', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'development',
    });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'qianfan-access-token' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: 'SUANMING_API_OK' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest(
        {
          mode: 'custom',
          provider: 'qianfan',
          baseURL: 'https://aip.baidubce.com',
          apiKey: 'ak;sk',
          model: 'ernie-4.0-8k',
          stream: false,
          messages: [{ role: 'user', content: 'hello' }],
        },
        {
          'x-forwarded-host': 'localhost:3000',
          'x-forwarded-proto': 'http',
          origin: 'http://localhost:3000',
        }
      )
    );
    const data = (await response.json()) as { result?: string };

    expect(response.status).toBe(200);
    expect(data.result).toBe('SUANMING_API_OK');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(tokenUrl).toContain('https://aip.baidubce.com/oauth/2.0/token');
    expect(tokenUrl).toContain('grant_type=client_credentials');
    expect(tokenUrl).toContain('client_id=ak');
    expect(tokenUrl).toContain('client_secret=sk');
    expect(tokenInit.method).toBe('POST');

    const [chatUrl, chatInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const chatBody = JSON.parse(String(chatInit.body)) as {
      messages: Array<{ role: string; content: string }>;
      max_output_tokens: number;
      stream: boolean;
    };

    expect(chatUrl).toBe(
      'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-8k?access_token=qianfan-access-token'
    );
    expect(chatInit.headers).toEqual({
      'Content-Type': 'application/json',
    });
    expect(chatBody).toMatchObject({
      messages: [{ role: 'user', content: 'hello' }],
      max_output_tokens: 2000,
      stream: false,
    });
  });

  test('POST blocks private upstream targets in custom mode', async () => {
    const { POST } = await loadRouteModule({
      NODE_ENV: 'development',
    });

    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await POST(
      createJsonRequest(
        {
          mode: 'custom',
          baseURL: 'http://127.0.0.1:11434/v1',
          apiKey: 'custom-secret',
          model: 'local-model',
          stream: false,
          messages: [{ role: 'user', content: 'hello' }],
        },
        {
          'x-forwarded-host': 'localhost:3000',
          'x-forwarded-proto': 'http',
          origin: 'http://localhost:3000',
        }
      )
    );
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(typeof data.error).toBe('string');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
