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

REPO_DIR="/srv/test-archery/src"
ENV_FILE="${ENV_FILE:-/srv/test-archery/.env}"
COMPOSE_DEST="${COMPOSE_FILE:-/srv/test-archery/docker-compose.prod.yml}"
COMPOSE_SRC="${REPO_DIR}/deploy/docker-compose.prod.yml"

if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
else
  SERVICES=(api frontend)
fi

cd "$REPO_DIR"
echo "==> Pulling latest code..."
git pull origin main

# Keep the VPS compose file in sync with the repo (it lives outside git).
cp "$COMPOSE_SRC" "$COMPOSE_DEST"

export APP_BUILD_ID="$(git rev-parse --short HEAD)"
echo "==> Frontend build id: ${APP_BUILD_ID}"
printf '%s\n' "${APP_BUILD_ID}" > apps/web/.build-id

COMPOSE_ARGS=(-f "$COMPOSE_DEST")
if [[ -f "$ENV_FILE" ]]; then
  COMPOSE_ARGS+=(--env-file "$ENV_FILE")
fi

for svc in "${SERVICES[@]}"; do
  echo ""
  echo "==> Building ${svc}..."
  if [[ "$svc" == "frontend" ]]; then
    docker compose "${COMPOSE_ARGS[@]}" build \
      --build-arg "NEXT_PUBLIC_APP_BUILD_ID=${APP_BUILD_ID}" \
      --progress=plain \
      "$svc" 2>&1 | tee "/tmp/build-${svc}.log"
  else
    docker compose "${COMPOSE_ARGS[@]}" build --progress=plain "$svc" 2>&1 | tee "/tmp/build-${svc}.log"
  fi

  echo "==> Starting ${svc}..."
  docker compose "${COMPOSE_ARGS[@]}" up -d --force-recreate "$svc"
done

echo ""
echo "==> Status:"
docker compose "${COMPOSE_ARGS[@]}" ps

echo ""
echo "Done. Logs: docker logs archery_api --tail 30"
