#!/usr/bin/env bash
# Read-only VPS diagnostics — safe to run anytime (no rebuild).
set -euo pipefail

COMPOSE="${COMPOSE_FILE:-/srv/test-archery/docker-compose.prod.yml}"

echo "========== GIT =========="
cd /srv/test-archery/src && git log -1 --oneline && git status -sb

echo ""
echo "========== CONTAINERS =========="
docker compose -f "$COMPOSE" ps -a

echo ""
echo "========== IMAGES =========="
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedSince}}\t{{.Size}}" | grep -E "REPOSITORY|archery|deploy|test-archery"

echo ""
echo "========== API INSPECT =========="
docker inspect archery_api --format \
  'Status={{.State.Status}} ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}} Restarts={{.RestartCount}} Error={{.State.Error}}'

echo ""
echo "========== FRONTEND INSPECT =========="
docker inspect archery_frontend --format \
  'Status={{.State.Status}} ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}} Restarts={{.RestartCount}}'

echo ""
echo "========== API LOGS (last 40) =========="
docker logs archery_api --tail 40 2>&1

echo ""
echo "========== API ERRORS (filtered) =========="
docker logs archery_api 2>&1 | grep -iE "error|fatal|migration|zod|JWT|TokenError|exception" | tail -20 || true

echo ""
echo "========== OOM / MEMORY =========="
dmesg -T 2>/dev/null | grep -iE "killed process|out of memory" | tail -5 || echo "(no recent OOM)"
free -h
df -h /

echo ""
echo "========== JWT LENGTH =========="
grep JWT_SECRET /srv/test-archery/.env | awk -F= '{print "JWT_SECRET length:", length($2)}'

echo ""
echo "========== PUBLIC URLS =========="
curl -sI https://archery.fedirko.pro | head -1 || true
curl -sI https://api-archery.fedirko.pro | head -1 || true

echo ""
echo "========== DONE =========="
