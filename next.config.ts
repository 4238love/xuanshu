import type { NextConfig } from "next";

/**
 * 两套构建产物：
 *
 * 1. 默认（npm run build）—— output: standalone，给 Docker / 自建服务器用，
 *    带 /api/ai 代理，AI 批注可用。
 * 2. GitHub Pages（npm run build:pages）—— output: export，纯静态文件，没有服务端，
 *    所以 /api 路由会在构建时被临时移出（见 scripts/build-pages.mjs），
 *    前端用 NEXT_PUBLIC_STATIC_DEMO 识别并友好降级。
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// 项目页部署在 https://<user>.github.io/<repo>/ 下需要 basePath；根路径时留空
const basePath = rawBasePath.replace(/\/+$/, "");

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // ⚠️ 不要在这里覆盖 distDir：Next 一旦发现 distDir 被改成非 .next，
      // 就把静态产物直接写进 distDir 而不再生成 out/（见 next/dist/build/index.js
      // 的 hasCustomExportOutput 分支），Pages 会拿不到产物。
      basePath: basePath || undefined,
      // 静态托管按目录索引访问，/bazi 要导出成 bazi/index.html
      trailingSlash: true,
      // 静态导出没有图片优化服务
      images: { unoptimized: true },
    }
  : {
      output: "standalone",
    };

export default nextConfig;
