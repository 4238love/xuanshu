import { NextRequest, NextResponse } from 'next/server';

// AI API代理 - 解决浏览器的CORS跨域问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseURL, apiKey, model, messages, temperature, maxTokens, stream } = body;

    console.log('[AI代理] 收到请求:', {
      baseURL,
      model,
      stream,
      messagesCount: messages?.length,
      firstMessage: messages?.[0]
    });

    if (!baseURL || !apiKey || !model) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建请求URL
    let url = baseURL;

    // 百度文心一言特殊处理：需要带access_token
    if (baseURL.includes('aip.baidubce.com')) {
      // 百度文心一言：baseURL已经包含完整URL和token
    } else if (baseURL.includes('hunyuan')) {
      // 腾讯混元特殊处理
      url = `${baseURL}/chat/completions`;
    } else {
      // 其他provider使用标准的 /chat/completions 端点
      url = `${baseURL}/chat/completions`;
    }

    console.log('[AI代理] 请求URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2000,
        stream: stream ?? false,
      }),
    });

    console.log('[AI代理] 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[AI代理] 错误响应:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorData.error?.message || errorData.message || `请求失败: ${response.status}` },
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
      // 流式响应
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
    console.error('[AI代理] 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '代理请求失败' },
      { status: 500 }
    );
  }
}
