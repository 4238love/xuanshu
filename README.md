# 玄数排盘

基于 Next.js 16、React 19、TypeScript 构建的中文术数排盘工作台。当前仓库已经实现 6 个独立排盘模块、统一的 AI 批注能力、健康检查接口，以及可直接用于容器化部署的 `Dockerfile`、`docker-compose.yml` 和 `Caddyfile`。

**在线演示**：<https://jetamie.github.io/xuanshu/> —— 由 GitHub Pages 托管静态导出产物，六大排盘模块可直接使用；AI 批注依赖服务端代理，在静态站上会自动降级提示（本地或自建服务器部署时可用）。

**微信小程序版**：见 [`miniprogram/`](./miniprogram/)，与 Web 端共用同一份排盘算法源码。

## 当前状态

- `npm run lint` 已通过，ESLint 9 使用 Flat Config。
- `npx tsc --noEmit --incremental false` 已通过。
- `npm test -- --runInBand` 已通过，默认 Jest 测试集可正常运行。
- `npm run build` 已通过，可生成 Next.js standalone 生产构建。
- 当前路由包含 6 个静态排盘页面和 2 个服务端 API 路由：`/api/ai`、`/api/health`。

## 功能概览

| 模块 | 路由 | 当前能力 |
| --- | --- | --- |
| 首页 | `/` | 六大模块入口，统一工作台导航 |
| 八字排盘 | `/bazi` | 四柱、十神、五行、喜用神、大运流年、真太阳时、文本复制、JSON/图片/打印导出 |
| 六爻排盘 | `/liuyao` | 自动起卦、日期起卦、手动起卦，本卦/变卦/互卦/综卦，六亲六神，神煞开关 |
| 梅花易数 | `/meihua` | 本卦、变卦、互卦、错卦、综卦，体用关系，爻辞展示 |
| 大六壬 | `/daliuren` | 天地盘、四课三传、月将/月将神、课体总览 |
| 奇门遁甲 | `/qimen` | 转盘奇门、九宫、值符值使、三奇六仪，年/月/日/时家高级配置 |
| 紫微斗数 | `/ziwei` | 十二宫、四化、大限小限、五行局与节气口径等高级参数 |
| AI 批注 | 各结果页浮层 | 官方模式 + 自定义模式，流式回复，会话级密钥存储，代理安全限制 |

## 当前实现重点

- 6 个排盘模块都已经有独立页面和结果展示，不再强行共用同一套表单叙事。
- 八字模块的能力最完整，除了命盘分析，还支持真太阳时、神煞和干支留意开关、导出与打印。
- AI 能力通过 `app/api/ai` 统一代理，前端结果页通过浮层助手发起分析请求。
- 健康检查接口为 `GET /api/health`，Docker 与 Compose 都依赖它做 readiness 检查。
- `next.config.ts` 已启用 `output: "standalone"`，适合 Node 单容器部署。

## 技术栈

- Next.js `16.1.6` + App Router
- React `19.2.3`
- TypeScript `5`
- Tailwind CSS `4`
- `lunar-javascript` 农历与干支计算
- Jest + ts-jest 测试
- Docker + Caddy 容器化部署

## 目录结构

```text
app/                    Next.js 页面与 API 路由
components/
  ai/                   AI 助手与设置面板
  shared/               通用共享组件
  ui/                   表单、结果页、导出、布局组件
hooks/                  自定义 React Hooks
lib/
  ai/                   AI 配置、请求组装、传输处理
  bazi/                 八字算法
  liuyao/               六爻算法
  meihua/               梅花易数算法
  daliuren/             大六壬算法
  qimen/                奇门遁甲算法
  ziwei/                紫微斗数算法
  utils/                日期、真太阳时、通用计算工具
types/                  TypeScript 类型定义
tests/                  Jest 测试与对比测试
docs/                   API、部署、运维、设计等文档
Dockerfile              生产镜像构建
docker-compose.yml      应用 + Caddy 编排
Caddyfile               反向代理与 HTTPS 配置
```

## 本地开发

### 环境要求

- Node.js `20+`
- npm `9+`
- 可选: Docker / Docker Compose

### 启动步骤

在仓库根目录执行:

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

启动后访问 `http://localhost:3000`。

说明:

- 即使未配置官方 AI 环境变量，六大排盘页面也可以正常使用。
- 未配置 AI 时，结果页里的 AI 助手会显示为待配置状态。

### 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产包 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 lint |
| `npm test` | 运行全部 Jest 测试 |
| `npm run test:unit` | 运行单元测试 |
| `npm run test:integration` | 运行集成测试 |
| `npm run test:comparison` | 运行对比测试 |
| `npm run test:coverage` | 生成覆盖率报告 |
| `npx tsc --noEmit --incremental false` | 运行 TypeScript 类型检查 |

推荐在提交前至少执行:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test -- --runInBand
npm run build
```

## AI 配置与安全模型

AI 代理入口位于 `app/api/ai/route.ts`，目前支持两种模式:

- `official`: 只读取服务端环境变量中的 `AI_OFFICIAL_*` 配置。
- `custom`: 浏览器端维护多套 provider 配置，通过代理转发到外部模型服务。

当前代码里已内置或兼容的 provider:

- `openai`
- `claude`
- `qianfan`
- `dashscope`
- `hunyuan`
- `moonshot`
- `zhipu`
- `minimax`
- `custom`

安全策略:

- 官方模式 API Key 只保存在服务端环境变量中。
- 浏览器输入的自定义 API Key 只写入 `sessionStorage`，不再持久化到 `localStorage`。
- `POST /api/ai` 仅接受同源请求。
- 代理内置按 IP 的内存限流、请求体大小限制、消息条数限制、消息长度限制。
- 私网、回环、本地域名上游默认被拦截，除非显式开启 `AI_ALLOW_PRIVATE_UPSTREAMS=1`。
- 生产环境默认禁用自定义上游代理，只有配置 `AI_ENABLE_CUSTOM_MODE=1` 后才会开启。

最小可用环境变量示例:

```env
AI_OFFICIAL_BASE_URL=https://api.openai.com/v1
AI_OFFICIAL_API_KEY=your_server_side_key
AI_OFFICIAL_MODEL=gpt-4o
AI_OFFICIAL_TEMPERATURE=0.7
AI_OFFICIAL_MAX_TOKENS=2000

AI_ENABLE_CUSTOM_MODE=0
AI_PROXY_ALLOWED_ORIGINS=
AI_ALLOWED_UPSTREAM_HOSTS=
AI_ALLOW_PRIVATE_UPSTREAMS=0
```

完整变量列表见 [.env.example](./.env.example) 和 [docs/AI_PROXY_OPERATIONS.md](./docs/AI_PROXY_OPERATIONS.md)。

## API 与运维接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查与 readiness 探针 |
| `GET` | `/api/ai` | 返回 AI 官方配置状态、默认模式、请求限制等元信息 |
| `POST` | `/api/ai` | AI 代理请求入口，支持流式与非流式回复 |

## 测试

Jest 测试主要位于以下目录:

- `tests/unit`
- `tests/integration`
- `tests/comparison`

默认 `npm test` 只会执行 `tests/` 下匹配 `*.test.ts` 和 `*.test.tsx` 的 Jest 用例。

仓库里还保留了一批脚本式校验文件，例如 `tests/test-bazi.js`、`tests/test-liuyao-complete.ts`、`tests/run-tests.ts`。这些文件更适合做算法验证、输出比对或手工调试，不属于默认 Jest 门禁。

建议在提交前至少执行:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test -- --runInBand
npm run build
```

## 微信小程序版

`miniprogram/` 是原生小程序实现，**排盘算法层与 Web 端共用同一份 `lib/*.ts` 源码**——小程序里的 `lib/` 是它的编译产物，不手工维护。

- 已完成：首页、八字排盘（表单 / 结果 / 复制报告）、AI 批注云函数
- 算法层同步：`npm run mp:build`
- 自检与冒烟：`npm run mp:check` / `npm run mp:smoke` / `npm run mp:verify`
- 部署与云函数配置见 [miniprogram/README.md](./miniprogram/README.md)

## 部署

### GitHub Pages（静态演示站）

`push` 到 `main` 会自动触发 [`.github/workflows/pages.yml`](./.github/workflows/pages.yml)，构建静态导出并发布到 <https://jetamie.github.io/xuanshu/>。

本地复现同样的构建：

```bash
NEXT_PUBLIC_BASE_PATH=/xuanshu npm run build:pages   # 产物在 out/
```

三个要点：

- `scripts/build-pages.mjs` 会在构建期间把 `app/api` 临时移出——静态导出不支持带 `POST` 的 route handler。构建结束（无论成败）自动还原。
- 静态站没有服务端，前端通过 `NEXT_PUBLIC_STATIC_DEMO` 识别并给出可读提示，不会向不存在的 `/api/ai` 发请求。
- 仓库设置里 Pages 的 Source 需为 **GitHub Actions**（首次已配置好）。

### Node 直接部署

```bash
npm install
npm run build
npm start
```

### Docker 单容器部署

```bash
docker build -t suanming .
docker run --env-file .env -p 3000:3000 suanming
```

### Docker Compose + Caddy

1. 把 [Caddyfile](./Caddyfile) 里的 `your-domain.com` 改成你的真实域名。
2. 复制 `.env.example` 为 `.env`，填入服务器端 AI 配置。
3. 在项目根目录执行:

```bash
docker compose up -d --build
```

当前 Compose 编排包含:

- `app`: 容器名 `suanming-app`，Next.js 生产容器，内部监听 `3000`
- `caddy`: 容器名 `suanming-caddy`，反向代理，暴露 `80/443`

健康检查链路:

- `app` 通过 `GET /api/health` 检查自身可用性
- `caddy` 等待 `app` 健康后再启动

详细说明见 [docs/DEPLOY_DOCKER_CADDY.md](./docs/DEPLOY_DOCKER_CADDY.md)。

## 文档

- [API 文档](./docs/API.md)
- [用户手册](./docs/USER_GUIDE.md)
- [部署文档](./docs/DEPLOYMENT.md)
- [Docker + Caddy 部署](./docs/DEPLOY_DOCKER_CADDY.md)
- [AI 代理运维说明](./docs/AI_PROXY_OPERATIONS.md)
- [设计系统说明](./docs/DESIGN_SYSTEM.md)
- [代码质量报告](./docs/CODE_QUALITY.md)
- [发布检查清单](./docs/RELEASE_CHECKLIST.md)
- [神煞配置说明](./docs/SHENSHA_CONFIG_GUIDE.md)

## 免责声明

本项目用于产品实现、学习研究和功能演示，不应替代专业建议。请理性看待所有排盘结果与 AI 解读内容。
