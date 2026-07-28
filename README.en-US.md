# Xuanshu Paipan (玄数排盘)

A Chinese metaphysical calculation (Paipan) workbench built with Next.js 16, React 19, and TypeScript. The current repository implements 6 independent calculation modules, unified AI annotation capabilities, a health check interface, and a `Dockerfile`, `docker-compose.yml`, and `Caddyfile` ready for containerized deployment.

## Current Status

- `npm run lint` passed; ESLint 9 uses Flat Config.
- `npx tsc --noEmit --incremental false` passed.
- `npm test -- --runInBand` passed; default Jest test sets run normally.
- `npm run build` passed; generates a Next.js standalone production build.
- Current routing includes 6 static calculation pages and 2 server-side API routes: `/api/ai` and `/api/health`.

## Functional Overview

| Module | Route | Current Capabilities |
| --- | --- | --- |
| Home | `/` | Entry point for the six modules, unified workbench navigation |
| Bazi (Eight Characters) | `/bazi` | Four Pillars, Ten Gods, Five Elements, Useful God (Xi Yong Shen), Great Luck/Annual Pillars, True Solar Time, text copying, JSON/Image/Print export |
| Liuyao (Six Lines) | `/liuyao` | Auto-casting, date-based casting, manual casting, Original/Changed/Mutual/Opposite hexagrams, Six Relatives & Six Animals, Shen Sha toggles |
| Meihua Yishu (Plum Blossom) | `/meihua` | Original, Changed, Mutual, Error, and Opposite hexagrams, Ti-Yong relationship, line statement display |
| Da Liu Ren | `/daliuren` | Heaven and Earth Plates, Four Lessons and Three Transmissions, Monthly General/God, Lesson Type overview |
| Qimen Dunjia | `/qimen` | Rotating Plate Qimen, Nine Palaces, Value Symbol/Envoy, Three Wonders & Six Instruments, advanced configurations for Year/Month/Day/Hour houses |
| Ziwei Doushu | `/ziwei` | Twelve Palaces, Four Transformations, Great Limit/Small Limit, Five Element Bureaus, Solar Term parameters, etc. |
| AI Annotation | Floating layer on result pages | Official mode + Custom mode, streaming responses, session-level key storage, proxy security restrictions |

## Current Implementation Focus

- Each of the 6 calculation modules has an independent page and result display, moving away from a forced shared form narrative.
- The Bazi module is the most complete, supporting not only chart analysis but also True Solar Time, Shen Sha and Gan-Zhi toggles, exporting, and printing.
- AI capabilities are unified via `app/api/ai`; the frontend result pages initiate analysis requests via a floating assistant.
- The health check interface is `GET /api/health`, which Docker and Compose rely on for readiness checks.
- `next.config.ts` has `output: "standalone"` enabled, suitable for single-container Node deployment.

## Tech Stack

- Next.js `16.1.6` + App Router
- React `19.2.3`
- TypeScript `5`
- Tailwind CSS `4`
- `lunar-javascript` for Lunar calendar and Gan-Zhi calculations
- Jest + ts-jest for testing
- Docker + Caddy for containerized deployment

## Directory Structure

```text
app/                    Next.js pages and API routes
components/
  ai/                   AI assistant and settings panel
  shared/               General shared components
  ui/                   Forms, result pages, export, and layout components
hooks/                  Custom React Hooks
lib/
  ai/                   AI configuration, request assembly, and transport handling
  bazi/                 Bazi algorithms
  liuyao/               Liuyao algorithms
  meihua/               Meihua Yishu algorithms
  daliuren/             Da Liu Ren algorithms
  qimen/                Qimen Dunjia algorithms
  ziwei/                Ziwei Doushu algorithms
  utils/                Date, True Solar Time, and general calculation utilities
types/                  TypeScript type definitions
tests/                  Jest tests and comparison tests
docs/                   Documentation for API, deployment, operations, design, etc.
Dockerfile              Production image build
docker-compose.yml      App + Caddy orchestration
Caddyfile               Reverse proxy and HTTPS configuration
```

## Local Development

### Environment Requirements

- Node.js `20+`
- npm `9+`
- Optional: Docker / Docker Compose

### Startup Steps

Execute in the repository root:

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

After starting, visit `http://localhost:3000`.

Note:
- The six calculation pages are fully functional even if official AI environment variables are not configured.
- When AI is not configured, the AI assistant on the result pages will show as "Pending Configuration."

### Common Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run lint |
| `npm test` | Run all Jest tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:comparison` | Run comparison tests |
| `npm run test:coverage` | Generate coverage report |
| `npx tsc --noEmit --incremental false` | Run TypeScript type check |

It is recommended to run at least these before committing:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test -- --runInBand
npm run build
```

## AI Configuration and Security Model

The AI proxy entry point is located at `app/api/ai/route.ts` and currently supports two modes:

- `official`: Only reads `AI_OFFICIAL_*` configurations from server-side environment variables.
- `custom`: The browser maintains multiple provider configurations, forwarded via proxy to external model services.

Built-in or compatible providers:

- `openai`
- `claude`
- `qianfan`
- `dashscope`
- `hunyuan`
- `moonshot`
- `zhipu`
- `minimax`
- `custom`

Security Policies:

- Official mode API Keys are stored only in server-side environment variables.
- Custom API Keys entered in the browser are written only to `sessionStorage` and are not persisted to `localStorage`.
- `POST /api/ai` only accepts same-origin requests.
- The proxy includes built-in in-memory rate limiting by IP, request body size limits, message count limits, and message length limits.
- Private network, loopback, and local domain upstreams are intercepted by default unless `AI_ALLOW_PRIVATE_UPSTREAMS=1` is explicitly enabled.
- Custom upstream proxies are disabled by default in production and are only enabled after configuring `AI_ENABLE_CUSTOM_MODE=1`.

Minimum viable environment variable example:

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

For the complete variable list, see [.env.example](./.env.example) and [docs/AI_PROXY_OPERATIONS.md](./docs/AI_PROXY_OPERATIONS.md).

## API and Operations Interfaces

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check and readiness probe |
| `GET` | `/api/ai` | Returns AI official config status, default mode, request limits, and other metadata |
| `POST` | `/api/ai` | AI proxy request entry point; supports streaming and non-streaming responses |

## Testing

Jest tests are primarily located in the following directories:

- `tests/unit`
- `tests/integration`
- `tests/comparison`

By default, `npm test` only executes Jest cases matching `*.test.ts` and `*.test.tsx` under `tests/`.

The repository also retains a set of script-style validation files, such as `tests/test-bazi.js`, `tests/test-liuyao-complete.ts`, and `tests/run-tests.ts`. These are better suited for algorithm verification, output comparison, or manual debugging and are not part of the default Jest gates.

It is recommended to run at least these before committing:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test -- --runInBand
npm run build
```

## Deployment

### Direct Node Deployment

```bash
npm install
npm run build
npm start
```

### Docker Single Container Deployment

```bash
docker build -t suanming .
docker run --env-file .env -p 3000:3000 suanming
```

### Docker Compose + Caddy

1. Change `your-domain.com` in the [Caddyfile](./Caddyfile) to your actual domain.
2. Copy `.env.example` to `.env` and fill in the server-side AI configuration.
3. Run in the project root:

```bash
docker compose up -d --build
```

The current Compose orchestration includes:

- `app`: Container name `suanming-app`, Next.js production container, listening internally on `3000`.
- `caddy`: Container name `suanming-caddy`, reverse proxy, exposing `80/443`.

Health check chain:

- `app` checks its own availability via `GET /api/health`.
- `caddy` waits for `app` to be healthy before starting.

For detailed instructions, see [docs/DEPLOY_DOCKER_CADDY.md](./docs/DEPLOY_DOCKER_CADDY.md).

## Documentation

- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Deployment Documentation](./docs/DEPLOYMENT.md)
- [Docker + Caddy Deployment](./docs/DEPLOY_DOCKER_CADDY.md)
- [AI Proxy Operations](./docs/AI_PROXY_OPERATIONS.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Code Quality Report](./docs/CODE_QUALITY.md)
- [Release Checklist](./docs/RELEASE_CHECKLIST.md)
- [Shen Sha Configuration Guide](./docs/SHENSHA_CONFIG_GUIDE.md)

## Disclaimer

This project is for product implementation, learning, research, and functional demonstration purposes; it should not replace professional advice. Please view all calculation results and AI interpretations rationally.
