# Sokil Monorepo

Archery training companion (Sokil) — Next.js frontend + NestJS API in a pnpm workspace.

## Structure

```
apps/web   — Next.js frontend (@sokil/web), port 3001
apps/api   — NestJS backend (@sokil/api), port 3000
deploy/    — Production Docker Compose (Traefik)
```

## Quick start (local)

```bash
pnpm install
cp .env.example .env

# Database only in Docker
docker compose up db -d

# API + Web on host
pnpm dev
```

- Web: http://localhost:3001
- API: http://localhost:3000

## Full stack in Docker

```bash
docker compose up -d --build
```

- Web: http://localhost:8080
- API: http://localhost:3000
- PostgreSQL: localhost:5432

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + Web in parallel |
| `pnpm dev:web` | Frontend only |
| `pnpm dev:api` | Backend only |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm typecheck` | Typecheck all apps |
| `pnpm test` | Run all tests |
| `pnpm docker:up` | Docker Compose (db + api + web) |
| `pnpm docker:down` | Stop Docker Compose |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS setup with Traefik.
