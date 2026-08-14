#!/usr/bin/env bash
# Safe production deploy for the Hostinger VPS (~4GB RAM).
# Builds and recreates services one at a time (avoids OOM from parallel Next.js + API builds).
#
# Branch deploy mapping:
#   main  -> production site (set NEXT_PUBLIC_SITE_MODE=prod in the VPS .env)
#   dev   -> dev/test site    (set NEXT_PUBLIC_SITE_MODE=test in the VPS .env, or leave default)
#
# Usage (on VPS):
#   bash /srv/test-archery/src/deploy/deploy.sh                 # api + frontend (branch: main)
#   GIT_BRANCH=dev bash /srv/test-archery/src/deploy/deploy.sh  # api + frontend from dev branch
#   bash /srv/test-archery/src/deploy/deploy.sh api             # api only
#   bash /srv/test-archery/src/deploy/deploy.sh frontend        # frontend only
#
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/srv/test-archery}"
REPO_DIR="${REPO_DIR:-${DEPLOY_ROOT}/src}"
ENV_FILE="${ENV_FILE:-${DEPLOY_ROOT}/.env}"
COMPOSE_DEST="${COMPOSE_FILE:-${DEPLOY_ROOT}/docker-compose.prod.yml}"
COMPOSE_SRC="${REPO_DIR}/deploy/docker-compose.prod.yml"
GIT_BRANCH="${GIT_BRANCH:-main}"

if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
else
  SERVICES=(api frontend)
fi

cd "$REPO_DIR"
echo "==> Pulling latest code from origin/${GIT_BRANCH}..."
git fetch origin
git checkout "$GIT_BRANCH"
git pull origin "$GIT_BRANCH"

# Keep the VPS compose file in sync with the repo (paths assume DEPLOY_ROOT + ./src).
cp "$COMPOSE_SRC" "$COMPOSE_DEST"

export APP_BUILD_ID="$(git rev-parse --short HEAD)"
echo "==> Frontend build id: ${APP_BUILD_ID}"
printf '%s\n' "${APP_BUILD_ID}" > "${REPO_DIR}/apps/web/.build-id"

COMPOSE_ARGS=(--project-directory "$DEPLOY_ROOT" -f "$COMPOSE_DEST")
if [[ -f "$ENV_FILE" ]]; then
  COMPOSE_ARGS+=(--env-file "$ENV_FILE")
fi

for svc in "${SERVICES[@]}"; do
  echo ""
  echo "==> Building ${svc}..."
  if [[ "$svc" == "frontend" ]]; then
    docker compose --progress=plain "${COMPOSE_ARGS[@]}" build \
      --build-arg "NEXT_PUBLIC_APP_BUILD_ID=${APP_BUILD_ID}" \
      "$svc" 2>&1 | tee "/tmp/build-${svc}.log"
  else
    docker compose --progress=plain "${COMPOSE_ARGS[@]}" build "$svc" 2>&1 | tee "/tmp/build-${svc}.log"
  fi

  echo "==> Starting ${svc}..."
  docker compose "${COMPOSE_ARGS[@]}" up -d --force-recreate "$svc"
done

echo ""
echo "==> Status:"
docker compose "${COMPOSE_ARGS[@]}" ps

echo ""
echo "Done. Logs: docker logs archery_api --tail 30"
echo ""
echo "==> App version: ${APP_BUILD_ID}"
