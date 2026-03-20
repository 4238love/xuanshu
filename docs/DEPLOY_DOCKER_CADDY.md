# Docker + Caddy 部署指南

本文档对应当前项目内的这 3 个文件：

- `Dockerfile`
- `docker-compose.yml`
- `Caddyfile`

部署目标：

- Next.js 应用容器：`suanming-app`
- Caddy 反向代理与 HTTPS：`suanming-caddy`
- 官方 AI Key 仅放服务器环境变量，不暴露前端

## 1. 前置条件

服务器建议：

- Ubuntu 22.04+（或同级 Linux）
- 2C4G 起步
- 已安装 Docker 与 Docker Compose
- 域名已解析到服务器公网 IP
- 安全组/防火墙已放行 `80` 和 `443`

## 2. 代码与文件准备

进入服务器目录并拉取代码：

```bash
git clone <你的仓库地址> suanming
cd suanming
```

确认文件存在：

- `Dockerfile`
- `docker-compose.yml`
- `Caddyfile`
- `.env.example`

## 3. 配置域名（Caddy）

编辑 `Caddyfile`，把 `your-domain.com` 改成你的真实域名：

```caddy
your-domain.com {
  encode gzip zstd
  reverse_proxy app:3000
}
```

如果你还要支持 `www`，可改成：

```caddy
your-domain.com, www.your-domain.com {
  encode gzip zstd
  reverse_proxy app:3000
}
```

## 4. 配置官方 AI 环境变量

复制模板并填写：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
AI_OFFICIAL_BASE_URL=https://api.openai.com/v1
AI_OFFICIAL_API_KEY=你的官方Key
AI_OFFICIAL_MODEL=gpt-4o
AI_OFFICIAL_TEMPERATURE=0.7
AI_OFFICIAL_MAX_TOKENS=2000
AI_ENABLE_CUSTOM_MODE=0
AI_ALLOWED_UPSTREAM_HOSTS=
AI_ALLOW_PRIVATE_UPSTREAMS=0
AI_PROXY_RATE_LIMIT_WINDOW_MS=60000
AI_PROXY_RATE_LIMIT_MAX_REQUESTS=12
```

说明：

- 这几个变量只在服务器容器内使用。
- 前端设置面板不会显示官方 Key。
- `/api/ai` 官方模式下不会从前端读取 `apiKey/baseURL/model`。

## 5. 首次部署

在项目根目录执行：

```bash
docker compose up -d --build
```

查看容器状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f app
docker compose logs -f caddy
```

## 6. 验证上线

1. 访问你的域名首页，确认站点可打开。  
2. 打开接口检查官方配置状态：

```bash
curl https://你的域名/api/ai
```

预期返回：

```json
{
  "officialConfigured": true,
  "defaultMode": "official"
}
```

3. 在前端 AI 设置中切到“官方 API”，测试连接应成功。

## 7. 日常更新

拉取新代码并滚动更新：

```bash
git pull
docker compose up -d --build
```

## 8. 回滚（常用）

```bash
git log --oneline
git checkout <旧版本commit/tag>
docker compose up -d --build
```

## 9. 常见问题

1. 证书签发失败  
常见原因：域名未解析到本机，或 `80/443` 未开放。

2. AI 报“官方 API 未配置”  
检查 `.env` 是否在项目根目录且变量名拼写正确，再重启：

```bash
docker compose up -d --build
```

3. 页面 502  
检查应用容器是否正常：

```bash
docker compose logs -f app
```

## 10. 安全建议

- 不要把 `.env` 提交到 Git。
- 生产保持 `AI_PROXY_DEBUG=0`（已在 compose 中固定）。
- 定期轮换 `AI_OFFICIAL_API_KEY`。
