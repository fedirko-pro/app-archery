# Deployment Guide - Hostinger VPS

## Server Info

- **VPS IP:** 148.230.116.33
- **SSH:** `ssh root@148.230.116.33` (ed25519 key at `~/.ssh/id_ed25519`)
- **OS:** Linux (Ubuntu/Debian)
- **RAM:** ~4GB - **enable swap** (see below) before Docker builds

## URLs

| Service           | URL                             | Port   |
| ----------------- | ------------------------------- | ------ |
| Frontend          | https://archery.fedirko.pro     | 3001   |
| API               | https://api-archery.fedirko.pro | 3000   |
| Traefik dashboard | -                               | 80/443 |

## Folder Structure

```
/srv/test-archery/
+-- .env                        # Production secrets (DO NOT commit)
+-- docker-compose.prod.yml     # Local compose (NOT in git, has DB volume patches)
+-- src/                        # Git repo (fedirko-pro/app-archery)
    +-- apps/
    |   +-- api/                # NestJS API
    |   +-- web/                # Next.js frontend
    +-- packages/
    +-- deploy/
        +-- docker-compose.prod.yml  # Canonical compose (reference)
        +-- deploy.sh                # Recommended deploy script
        +-- diagnose-vps.sh          # Read-only troubleshooting
```

## One-time: add swap (required for Next.js builds)

Without swap, `docker compose build` often fails silently (OOM killer). Old containers keep running, so it looks like "deploy didn't work".

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h   # Swap should show ~2G
```

## Deployment

### Recommended: use `deploy.sh`

Builds **one service at a time** and recreates containers (reloads `.env`).

```bash
ssh root@148.230.116.33
cd /srv/test-archery/src
git pull origin main

bash deploy/deploy.sh              # API, then frontend (~15-25 min total)
bash deploy/deploy.sh api            # API only (~5-10 min)
bash deploy/deploy.sh frontend       # Frontend only (~15-20 min)
```

Build logs are saved to `/tmp/build-api.log` and `/tmp/build-frontend.log`.

### Manual deploy (same idea)

```bash
cd /srv/test-archery/src
git pull origin main
cp deploy/docker-compose.prod.yml /srv/test-archery/docker-compose.prod.yml

export APP_BUILD_ID="$(git rev-parse --short HEAD)"
printf '%s\n' "$APP_BUILD_ID" > apps/web/.build-id

docker compose -f /srv/test-archery/docker-compose.prod.yml --env-file /srv/test-archery/.env build api
docker compose -f /srv/test-archery/docker-compose.prod.yml --env-file /srv/test-archery/.env up -d --force-recreate api

docker compose -f /srv/test-archery/docker-compose.prod.yml --env-file /srv/test-archery/.env \
  build --build-arg "NEXT_PUBLIC_APP_BUILD_ID=${APP_BUILD_ID}" frontend
docker compose -f /srv/test-archery/docker-compose.prod.yml --env-file /srv/test-archery/.env \
  up -d --force-recreate frontend
```

The footer shows this short git SHA (not `package.json` version). If you skip `APP_BUILD_ID`, the image falls back to `unknown` / `local`.

**Avoid** on this VPS:

```bash
# Builds both images at once - often OOM on 4GB RAM
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --build
```

API runs migrations automatically on startup.

### After `.env` changes

`docker compose restart` does **not** reload environment variables. Always recreate:

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --force-recreate api
# frontend too if NEXT_PUBLIC_* changed - requires rebuild:
docker compose -f /srv/test-archery/docker-compose.prod.yml build frontend
docker compose -f /srv/test-archery/docker-compose.prod.yml up -d --force-recreate frontend
```

## Environment Variables

Edit `/srv/test-archery/.env`:

```env
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=archery_user
DATABASE_PASSWORD=...
DATABASE_NAME=archery_db
JWT_SECRET=...                    # min 32 characters in production
COOKIE_DOMAIN=.fedirko.pro          # optional; for cross-subdomain cookies
SESSION_TTL_SECONDS=604800
OAUTH_CODE_TTL_SECONDS=120
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

**Notes:**

- `JWT_SECRET` must be **at least 32 characters** or the API crash-loops.
- `NEXT_PUBLIC_*` are baked into the frontend at **build** time.
- Footer version comes from `APP_BUILD_ID` / `NEXT_PUBLIC_APP_BUILD_ID` (git short SHA via `deploy.sh`), not from `package.json`.
- `GOOGLE_CALLBACK_URL` must match Google Cloud Console redirect URI exactly.

## Troubleshooting

### Diagnose without rebuilding

```bash
bash /srv/test-archery/src/deploy/diagnose-vps.sh
```

### Did the deploy actually succeed?

```bash
docker ps --filter name=archery_api --format "{{.Names}} {{.CreatedAt}} {{.Status}}"
cd /srv/test-archery/src && git log -1 --oneline
```

If container **CreatedAt** is days/weeks old but git is current, **build failed** (usually OOM). Check:

```bash
dmesg -T | grep -i "out of memory" | tail -5
tail -30 /tmp/build-frontend.log
free -h
```

### Logs

```bash
docker compose -f /srv/test-archery/docker-compose.prod.yml ps -a
docker logs archery_api --tail 50
docker logs archery_frontend --tail 50
docker logs archery_db --tail 10
```

### Common issues

| Problem                                      | Fix                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Deploy "succeeds" but old code still running | Build failed (OOM). Add swap; build services separately; check `dmesg` |
| API crash-loop: JWT_SECRET too short         | Use 32+ chars in `.env`, then `--force-recreate api`                   |
| `.env` change ignored after restart          | Use `up -d --force-recreate`, not `restart`                            |
| Google OAuth 500 / TokenError                | Don't refresh callback URL; start fresh sign-in from site              |
| Google login DB error on picture             | Migration `user.picture` to `text` (included in API deploy)            |
| Frontend 502                                 | API down or Traefik issue - check `docker logs archery_api`            |
| Migration errors                             | `docker exec archery_api ./node_modules/.bin/mikro-orm migration:up`   |
| SSL not working                              | `docker logs traefik --tail 20`                                        |

### Health checks

API/frontend are **not** exposed on host ports - Traefik routes HTTPS only:

```bash
curl -sI https://archery.fedirko.pro | head -1
curl -sI https://api-archery.fedirko.pro | head -1
docker exec archery_api wget -qO- --spider http://127.0.0.1:3000 && echo "API OK"
```

## Docker Resources

| Resource  | Name                                     | Notes               |
| --------- | ---------------------------------------- | ------------------- |
| Container | `archery_api`                            | NestJS API          |
| Container | `archery_frontend`                       | Next.js             |
| Container | `archery_db`                             | PostgreSQL 15       |
| Volume    | `test-archery_archery-api_postgres_data` | Active DB data      |
| Network   | `test-archery_archery_network`           | Internal bridge     |
| Network   | `traefik-public`                         | Shared with Traefik |

## Traefik Setup (one-time)

Traefik runs at `/srv/proxy/`. Routes:

- `archery.fedirko.pro` -> frontend:3001
- `api-archery.fedirko.pro` -> api:3000

```bash
docker network create traefik-public   # if missing
```

## Git Workflow

- Deploy from `origin/main`: push locally, `git pull` on VPS, `bash deploy/deploy.sh`
- Canonical compose reference: `deploy/docker-compose.prod.yml` in git
- Live compose: `/srv/test-archery/docker-compose.prod.yml` (VPS patches below)

### VPS-specific compose patches (not in git)

1. `build.context` -> `./src` (repo is nested under `/srv/test-archery/src`)
2. `env_file` -> `/srv/test-archery/.env` (absolute path)
3. Volume -> `archery-api_postgres_data` (reuses existing DB data)
4. Healthcheck -> `127.0.0.1` instead of `localhost` (Alpine IPv6)
5. `DATABASE_PORT: "5432"` in `api.environment` (if env_file omits it)

## Future improvements (optional)

- **CI-built images** (GitHub Container Registry): VPS only `docker pull` + `up -d` (~2 min, no build on server)
- **BuildKit cache mounts** in Dockerfiles: faster repeat builds on VPS
- **Separate build machine** or larger VPS if deploy frequency increases
