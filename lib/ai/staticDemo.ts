/**
 * 静态演示站标记（GitHub Pages）
 *
 * GitHub Pages 只能托管静态文件，`app/api/ai` 这个代理路由在静态导出时会被排除，
 * 所以演示站上不能真的发起 AI 请求——否则用户点「AI 批注」只会拿到 404。
 * 这里统一判断并给出可读的提示，避免把网络错误直接抛给用户看。
 */

export const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === '1';

export const STATIC_DEMO_AI_MESSAGE =
  '当前是 GitHub Pages 静态演示站，AI 批注依赖服务端代理，静态托管环境下不可用。本地 npm run dev 或部署到带 Node 运行时的平台后即可使用。';

/** 静态演示站上直接抛出可读错误，供上层 catch 后展示 */
export function assertAIProxyAvailable(): void {
  if (IS_STATIC_DEMO) {
    throw new Error(STATIC_DEMO_AI_MESSAGE);
  }
}
