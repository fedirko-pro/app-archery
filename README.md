# Sokil

**Archery training companion** — log sessions, track progress, unlock achievements, and manage equipment. Federations and clubs can run tournaments, manage applications, and organise events.

Built with Next.js 15 + NestJS 11 in a pnpm monorepo.

## Features

**For archers**

- Training log with offline support and automatic sync
- Equipment management with detailed bow specifications
- Personal statistics — arrows fired, distance, streaks, scoring trends
- Achievement system — 35+ badges across 6 categories and 4 rarity tiers
- Public profiles and shareable progress snapshots
- Guided onboarding wizard

**For federations & clubs**

- Tournament management — banners, attachments, country filtering, application deadlines
- Tournament applications with admin approval workflow
- Patrol system with drag-and-drop management and PDF export
- Tournament feedback collection (star ratings + comments)
- Club public profiles and join-request flow
- Club & federation affiliation with invitation flows

**Platform**

- 6 languages: English, Ukrainian, Spanish, Italian, Portuguese, German
- Progressive Web App (installable, works offline)
- JWT auth with Google OAuth and role-based access control

## Monorepo structure

```
apps/web            — Next.js 15 frontend (@sokil/web), port 3001
apps/api            — NestJS 11 backend (@sokil/api), port 3000
packages/shared-types   — Shared TypeScript types
packages/shared-configs — Shared ESLint / TS config
deploy/             — Production Docker Compose (Traefik)
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

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Run API + Web in parallel       |
| `pnpm dev:web`     | Frontend only                   |
| `pnpm dev:api`     | Backend only                    |
| `pnpm build`       | Build all apps                  |
| `pnpm lint`        | Lint all apps                   |
| `pnpm typecheck`   | Typecheck all apps              |
| `pnpm test`        | Run all tests                   |
| `pnpm docker:up`   | Docker Compose (db + api + web) |
| `pnpm docker:down` | Stop Docker Compose             |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS setup with Traefik.
