# 部署文档

## 概述

本文档详细说明易学排盘系统的部署流程,包括开发环境、生产环境的配置和部署步骤。

## 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [常见问题](#常见问题)

---

## 环境要求

### 基础环境

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.17.0 | 推荐使用 LTS 版本 |
| npm | >= 9.0.0 | 或使用 pnpm/yarn |
| Git | >= 2.0 | 用于版本控制 |

### 系统要求

- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **内存**: 最低 2GB, 推荐 4GB+
- **磁盘空间**: 最低 500MB

### 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 开发环境部署

### 1. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/your-username/suanming.git

# 或使用 SSH
git clone git@github.com:your-username/suanming.git

cd suanming/new
```

### 2. 安装依赖

```bash
npm install

# 或使用 pnpm (推荐,更快)
pnpm install

# 或使用 yarn
yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 4. 开发环境配置

#### 环境变量

创建 `.env.local` 文件(可选):

```env
# 开发环境端口
PORT=3000

# API 基础路径(如果有后端API)
NEXT_PUBLIC_API_URL=http://localhost:3001

# 是否启用调试模式
NEXT_PUBLIC_DEBUG=true
```

#### 代码检查

```bash
# 运行 ESLint
npm run lint

# 自动修复问题
npm run lint -- --fix
```

#### TypeScript 类型检查

```bash
# 检查类型错误
npx tsc --noEmit
```

---

## 生产环境部署

### 方式一: 传统部署 (Node.js)

#### 1. 构建项目

```bash
npm run build
```

构建产物将生成在 `.next` 目录。

#### 2. 启动生产服务器

```bash
npm start
```

默认端口为 3000,可通过环境变量修改:

```bash
PORT=8080 npm start
```

#### 3. 使用 PM2 管理进程

安装 PM2:

```bash
npm install -g pm2
```

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'suanming',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

启动应用:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

常用 PM2 命令:

```bash
pm2 list          # 查看进程列表
pm2 logs suanming # 查看日志
pm2 restart suanming # 重启应用
pm2 stop suanming    # 停止应用
pm2 delete suanming  # 删除应用
```

### 方式二: 静态导出部署

如果不需要服务端渲染,可以导出为静态网站:

#### 1. 修改 `next.config.ts`

```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

#### 2. 构建静态文件

```bash
npm run build
```

静态文件将生成在 `out` 目录。

#### 3. 部署到静态托管服务

可以部署到:
- **Vercel**: 推荐,零配置部署
- **Netlify**: 支持自动部署
- **GitHub Pages**: 免费托管
- **Nginx**: 自建服务器

### 方式三: Vercel 部署 (推荐)

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 4. 通过 GitHub 自动部署

1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置构建设置(通常自动检测)
4. 点击部署

每次推送到 main 分支将自动触发部署。

---

## Docker 部署

### 1. 创建 Dockerfile

```dockerfile
# 使用官方 Node.js 镜像
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. 创建 .dockerignore

```
node_modules
.next
.git
.gitignore
README.md
.env*.local
```

### 3. 构建镜像

```bash
docker build -t suanming:latest .
```

### 4. 运行容器

```bash
docker run -p 3000:3000 suanming:latest
```

### 5. 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

启动服务:

```bash
docker-compose up -d
```

---

## Nginx 反向代理配置

如果使用 Nginx 作为反向代理:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用 HTTPS (使用 Let's Encrypt):

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 性能优化

### 1. 启用压缩

Next.js 默认启用 gzip 压缩,可在 `next.config.ts` 中配置:

```typescript
const nextConfig = {
  compress: true
};
```

### 2. 图片优化

使用 Next.js Image 组件:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### 3. 代码分割

Next.js 自动进行代码分割,可使用动态导入进一步优化:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>加载中...</p>
});
```

### 4. 缓存策略

在 Nginx 中配置静态资源缓存:

```nginx
location /_next/static/ {
    alias /path/to/app/.next/static/;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}
```

---

## 监控和日志

### 1. 应用监控

推荐使用:
- **Vercel Analytics**: Vercel 平台内置
- **Google Analytics**: 网站流量分析
- **Sentry**: 错误追踪

### 2. 日志管理

使用 PM2 查看日志:

```bash
pm2 logs suanming --lines 100
```

或使用专业日志服务:
- **Logtail**
- **Papertrail**
- **CloudWatch** (AWS)

---

## 常见问题

### Q1: 构建失败,提示内存不足

**解决方案**:

```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Q2: 端口被占用

**解决方案**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Q3: 生产环境样式丢失

**解决方案**:

确保 Tailwind CSS 配置正确:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ]
};
```

### Q4: API 请求跨域问题

**解决方案**:

在 `next.config.ts` 中配置代理:

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend-api.com/:path*'
      }
    ];
  }
};
```

### Q5: 部署后页面空白

**解决方案**:

1. 检查浏览器控制台错误
2. 确认环境变量配置正确
3. 检查 `basePath` 配置
4. 清除浏览器缓存

---

## 安全建议

### 1. 环境变量管理

- 不要将 `.env.local` 提交到 Git
- 使用平台提供的环境变量管理(Vercel/Netlify)
- 敏感信息使用加密存储

### 2. HTTPS 配置

生产环境必须启用 HTTPS:

```nginx
# 强制 HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 安全头配置

在 `next.config.ts` 中添加:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

## 更新和维护

### 更新依赖

```bash
# 检查过期依赖
npm outdated

# 更新所有依赖
npm update

# 更新 Next.js
npm install next@latest react@latest react-dom@latest
```

### 数据库备份(如果使用)

定期备份数据:

```bash
# 示例: MongoDB 备份
mongodump --uri="mongodb://localhost:27017/suanming" --out=/backup/$(date +%Y%m%d)
```

### 回滚策略

使用 Git 标签管理版本:

```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 回滚到指定版本
git checkout v1.0.0
npm run build
pm2 restart suanming
```

---

## 技术支持

如遇到部署问题,请:

1. 查看项目 [GitHub Issues](https://github.com/your-username/suanming/issues)
2. 参考 [Next.js 官方文档](https://nextjs.org/docs)
3. 联系技术支持团队

---

© 2024 易学排盘系统 · 部署文档
## 2026-03 Operational Notes

- `GET /api/health` is the readiness endpoint used by Docker health checks.
- Keep `AI_ENABLE_CUSTOM_MODE=0` in production unless custom upstream proxying is explicitly required.
- Browser-entered custom API keys are session-scoped and are no longer persisted to `localStorage`.
- CI now verifies `npx tsc --noEmit --incremental false`, `npm test -- --runInBand`, and `npm run build`.
- Detailed proxy, environment, and health-check guidance lives in [AI_PROXY_OPERATIONS.md](./AI_PROXY_OPERATIONS.md).
