import { NextRequest, NextResponse } from 'next/server';

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

function buildCompletionsURL(baseURL: string): string {
  if (baseURL.includes('aip.baidubce.com')) {
    // Baidu Wenxin uses full endpoint URL with token in baseURL
    return baseURL;
  }
  return `${baseURL}/chat/completions`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseURL, apiKey, model, messages, temperature, maxTokens, stream } = body;

    debugLog('[AI代理] 收到请求', {
      baseURL,
      model,
      stream,
      messagesCount: messages?.length,
    });

    if (!baseURL || !apiKey || !model) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const url = buildCompletionsURL(baseURL);
    debugLog('[AI代理] 请求URL', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2000,
        stream: stream ?? false,
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
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          {
            error:
              errorData.error?.message ||
              errorData.message ||
              `请求失败: ${response.status}`,
          },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: `请求失败: ${response.status} - ${errorText.slice(0, 200)}` },
          { status: response.status }
        );
      }
    }

    if (stream) {
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
