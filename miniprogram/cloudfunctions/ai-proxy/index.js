/**
 * AI 批注云函数
 *
 * 模型 Key 只存在云函数环境变量里，不下发到客户端。
 * 在云开发控制台为该函数配置：
 *   AI_BASE_URL  https://api.openai.com/v1     （OpenAI 兼容地址，不带 /chat/completions）
 *   AI_API_KEY   你的服务端 Key
 *   AI_MODEL     例如 gpt-4o-mini / hunyuan-turbo / deepseek-chat
 *   AI_MAX_TOKENS 可选，默认 2000
 *
 * 调用：wx.cloud.callFunction({ name: 'ai-proxy', data: { system, messages } })
 */

const https = require('https');
const { URL } = require('url');

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 24000;
const MAX_TOTAL_CHARS = 60000;
const MAX_TOKENS_LIMIT = 4000;
const REQUEST_TIMEOUT_MS = 55000;

const ALLOWED_ROLES = ['system', 'user', 'assistant'];

function fail(error) {
  return { ok: false, error };
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'messages 不能为空' };
  }
  if (messages.length > MAX_MESSAGES) {
    return { error: `消息条数超过限制（最多 ${MAX_MESSAGES} 条）` };
  }

  const normalized = [];
  let total = 0;

  for (const item of messages) {
    if (!item || typeof item !== 'object') {
      return { error: 'messages 中存在无效项' };
    }
    const role = item.role;
    const content = item.content;

    if (typeof role !== 'string' || ALLOWED_ROLES.indexOf(role) === -1) {
      return { error: `不支持的 role：${role}` };
    }
    if (typeof content !== 'string' || !content.trim()) {
      return { error: '消息内容不能为空' };
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      return { error: '单条消息过长，请缩短后重试' };
    }

    total += content.length;
    if (total > MAX_TOTAL_CHARS) {
      return { error: '消息总长度超过限制，请缩短后重试' };
    }

    normalized.push({ role, content });
  }

  return { messages: normalized };
}

/** 用 https 模块发请求，云函数运行时不一定有全局 fetch */
function requestJSON(targetUrl, headers, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const payload = Buffer.from(JSON.stringify(body), 'utf8');

    const request = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: Object.assign(
          {
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
          },
          headers
        ),
        timeout: timeoutMs,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let parsed = null;
          try {
            parsed = JSON.parse(text);
          } catch (error) {
            parsed = null;
          }
          resolve({ status: response.statusCode || 0, text, parsed });
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error('上游响应超时'));
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

function extractContent(payload) {
  if (!payload) return '';
  const choices = payload.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const message = choices[0].message;
    if (message && typeof message.content === 'string') return message.content;
    if (typeof choices[0].text === 'string') return choices[0].text;
  }
  return '';
}

exports.main = async (event) => {
  const baseURL = (process.env.AI_BASE_URL || '').trim().replace(/\/+$/, '');
  const apiKey = (process.env.AI_API_KEY || '').trim();
  const model = (process.env.AI_MODEL || '').trim();

  if (!baseURL || !apiKey || !model) {
    return fail('云函数未配置 AI_BASE_URL / AI_API_KEY / AI_MODEL');
  }

  const validation = validateMessages(event && event.messages);
  if (validation.error) {
    return fail(validation.error);
  }

  const systemText = typeof event.system === 'string' ? event.system.trim() : '';
  const messages = systemText
    ? [{ role: 'system', content: systemText }].concat(validation.messages)
    : validation.messages;

  const requestedMaxTokens = Number(event.maxTokens);
  const maxTokens =
    Number.isFinite(requestedMaxTokens) && requestedMaxTokens > 0
      ? Math.min(Math.floor(requestedMaxTokens), MAX_TOKENS_LIMIT)
      : Number(process.env.AI_MAX_TOKENS) || 2000;

  const requestedTemperature = Number(event.temperature);
  const temperature =
    Number.isFinite(requestedTemperature) && requestedTemperature >= 0 && requestedTemperature <= 2
      ? requestedTemperature
      : 0.7;

  try {
    const response = await requestJSON(
      `${baseURL}/chat/completions`,
      { Authorization: `Bearer ${apiKey}` },
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      },
      REQUEST_TIMEOUT_MS
    );

    if (response.status < 200 || response.status >= 300) {
      const upstreamMessage =
        (response.parsed &&
          response.parsed.error &&
          (response.parsed.error.message || response.parsed.error)) ||
        `上游返回 ${response.status}`;
      console.error('[ai-proxy] 上游错误', response.status, String(upstreamMessage).slice(0, 300));
      return fail(`模型服务返回错误：${upstreamMessage}`);
    }

    const content = extractContent(response.parsed);
    if (!content) {
      return fail('模型未返回内容，请稍后重试');
    }

    return { ok: true, content, model };
  } catch (error) {
    console.error('[ai-proxy] 请求失败', error && error.message);
    const message = error && error.message ? error.message : '未知错误';
    if (/timeout/i.test(message)) {
      return fail('模型响应超时，请缩短问题后重试');
    }
    return fail(`请求模型服务失败：${message}`);
  }
};
