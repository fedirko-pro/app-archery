# Deployment Guide - Hostinger VPS

## Server Info

- **VPS IP:** 148.230.116.33
- **SSH:** `ssh root@148.230.116.33` (ed25519 key at `~/.ssh/id_ed25519`)
- **OS:** Linux (Ubuntu/Debian)

## URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://archery.fedirko.pro | 3001 |
| API | https://api-archery.fedirko.pro | 3000 |
| Traefik dashboard | — | 80/443 |

## Folder Structure

```
/srv/test-archery/
+-- .env                        # Production secrets (DO NOT commit)
+-- docker-compose.prod.yml     # Local compose (NOT in git, has DB volume patches)
+-- src/                        # Git repo (fedirko-pro/app-archery)
    +-- apps/
    ¦   +-- api/                # NestJS API
    ¦   ¦   +-- Dockerfile
    ¦   ¦   +-- src/
    ¦   ¦   +-- mikro-orm.config.ts
    ¦   ¦   +-- tsconfig.json
    ¦   +-- web/                # Next.js frontend
    ¦       +-- Dockerfile
    +-- packages/
    ¦   +-- shared-configs/     # tsconfig base, eslint config
    ¦   +-- shared-types/       # Shared TypeScript types
    +-- deploy/
    ¦   +-- docker-compose.prod.yml  # Repo's deploy compose
    +-- (monorepo config: pnpm-workspace, turbo, etc.)
```

## Docker Resources

| Resource | Name | Notes |
|----------|------|-------|
| Container | `archery_api` | NestJS API |
| Container | `archery_frontend` | Next.js |
| Container | `archery_db` | PostgreSQL 15 |
| Volume | `test-archery_archery-api_postgres_data` | Active DB data |
| Network | `test-archery_archery_network` | Internal bridge |
| Network | `traefik-public` | Shared with Traefik |

## Traefik Setup (one-time)

The Traefik reverse proxy runs at `/srv/proxy/`. It's already configured with:

- SSL via Let's Encrypt (auto-renewal)
- HTTP ? HTTPS redirect
- Routes `archery.fedirko.pro` ? frontend:3001
- Routes `api-archery.fedirko.pro` ? api:3000

To create the shared network (if not present):

```bash
docker network create traefik-public
```

## Deployment

### Standard deploy (code changes)

```bash
ssh root@148.230.116.33

cd /srv/test-archery/src
git pull

docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --build
```

This rebuilds changed images and recreates containers. API runs migrations automatically on startup.

### Deploy only API changes

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --build api
```

### Deploy only frontend changes

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --build frontend
```

### Database migration only (no code change)

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml exec api \
  ./node_modules/.bin/mikro-orm migration:up
```

### Full rebuild (clear cache)

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --build --no-cache
```

## Environment Variables

Edit `/srv/test-archery/.env` for secrets:

```env
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=archery_user
DATABASE_PASSWORD=...
DATABASE_NAME=archery_db
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api-archery.fedirko.pro/auth/google/callback
FRONTEND_URL=https://archery.fedirko.pro
BACKEND_URL=https://api-archery.fedirko.pro
PORT=3000
NODE_ENV=production
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_USER=info@fedirko.pro
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=info@fedirko.pro
SMTP_FROM_NAME=Archery App
NEXT_PUBLIC_API_BASE_URL=https://api-archery.fedirko.pro
NEXT_PUBLIC_GOOGLE_AUTH_URL=https://api-archery.fedirko.pro/auth/google
```

After editing, restart API:

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml restart api
```

**Note:** `NEXT_PUBLIC_*` vars are baked into the frontend at build time. Changing them requires `--build`.

## Troubleshooting

```bash
# Check container status
docker compose -f /srv/test-archery/docker-compose.prod.yml ps

# View logs
docker logs archery_api --tail 50
docker logs archery_frontend --tail 50
docker logs archery_db --tail 10

# Restart a service
docker compose -f /srv/test-archery/docker-compose.prod.yml restart api

# Enter a container
docker exec -it archery_api sh

# Check API health
curl http://localhost:3000

# Check frontend health
curl http://localhost:3001
```

### Common issues

| Problem | Fix |
|---------|-----|
| API keeps restarting | `docker logs archery_api` — check env vars, DB connection |
| Frontend 502 | API is down or Traefik routing issue |
| Migration errors | `docker exec archery_api ./node_modules/.bin/mikro-orm migration:up` |
| Port conflict | Check `docker ps` for other services using the same port |
| SSL not working | Check Traefik logs: `docker logs traefik --tail 20` |

## Git Workflow

- All deployment fixes are committed to `origin/main`
- Commits are pushed from the VPS directly
- Pull locally to continue development: `git pull`
- The `deploy/docker-compose.prod.yml` in git has the canonical compose config
- `/srv/test-archery/docker-compose.prod.yml` on VPS has additional local patches (absolute paths, DB volume reuse, `DATABASE_PORT` in environment)

### VPS-specific patches (not in git)

The local compose at `/srv/test-archery/docker-compose.prod.yml` differs from the repo's `deploy/docker-compose.prod.yml`:

1. `build.context` changed from `.` to `./src` (repo is nested)
2. `env_file` uses absolute path `/srv/test-archery/.env`
3. Volume uses `archery-api_postgres_data` (reuses old DB volume)
4. Healthcheck uses `127.0.0.1` instead of `localhost` (Alpine IPv6 fix)
5. `DATABASE_PORT: "5432"` added to environment block (env_file not passing it)