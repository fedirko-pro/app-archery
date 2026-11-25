# Deployment Guide - Hostinger VPS

## Server Info

- **VPS IP:** 148.230.116.33
- **SSH:** `ssh root@148.230.116.33` (ed25519 key at `~/.ssh/id_ed25519`)
- **OS:** Linux (Ubuntu/Debian)
- **RAM:** ~4GB - **enable swap** (see below) before Docker builds

## URLs

| Environment | Service          | URL                             | Port |
| ----------- | ---------------- | ------------------------------- | ---- |
| Live        | Frontend         | https://sokil.app               | 3001 |
| Test        | Frontend         | https://archery.fedirko.pro     | 3001 |
| Test        | API              | https://api-archery.fedirko.pro | 3000 |
| -           | Traefik dashboard | -                              | 80/443 |

The live and test frontends are **separate origins**, so PWA state (service
worker, installed app, `localStorage` install-prompt cooldown) does not carry
over between them. Installing the test site PWA has no effect on the live site.

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
        +-- deploy.sh                # LEGACY, replaced by deploy/prod/deploy.sh
        +-- prod/                    # Current deploy script + prod compose (see prod/README.md)
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

### Recommended: use the VPS deploy script

The current script lives in `deploy/prod/` (full docs: `deploy/prod/README.md`). It is installed as
`/srv/sokil/deploy.sh` (prod, branch `main`) and `/srv/test-archery/deploy.sh` (test, branch `dev` by default).
`deploy/deploy.sh` is **legacy**; do not use it.

```bash
ssh root@148.230.116.33

# prod (main). Run api first, wait until it is ready, then frontend.
bash /srv/sokil/deploy.sh api
bash /srv/sokil/deploy.sh frontend

# test (dev by default; GIT_BRANCH=main also works)
bash /srv/test-archery/deploy.sh api
bash /srv/test-archery/deploy.sh frontend

bash /srv/sokil/deploy.sh --dry-run api   # show the plan, change nothing
bash /srv/sokil/deploy.sh --force api     # skip the CI-green requirement
bash /srv/sokil/deploy.sh rollback api    # previous image; the database is NOT rolled back
```

The script pulls the branch itself (fast-forward only, clean tree required), checks that CI is green
(token: `/root/.config/sokil-deploy/gh-token`, fine-grained read-only: Actions, Commit statuses, Metadata),
takes a `pg_dump` into `/var/backups/vps/predeploy/` when migrations changed, runs migrations as an explicit step,
swaps the container (prod: blue-green, no downtime; test: in-place), waits for health and checks the public URL.
Only one deploy runs at a time and it keeps going if SSH disconnects. Logs: `/var/log/vps-deploy/`, summary: `/var/log/deploys.log`.

### Manual deploy (same idea)

```bash
cd /srv/test-archery/src
git pull origin main
cp deploy/docker-compose.prod.yml /srv/test-archery/docker-compose.prod.yml

export APP_BUILD_ID="$(git rev-parse --short HEAD)"
printf '%s\n' "$APP_BUILD_ID" > apps/web/.build-id

COMPOSE=(--project-directory /srv/test-archery -f /srv/test-archery/docker-compose.prod.yml --env-file /srv/test-archery/.env)

docker compose "${COMPOSE[@]}" build api
docker compose "${COMPOSE[@]}" up -d --force-recreate api

docker compose --progress=plain "${COMPOSE[@]}" \
  build --build-arg "NEXT_PUBLIC_APP_BUILD_ID=${APP_BUILD_ID}" frontend
docker compose "${COMPOSE[@]}" up -d --force-recreate frontend
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
| Container | `archery_db`                             | PostgreSQL 18       |
| Volume    | `test-archery_archery_pg18_data`         | Active DB data      |
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

- Deploy from `origin/main` (prod) or `origin/dev` (test): push, then run `bash /srv/sokil/deploy.sh api|frontend` (or `/srv/test-archery/deploy.sh`) on the VPS; the script pulls the branch itself
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
