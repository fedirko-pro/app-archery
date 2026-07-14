#!/usr/bin/env bash
# Safe production deploy for the Hostinger VPS (~4GB RAM).
# Builds and recreates services one at a time (avoids OOM from parallel Next.js + API builds).
#
# Usage (on VPS):
#   bash /srv/test-archery/src/deploy/deploy.sh          # api + frontend
#   bash /srv/test-archery/src/deploy/deploy.sh api      # api only
#   bash /srv/test-archery/src/deploy/deploy.sh frontend # frontend only
#
set -euo pipefail

COMPOSE="${COMPOSE_FILE:-/srv/test-archery/docker-compose.prod.yml}"
REPO_DIR="/srv/test-archery/src"

if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
else
  SERVICES=(api frontend)
fi

cd "$REPO_DIR"
echo "==> Pulling latest code..."
git pull origin main

export APP_BUILD_ID="$(git rev-parse --short HEAD)"
echo "==> Frontend build id: ${APP_BUILD_ID}"

for svc in "${SERVICES[@]}"; do
  echo ""
  echo "==> Building ${svc}..."
  docker compose -f "$COMPOSE" build --progress=plain "$svc" 2>&1 | tee "/tmp/build-${svc}.log"

  echo "==> Starting ${svc}..."
  docker compose -f "$COMPOSE" up -d --force-recreate "$svc"
done

echo ""
echo "==> Status:"
docker compose -f "$COMPOSE" ps

echo ""
echo "Done. Logs: docker logs archery_api --tail 30"
