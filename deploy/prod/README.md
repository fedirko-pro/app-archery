# VPS deploy (deploy/prod)

One script deploys both sites on the VPS. Installed copies must stay identical to `deploy/prod/deploy.sh`.

| file in git | installed on the VPS as |
|---|---|
| `deploy.sh` | `/srv/sokil/deploy.sh` (prod) and `/srv/test-archery/deploy.sh` (test) |
| `docker-compose.prod.yml` | `/srv/sokil/docker-compose.prod.yml` |
| `docker-compose.rollout.yml` | `/srv/sokil/docker-compose.rollout.yml` (blue-green twins, 512m limit) |

The test site keeps using `deploy/docker-compose.prod.yml`, which the script copies to `/srv/test-archery/docker-compose.prod.yml` on each real deploy.
**Never commit `.env` files or tokens.** `deploy/deploy.sh` (the old script) is **legacy**; do not use it.

## Commands

```bash
# prod (branch main only). api and frontend are separate commands; you choose the order.
bash /srv/sokil/deploy.sh api
bash /srv/sokil/deploy.sh frontend

# test (branch dev by default; GIT_BRANCH=main also allowed)
bash /srv/test-archery/deploy.sh api
bash /srv/test-archery/deploy.sh frontend

# flags
bash /srv/sokil/deploy.sh --dry-run api     # print the plan, change nothing
bash /srv/sokil/deploy.sh --force api       # deploy even if the CI check is not green

# rollback to the previous image
bash /srv/sokil/deploy.sh rollback api
```

A service name is required (no implicit "both"). `rollback` takes exactly one service.

## What a deploy does
1. **Lock:** one deploy at a time on the whole VPS (`/var/lock/vps-deploy.lock`), so builds never overlap on the 4 GB box. The run is detached, so a closed SSH session or Ctrl-C does not stop it.
2. **Git:** refuses a dirty tree (tracked files), then `fetch` + `checkout <branch>` + `merge --ff-only`. Prod is always `main`.
3. **CI gate:** all GitHub check runs for the commit must be green, otherwise it stops. `--force` overrides (and logs a warning).
4. **Build** while the old container keeps serving. The running image is kept as `<image>:prev` (one previous image only).
5. **API only, migrations:** if migrations changed since the last deployed commit (or that commit is unknown), a `pg_dump` is taken first, then an explicit `mikro-orm migration:up` runs. The containers no longer run migrations on start. Keep migrations backward compatible: the old API still serves during the swap.
6. **Swap:** prod uses a blue-green `*_new` twin (near-zero downtime); test recreates the container in place (short restart).
7. **Verify:** waits for the healthcheck, then requests the public URL through Traefik (expects 2xx/3xx). On failure it prints the rollback command.
8. **Cleanup** on success: dangling images and build cache older than 7 days are pruned.

## Rollback
`rollback <svc>` swaps `:latest` and `:prev` and redeploys that image without building. **The database is not rolled back.** Restore from the newest dump in `/var/backups/vps/predeploy/` only if needed and by hand. A rollback clears the "last deployed" record, so the next API deploy takes a fresh backup.

## CI token (needed for the CI gate)
- File: `/root/.config/sokil-deploy/gh-token` (mode `600`, owner root). Only the token, nothing else. Never print it or commit it.
- GitHub fine-grained personal access token, repository `fedirko-pro/app-archery` only, **read-only**: `Actions: Read`, `Commit statuses: Read`, `Metadata: Read` (Checks are readable with the Actions permission). No write permissions.
- Without a valid token the gate fails and a deploy needs `--force`.

## Where things are
| what | where |
|---|---|
| pre-deploy DB dumps (only when migrations changed; last 5 kept) | `/var/backups/vps/predeploy/<site>-<time>-<sha>.dump` (restore with `pg_restore`) |
| full log of each run | `/var/log/vps-deploy/<site>-<time>.log` |
| permanent audit log, one line per run | `/var/log/deploys.log` |
| last deployed commit per service | `/srv/<site>/.deployed/<service>.sha` |
| lock | `/var/lock/vps-deploy.lock` |

## Changing the scripts
Edit in git, then copy to the VPS (`deploy.sh` to both sites, compose files to `/srv/sokil/`). Check with `bash -n`, `shellcheck` and `--dry-run` before relying on a change.
