# VPS deploy (deploy/prod)

Files (installed on the VPS, **never put `.env` or tokens here**):

| file | installed as |
|---|---|
| `deploy.sh` | `/srv/sokil/deploy.sh` and `/srv/test-archery/deploy.sh` (identical copies; the site is picked from the install dir) |
| `docker-compose.prod.yml` | `/srv/sokil/docker-compose.prod.yml` |
| `docker-compose.rollout.yml` | `/srv/sokil/docker-compose.rollout.yml` (blue-green twins, memory-limited) |

The test site keeps using the repo's `deploy/docker-compose.prod.yml` (copied to `/srv/test-archery/` on each deploy).

## Usage

```bash
bash /srv/sokil/deploy.sh api                 # prod, main only
bash /srv/sokil/deploy.sh frontend            # separate command, run after api is ready
GIT_BRANCH=dev bash /srv/test-archery/deploy.sh api      # test (default branch dev; main also allowed)
GIT_BRANCH=dev bash /srv/test-archery/deploy.sh frontend

bash /srv/sokil/deploy.sh --dry-run api       # print plan: git range, migrations, CI status, rollback image
bash /srv/sokil/deploy.sh --force api         # deploy even though the CI check is not green
bash /srv/sokil/deploy.sh rollback api        # swap back to the previous image (:prev); DB is not reverted
```

## What it does
1. One deploy at a time on the whole VPS (flock); runs detached, so a closed SSH session or Ctrl-C does not stop it (log: `/var/log/vps-deploy/`, one line per run in `/var/log/deploys.log`).
2. Refuses a dirty tree (tracked files); `fetch` + `checkout <branch>` + `merge --ff-only`. Prod is always `main`.
3. CI gate: all GitHub check runs for the commit must be green (read-only token in `/root/.config/sokil-deploy/gh-token`), else stop unless `--force`.
4. Builds the image while the old container keeps serving. The running image is saved as `:prev` (only one previous image is kept).
5. API only: if migrations changed since the last deployed commit (or it is unknown) -> `pg_dump -Fc` to `/var/backups/vps/predeploy/` (last 5 kept), then an explicit `mikro-orm migration:up`. Keep migrations backward compatible: the old API still serves during the swap.
6. Prod: blue-green via a `*_new` twin (zero downtime). Test: in-place recreate (short restart).
7. Waits for health, then checks the public URL through Traefik (2xx/3xx). Failure tells you to run `rollback`.
8. On success: prunes dangling images and build cache older than 7 days.
