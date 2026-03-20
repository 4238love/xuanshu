# AI Proxy Operations

This document describes the current operational behavior of the AI proxy and its related health checks.

## Endpoints

### `GET /api/health`

Readiness endpoint used by Docker, Compose, and external uptime checks.

Example response:

```json
{
  "status": "ok",
  "service": "suanming-web",
  "timestamp": "2026-03-20T12:34:56.000Z"
}
```

### `GET /api/ai`

Status endpoint used by the AI settings panel. It returns:

- `officialConfigured`
- `officialMeta`
- `defaultMode`
- `customModeAvailable`
- `sessionOnlySecrets`
- `rateLimit`
- `requestLimits`

### `POST /api/ai`

AI proxy endpoint for both official and custom-mode requests.

## Security Model

- Official mode reads `AI_OFFICIAL_*` values from server environment only.
- Official mode ignores client-supplied `temperature` and `maxTokens` overrides.
- The browser no longer persists custom API keys to `localStorage`.
- Custom API keys are stored in `sessionStorage` for the current browser session only.
- Requests must be same-origin. Cross-site calls are rejected.
- The proxy applies an in-memory per-IP rate limit.
- The proxy rejects non-JSON requests and oversized message payloads.
- Private, loopback, and local-network upstream hosts are blocked unless `AI_ALLOW_PRIVATE_UPSTREAMS=1`.
- In production, custom upstream proxying stays disabled unless `AI_ENABLE_CUSTOM_MODE=1`.
- In production, allowed custom upstream hosts must come from the built-in trusted list or `AI_ALLOWED_UPSTREAM_HOSTS`.

## Environment Variables

```env
AI_OFFICIAL_BASE_URL=
AI_OFFICIAL_API_KEY=
AI_OFFICIAL_MODEL=
AI_OFFICIAL_TEMPERATURE=0.7
AI_OFFICIAL_MAX_TOKENS=2000

AI_ENABLE_CUSTOM_MODE=0
AI_ALLOWED_UPSTREAM_HOSTS=
AI_ALLOW_PRIVATE_UPSTREAMS=0
AI_PROXY_RATE_LIMIT_WINDOW_MS=60000
AI_PROXY_RATE_LIMIT_MAX_REQUESTS=12
AI_PROXY_UPSTREAM_TIMEOUT_MS=30000
AI_PROXY_STREAM_TIMEOUT_MS=300000
AI_PROXY_MAX_REQUEST_BYTES=262144
AI_PROXY_MAX_MESSAGES=48
AI_PROXY_MAX_MESSAGE_CHARS=24000
AI_PROXY_MAX_TOTAL_CHARS=120000
```

- `AI_PROXY_UPSTREAM_TIMEOUT_MS` applies to normal non-streaming proxy calls.
- `AI_PROXY_STREAM_TIMEOUT_MS` applies to streaming chat calls and should usually be higher, otherwise long replies may be cut off mid-stream.

## Container Readiness

- `Dockerfile` uses a health check against `http://127.0.0.1:3000/api/health`.
- `docker-compose.yml` waits for the app service to become healthy before starting Caddy.
- Caddy also has its own HTTP health check.

## CI Coverage

GitHub Actions now runs:

- `npm ci`
- `npx tsc --noEmit --incremental false`
- `npm test -- --runInBand`
- `npm run build`

## Recommended Production Defaults

- Keep `AI_ENABLE_CUSTOM_MODE=0`.
- Set `AI_PROXY_DEBUG=0`.
- Use only official upstream hosts unless there is a reviewed business need.
- Rotate `AI_OFFICIAL_API_KEY` regularly.
