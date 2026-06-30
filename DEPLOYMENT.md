# Deployment Guide — Sokil Monorepo (VPS + Docker + Traefik)

Single-repo deployment for `apps/api` (NestJS), `apps/web` (Next.js), and PostgreSQL.

---

## Server layout

```
/srv/archery/                    # git clone of app-archery (monorepo root)
├── .env                         # single env file (from .env.example)
├── docker-compose.yml           # optional: copy of deploy/docker-compose.prod.yml
└── apps/ ...
```

---

## 1. Traefik (unchanged)

Create the shared network once:

```bash
docker network create traefik-public
```

See [apps/api/DEPLOYMENT.md](./apps/api/DEPLOYMENT.md) section 1 for full Traefik `docker-compose.yml`.

---

## 2. Deploy monorepo stack

```bash
sudo mkdir -p /srv/archery
sudo chown -R $USER:$USER /srv/archery
cd /srv/archery
git clone https://github.com/fedirko-pro/app-archery.git .

cp .env.example .env
# Edit .env with production values (DB, JWT, SMTP, NEXT_PUBLIC_*)

docker compose -f deploy/docker-compose.prod.yml up -d --build
```

The production compose includes **db**, **api**, and **frontend** with Traefik labels.

### Preserving existing database volume

If migrating from separate `archery-api` / `archery-front` deployments:

1. Note the existing volume: `docker volume ls | grep db_data`
2. If the compose project name changes, mark the volume as external in `docker-compose.yml`:

```yaml
volumes:
  db_data:
    external: true
    name: archery-api_db_data   # use your actual volume name
```

3. Stop old frontend first, deploy monorepo, verify, then remove old stacks.

---

## 3. Updates

```bash
cd /srv/archery
git pull
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

API runs migrations and seeders on container start.

Frontend requires `--build` when `NEXT_PUBLIC_*` env vars change.

---

## 4. Local development

```bash
pnpm install
docker compose up db -d    # PostgreSQL only
pnpm dev                   # API :3000 + Web :3001
```

Or full stack: `docker compose up -d --build` → Web on http://localhost:8080

---

## 5. Troubleshooting

```bash
docker ps
docker logs -f archery_api
docker logs -f archery_frontend
docker logs -f archery_db
```

**Note:** `next build` with `output: standalone` may fail on Windows without symlink permissions. Docker builds on Linux are unaffected.
