/**
 * AI 批注调用封装
 *
 * 走云函数 ai-proxy，客户端不接触任何模型 Key。
 * 云环境未配置时返回明确错误，由页面决定降级文案。
 */

const FUNCTION_NAME = 'ai-proxy';

function isCloudReady() {
  if (!wx.cloud) return false;
  const app = getApp();
  return Boolean(app && app.globalData && app.globalData.cloudEnabled);
}

/**
 * @param {object} options
 * @param {string} options.system   系统提示词（排盘口径与输出要求）
 * @param {Array<{role:string, content:string}>} options.messages
 * @param {number} [options.maxTokens]
 * @param {number} [options.temperature]
 * @returns {Promise<{ok:boolean, content?:string, error?:string}>}
 */
function callAI(options) {
  const payload = options || {};

  if (!isCloudReady()) {
    return Promise.resolve({
      ok: false,
      error: 'AI 批注未启用：请先在 app.js 填入云开发环境 ID，并部署 ai-proxy 云函数。',
    });
  }

  return wx.cloud
    .callFunction({
      name: FUNCTION_NAME,
      data: {
        system: payload.system || '',
        messages: payload.messages || [],
        maxTokens: payload.maxTokens,
        temperature: payload.temperature,
      },
    })
    .then((response) => {
      const result = response && response.result;
      if (!result) {
        return { ok: false, error: '云函数未返回结果' };
      }
      if (!result.ok) {
        return { ok: false, error: result.error || '云函数调用失败' };
      }
      return { ok: true, content: result.content };
    })
    .catch((error) => {
      console.error('[AI] callFunction 失败', error);
      const message = (error && (error.errMsg || error.message)) || '未知错误';
      if (message.indexOf('not found') !== -1 || message.indexOf('FunctionName') !== -1) {
        return { ok: false, error: '未找到 ai-proxy 云函数，请先在云开发控制台部署。' };
      }
      return { ok: false, error: `AI 调用失败：${message}` };
    });
}

module.exports = {
  FUNCTION_NAME,
  isCloudReady,
  callAI,
};
