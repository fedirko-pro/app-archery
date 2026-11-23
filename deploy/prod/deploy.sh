#!/usr/bin/env bash
# VPS deploy script for the app-archery repo (one script, two sites).
#
#   sokil prod   : /srv/sokil/deploy.sh          -> blue-green (twin container), branch main only
#   archery test : /srv/test-archery/deploy.sh   -> in-place recreate, branch dev (or main)
#
# The site is chosen from the directory the script is installed in
# (or DEPLOY_SITE=sokil|test-archery). Keep the installed copies identical to
# deploy/prod/deploy.sh in git.
#
# Usage:
#   deploy.sh [--dry-run] [--force] api              # one service
#   deploy.sh [--dry-run] [--force] frontend
#   deploy.sh [--dry-run] rollback api|frontend      # back to the previous image (:prev)
#   (api and frontend are deliberately separate commands; run them in the order you want)
#
# Flags:
#   --dry-run  print the plan (git range, migrations, CI status, rollback image) and exit; nothing is changed
#   --force    deploy even if the CI check is red, pending, missing or cannot be read
#   GIT_BRANCH=dev  (test site only; prod is always main)
#
# Safety features: flock (one deploy at a time on the whole VPS), runs detached
# (survives SSH/Termius disconnect and Ctrl-C), dirty tree / ff-only git, CI-green gate,
# pre-deploy pg_dump when migrations changed, explicit migration step, health waits,
# post-swap HTTP check through Traefik, :prev image for rollback, permanent log.
set -euo pipefail

SCRIPT="$(readlink -f "${BASH_SOURCE[0]}")"
SITE="${DEPLOY_SITE:-$(basename "$(dirname "$SCRIPT")")}"
REPO_SLUG="fedirko-pro/app-archery"
TOKEN_FILE="${GH_TOKEN_FILE:-/root/.config/sokil-deploy/gh-token}"
LOCK_FILE="/var/lock/vps-deploy.lock"       # shared by all sites: builds never run in parallel (4 GB RAM)
LOG_DIR="/var/log/vps-deploy"
AUDIT_LOG="/var/log/deploys.log"
BACKUP_DIR="/var/backups/vps/predeploy"
KEEP_BACKUPS=5
MIN_FREE_GB=3

case "$SITE" in
  sokil)
    DEPLOY_ROOT="/srv/sokil"
    COMPOSE_FILE="$DEPLOY_ROOT/docker-compose.prod.yml"
    COMPOSE_SRC=""                           # prod compose is managed by hand/git, never overwritten
    ROLLOUT_FILE="$DEPLOY_ROOT/docker-compose.rollout.yml"
    MODE="bluegreen"
    DEFAULT_BRANCH="main"; ALLOWED_BRANCHES=" main "
    IMG_PREFIX="sokil"; DB_CONTAINER="sokil_db"
    C_API="sokil_api"; C_FRONTEND="sokil_frontend"
    URL_API="https://api.sokil.app/"; URL_FRONTEND="https://sokil.app/"
    PULL_BASE="--pull"
    ;;
  test-archery)
    DEPLOY_ROOT="/srv/test-archery"
    COMPOSE_FILE="$DEPLOY_ROOT/docker-compose.prod.yml"
    COMPOSE_SRC="$DEPLOY_ROOT/src/deploy/docker-compose.prod.yml"   # copied over COMPOSE_FILE on each real deploy (as before)
    ROLLOUT_FILE=""
    MODE="inplace"
    DEFAULT_BRANCH="dev"; ALLOWED_BRANCHES=" main dev "
    IMG_PREFIX="test-archery"; DB_CONTAINER="archery_db"
    C_API="archery_api"; C_FRONTEND="archery_frontend"
    URL_API="https://api-archery.fedirko.pro/"; URL_FRONTEND="https://archery.fedirko.pro/"
    PULL_BASE=""
    ;;
  *) echo "Unknown site '$SITE' (install the script in /srv/sokil or /srv/test-archery, or set DEPLOY_SITE)" >&2; exit 2 ;;
esac
REPO_DIR="$DEPLOY_ROOT/src"
ENV_FILE="$DEPLOY_ROOT/.env"
STATE_DIR="$DEPLOY_ROOT/.deployed"           # last successfully deployed SHA per service
BRANCH="${GIT_BRANCH:-$DEFAULT_BRANCH}"

usage() { sed -n '2,/^set -euo/p' "$SCRIPT" | sed '$d' | sed 's/^# \{0,1\}//'; }
die() { echo "ERROR: $*" >&2; exit 1; }
log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

# ---------- args ----------
ORIG_ARGS=("$@")
DRY_RUN=0; FORCE=0; ACTION="deploy"; SERVICES=()
for a in "$@"; do
  case "$a" in
    --dry-run) DRY_RUN=1 ;;
    --force) FORCE=1 ;;
    -h|--help) usage; exit 0 ;;
    rollback) ACTION="rollback" ;;
    api|frontend) SERVICES+=("$a") ;;
    *) usage >&2; die "unknown argument: $a" ;;
  esac
done
[[ ${#SERVICES[@]} -gt 0 ]] || { usage >&2; die "give a service: api or frontend"; }
if [[ "$ACTION" == "rollback" && ${#SERVICES[@]} -ne 1 ]]; then die "rollback takes exactly one service"; fi
[[ "$ALLOWED_BRANCHES" == *" $BRANCH "* ]] || die "branch '$BRANCH' is not allowed on $SITE (allowed:${ALLOWED_BRANCHES})"

img()   { echo "${IMG_PREFIX}-$1"; }
cname() { [[ "$1" == api ]] && echo "$C_API" || echo "$C_FRONTEND"; }
url()   { [[ "$1" == api ]] && echo "$URL_API" || echo "$URL_FRONTEND"; }
sha_of_state() { cat "$STATE_DIR/$1.sha" 2>/dev/null || true; }

COMPOSE_ARGS=(--project-directory "$DEPLOY_ROOT" -f "$COMPOSE_FILE")
[[ -f "$ENV_FILE" ]] && COMPOSE_ARGS+=(--env-file "$ENV_FILE")
dc()  { docker compose "${COMPOSE_ARGS[@]}" "$@"; }
dcr() { docker compose "${COMPOSE_ARGS[@]}" -f "$ROLLOUT_FILE" "$@"; }

# ---------- detach wrapper: real runs survive HUP / closed terminal / Ctrl-C ----------
if [[ "$DRY_RUN" != 1 && -z "${DEPLOY_CHILD:-}" ]]; then
  mkdir -p "$LOG_DIR"
  RUN_ID="$(date +%Y%m%d-%H%M%S)"
  export DEPLOY_RUN_LOG="$LOG_DIR/${SITE}-${RUN_ID}.log"
  export DEPLOY_RC_FILE="$LOG_DIR/.${SITE}-${RUN_ID}.rc"
  : > "$DEPLOY_RUN_LOG"; rm -f "$DEPLOY_RC_FILE" "$DEPLOY_RC_FILE.pid"
  DEPLOY_CHILD=1 nohup setsid bash "$SCRIPT" "${ORIG_ARGS[@]}" >>"$DEPLOY_RUN_LOG" 2>&1 </dev/null &
  echo "Deploy started in the background (survives disconnect). Full log: $DEPLOY_RUN_LOG"
  tail -n +1 -F "$DEPLOY_RUN_LOG" 2>/dev/null & TAILPID=$!
  trap 'kill $TAILPID 2>/dev/null || true; echo; echo "Detached. The deploy keeps running. Follow it: tail -f $DEPLOY_RUN_LOG"; exit 130' INT TERM HUP
  for _ in $(seq 1 60); do [[ -s "$DEPLOY_RC_FILE.pid" ]] && break; sleep 0.5; done
  CPID="$(cat "$DEPLOY_RC_FILE.pid" 2>/dev/null || echo 0)"
  while [[ ! -s "$DEPLOY_RC_FILE" ]]; do
    if [[ "$CPID" == 0 ]] || ! kill -0 "$CPID" 2>/dev/null; then sleep 1; [[ -s "$DEPLOY_RC_FILE" ]] || { echo "deploy process vanished without a result; see $DEPLOY_RUN_LOG" >&2; kill $TAILPID 2>/dev/null || true; exit 1; }; fi
    sleep 1
  done
  sleep 1; kill $TAILPID 2>/dev/null || true
  RC="$(cat "$DEPLOY_RC_FILE")"; rm -f "$DEPLOY_RC_FILE" "$DEPLOY_RC_FILE.pid"
  exit "$RC"
fi

# ---------- common helpers ----------
START_TS=$(date +%s)
RESULT="FAIL"; FROM_SHA=""; TO_SHA=""; TWIN_UP=""; KEEP_TWIN=0
BY="${SUDO_USER:-${USER:-root}}"

on_exit() {
  local rc=$?
  trap - EXIT
  if [[ -n "$TWIN_UP" && "$KEEP_TWIN" != 1 && -n "$ROLLOUT_FILE" ]]; then
    log "cleanup: removing twin ${TWIN_UP}"
    dcr rm -sf "${TWIN_UP}" >/dev/null 2>&1 || true
  fi
  if [[ "$DRY_RUN" != 1 ]]; then
    [[ $rc -eq 0 ]] && RESULT="ok" || RESULT="FAIL(rc=$rc)"
    printf '%s site=%s action=%s services=%s branch=%s from=%s to=%s result=%s secs=%s by=%s log=%s\n' \
      "$(date '+%F %T %Z')" "$SITE" "$ACTION" "${SERVICES[*]}" "$BRANCH" "${FROM_SHA:-?}" "${TO_SHA:-?}" "$RESULT" \
      "$(( $(date +%s) - START_TS ))" "$BY" "${DEPLOY_RUN_LOG:--}" >> "$AUDIT_LOG" 2>/dev/null || true
    if [[ -n "${DEPLOY_RC_FILE:-}" ]]; then echo "$rc" > "$DEPLOY_RC_FILE"; fi
  fi
  exit $rc
}
trap on_exit EXIT
trap 'log "signal received, aborting"; exit 143' TERM INT
trap '' HUP

[[ -n "${DEPLOY_RC_FILE:-}" ]] && echo $$ > "$DEPLOY_RC_FILE.pid"

if [[ "$DRY_RUN" != 1 ]]; then
  exec 9>"$LOCK_FILE"
  flock -n 9 || die "another deploy is already running (lock $LOCK_FILE)"
fi

wait_healthy() { # <container> [tries]
  local c="$1" tries="${2:-60}" i s
  for i in $(seq 1 "$tries"); do
    s="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealthcheck{{end}}' "$c" 2>/dev/null || echo missing)"
    case "$s" in
      healthy) echo "    OK: $c is healthy"; return 0 ;;
      nohealthcheck) echo "    note: $c has no healthcheck, relying on the HTTP check"; return 0 ;;
      unhealthy) echo "    ERROR: $c became unhealthy" >&2; return 1 ;;
    esac
    sleep 2
  done
  echo "    ERROR: $c did not become healthy in $((tries*2))s" >&2; return 1
}

http_check() { # <url>  (goes through the local Traefik on :443, expects 2xx/3xx)
  local u="$1" host code i
  host="${u#https://}"; host="${host%%/*}"
  for i in $(seq 1 15); do
    code="$(curl -sS -o /dev/null -m 10 --resolve "${host}:443:127.0.0.1" -w '%{http_code}' "$u" 2>/dev/null || true)"
    if [[ "$code" =~ ^[23] ]]; then echo "    OK: $u -> HTTP $code via Traefik"; return 0; fi
    sleep 3
  done
  echo "    ERROR: $u did not answer 2xx/3xx via Traefik (last: ${code:-none})" >&2; return 1
}

ci_status() { # <sha> ; prints a one-line status; returns 0 green, 1 red/pending, 2 no token, 3 API error, 4 no runs
  local sha="$1" tok resp total bad
  if [[ ! -r "$TOKEN_FILE" ]]; then echo "no GitHub token at $TOKEN_FILE (read-only token needed)"; return 2; fi
  tok="$(tr -d '[:space:]' < "$TOKEN_FILE")"
  resp="$(printf 'header = "Authorization: Bearer %s"\n' "$tok" | curl -fsS -m 20 -K - \
          -H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28' \
          "https://api.github.com/repos/${REPO_SLUG}/commits/${sha}/check-runs?per_page=100" 2>/dev/null)" \
    || { echo "GitHub API request failed (bad/expired token?)"; return 3; }
  total="$(jq -r '.total_count' <<<"$resp")"
  [[ "$total" =~ ^[0-9]+$ && "$total" -gt 0 ]] || { echo "no CI runs found for ${sha:0:7}"; return 4; }
  bad="$(jq -r '[.check_runs[] | select(.status!="completed" or ((.conclusion // "") | IN("success","skipped","neutral") | not))] | length' <<<"$resp")"
  if [[ "$bad" == 0 ]]; then echo "CI green for ${sha:0:7} ($total checks passed)"; return 0; fi
  echo "CI NOT green for ${sha:0:7}: $(jq -r '[.check_runs[] | select(.status!="completed" or ((.conclusion // "") | IN("success","skipped","neutral") | not)) | "\(.name)=\(.conclusion // .status)"] | join(", ")' <<<"$resp")"
  return 1
}

migrations_changed() { # <service api only> <target sha> ; 0 = changed or unknown
  local old; old="$(sha_of_state api)"
  if [[ -z "$old" ]] || ! git -C "$REPO_DIR" cat-file -e "${old}^{commit}" 2>/dev/null; then return 0; fi
  ! git -C "$REPO_DIR" diff --quiet "$old" "$1" -- apps/api/src/migrations
}

describe_range() { # <from> <to>
  git -C "$REPO_DIR" log --oneline --no-decorate "$1..$2" 2>/dev/null | head -20
  echo "  changed areas: $(git -C "$REPO_DIR" diff --name-only "$1" "$2" 2>/dev/null | awk -F/ '{ if ($1=="apps"||$1=="packages") print $1"/"$2; else print $1 }' | sort | uniq -c | sort -rn | awk '{printf "%s(%s) ", $2, $1}')"
}

free_gb() { df -BG --output=avail / | tail -1 | tr -dc '0-9'; }

# ---------- dry run ----------
if [[ "$DRY_RUN" == 1 ]]; then
  echo "=== DRY RUN ($SITE, $ACTION ${SERVICES[*]}) - nothing will be changed ==="
  cd "$REPO_DIR"
  git fetch -q origin "+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}"
  HEADSHA="$(git rev-parse HEAD)"; TARGET="$(git rev-parse "origin/$BRANCH")"
  echo "site: $SITE   mode: $MODE   branch: $BRANCH   repo: $REPO_DIR (currently on $(git rev-parse --abbrev-ref HEAD))"
  echo "checkout HEAD: ${HEADSHA:0:7}   target origin/$BRANCH: ${TARGET:0:7}"
  [[ -z "$(git status --porcelain --untracked-files=no)" ]] && echo "working tree: clean" || { echo "working tree: DIRTY -> a real run would refuse:"; git status --short --untracked-files=no | head; }
  if [[ "$ACTION" == deploy ]]; then
    if git merge-base --is-ancestor HEAD "origin/$BRANCH" 2>/dev/null; then echo "fast-forward possible: yes"; else echo "fast-forward possible: NO (diverged or on another branch) -> real run would checkout $BRANCH then ff-only"; fi
    echo "commits to deploy (HEAD..origin/$BRANCH):"; describe_range "$HEADSHA" "$TARGET"
    for s in "${SERVICES[@]}"; do
      echo "- service $s: image $(img "$s"):latest, container $(cname "$s"), last deployed sha: $(x="$(sha_of_state "$s")"; echo "${x:0:7}" | sed 's/^$/unknown/')"
      echo "    running image: $(docker inspect -f '{{.Config.Image}} {{.Image}}' "$(cname "$s")" 2>/dev/null | cut -c1-60 || echo '?')"
      echo "    :prev image: $(docker image inspect -f '{{.Id}}' "$(img "$s"):prev" 2>/dev/null | cut -c1-19 || true)$( docker image inspect "$(img "$s"):prev" >/dev/null 2>&1 || echo 'none yet (created at first deploy)')"
    done
    if printf '%s\n' "${SERVICES[@]}" | grep -qx api; then
      if migrations_changed "$TARGET"; then echo "migrations: CHANGED or last deployed sha unknown -> pre-deploy pg_dump to $BACKUP_DIR (keep $KEEP_BACKUPS), then explicit migration:up"
      else echo "migrations: none changed -> no backup; explicit migration:up still runs (no-op)"; fi
      oldsha="$(sha_of_state api)"
      echo "migration files changed vs ${oldsha:-HEAD}: $(git diff --name-only "${oldsha:-$HEADSHA}" "$TARGET" -- apps/api/src/migrations 2>/dev/null | wc -l)"
    fi
    if [[ -n "$COMPOSE_SRC" && -f "$COMPOSE_SRC" ]]; then diff -q "$COMPOSE_SRC" "$COMPOSE_FILE" >/dev/null && echo "compose: repo copy identical to $COMPOSE_FILE" || echo "compose: repo copy DIFFERS from $COMPOSE_FILE (a real run copies it over)"; fi
    set +e; CIMSG="$(ci_status "$TARGET")"; CIRC=$?; set -e
    echo "CI gate: $CIMSG (rc=$CIRC)$([[ $CIRC -ne 0 ]] && echo ' -> real run would STOP unless --force')"
  else
    s="${SERVICES[0]}"
    echo "rollback $s: :latest=$(docker image inspect -f '{{.Id}}' "$(img "$s"):latest" 2>/dev/null | cut -c1-19) :prev=$(docker image inspect -f '{{.Id}}' "$(img "$s"):prev" 2>/dev/null | cut -c1-19 || true)"
    docker image inspect "$(img "$s"):prev" >/dev/null 2>&1 || echo "  NO :prev image -> rollback would fail"
    echo "  would swap tags latest<->prev, then $MODE swap of $(cname "$s"); database is NOT rolled back. Newest pre-deploy dump: $(ls -1t "$BACKUP_DIR"/${SITE}-*.dump 2>/dev/null | head -1 || true)"
  fi
  echo "disk free: $(free_gb) GB (need >= $MIN_FREE_GB)   lock: $LOCK_FILE   audit log: $AUDIT_LOG"
  echo "validating compose files..."
  if [[ "$MODE" == bluegreen ]]; then dcr config -q && echo "  compose + rollout: valid"; else dc config -q && echo "  compose: valid"; fi
  for s in "${SERVICES[@]}"; do curl -sS -o /dev/null -m 10 --resolve "$(url "$s" | sed 's#https://##; s#/.*##'):443:127.0.0.1" -w "  Traefik check $(url "$s") -> HTTP %{http_code}\n" "$(url "$s")" || true; done
  echo "=== end of dry run ==="
  exit 0
fi

# ---------- real run ----------
log "Deploy start: site=$SITE action=$ACTION services=${SERVICES[*]} branch=$BRANCH by=$BY"
[[ "$(free_gb)" -ge "$MIN_FREE_GB" ]] || die "less than ${MIN_FREE_GB} GB free on /"
mkdir -p "$STATE_DIR"

set_tags_swap() { # swap :latest and :prev (rollback)
  local i; i="$(img "$1")"
  docker image inspect "$i:prev" >/dev/null 2>&1 || die "no $i:prev image to roll back to"
  docker tag "$i:latest" "$i:rb-tmp"; docker tag "$i:prev" "$i:latest"; docker tag "$i:rb-tmp" "$i:prev"; docker rmi "$i:rb-tmp" >/dev/null
}

swap_service() { # <svc> : replace the running container with the current :latest image
  local svc="$1" main twin
  main="$(cname "$svc")"; twin="${main}_new"
  if [[ "$MODE" == bluegreen ]]; then
    dcr rm -sf "${svc}_new" >/dev/null 2>&1 || true
    log "starting twin $twin (Traefik balances old + twin)"
    TWIN_UP="${svc}_new"
    dcr up -d --no-deps --no-build "${svc}_new"
    if ! wait_healthy "$twin"; then
      log "twin failed its healthcheck; old $main stays live"; docker logs --tail 30 "$twin" 2>&1 || true
      exit 1
    fi
    log "recreating $main from the new image"
    KEEP_TWIN=1                              # until main is healthy, the twin keeps serving
    dc up -d --no-deps --no-build --force-recreate "$svc"
    if ! wait_healthy "$main"; then
      log "ERROR: $main unhealthy; twin $twin still serves traffic. Inspect: docker logs $main --tail 50 ; rollback: bash $SCRIPT rollback $svc"
      exit 1
    fi
    KEEP_TWIN=0
    dcr rm -sf "${svc}_new" >/dev/null 2>&1 || true; TWIN_UP=""
  else
    log "recreating $main in place (brief restart)"
    dc up -d --no-deps --no-build --force-recreate "$svc"
    wait_healthy "$main" || { log "ERROR: $main unhealthy. Rollback: bash $SCRIPT rollback $svc"; exit 1; }
  fi
  http_check "$(url "$svc")" || { log "ERROR: post-swap HTTP check failed. Rollback: bash $SCRIPT rollback $svc"; exit 1; }
}

deploy_service() {
  local svc="$1" i running
  i="$(img "$svc")"
  log "==> Building $svc"
  if [[ "$svc" == frontend ]]; then
    dc build $PULL_BASE --build-arg "NEXT_PUBLIC_APP_BUILD_ID=${APP_BUILD_ID}" frontend
  else
    dc build $PULL_BASE api
  fi
  running="$(docker inspect -f '{{.Image}}' "$(cname "$svc")" 2>/dev/null || true)"
  if [[ -n "$running" ]]; then docker tag "$running" "$i:prev"; log "saved currently running image as $i:prev"; fi

  if [[ "$svc" == api ]]; then
    if migrations_changed "$TO_SHA"; then
      log "migrations changed (or last deployed sha unknown): pre-deploy database backup"
      mkdir -p "$BACKUP_DIR"; chmod 700 "$BACKUP_DIR"
      local out; out="$BACKUP_DIR/${SITE}-$(date +%Y%m%d-%H%M%S)-${TO_SHA:0:7}.dump"
      docker exec "$DB_CONTAINER" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$out.part"
      [[ -s "$out.part" ]] || die "backup is empty, aborting before touching anything"
      docker exec -i "$DB_CONTAINER" pg_restore -l < "$out.part" >/dev/null || die "backup failed verification"
      mv "$out.part" "$out"; chmod 600 "$out"
      log "backup OK: $out ($(du -h "$out" | cut -f1))"
      ls -1t "$BACKUP_DIR"/${SITE}-*.dump 2>/dev/null | tail -n +$((KEEP_BACKUPS+1)) | xargs -r rm -f
    else
      log "no migration changes since last deploy: no backup needed"
    fi
    log "running migrations (explicit step, new image)"
    dc run --rm -T --no-deps api ./node_modules/.bin/mikro-orm migration:up
  fi

  swap_service "$svc"
  echo "$TO_SHA" > "$STATE_DIR/$svc.sha"
  log "==> $svc deployed (${TO_SHA:0:7})"
}

rollback_service() {
  local svc="$1"
  log "==> Rolling back $svc to $(img "$svc"):prev"
  set_tags_swap "$svc"
  swap_service "$svc"
  rm -f "$STATE_DIR/$svc.sha"               # unknown state -> next deploy takes a backup
  log "==> $svc rolled back. NOTE: database migrations are NOT reverted. Newest pre-deploy dump: $(ls -1t "$BACKUP_DIR"/${SITE}-*.dump 2>/dev/null | head -1 || echo none)"
}

if [[ "$ACTION" == deploy ]]; then
  cd "$REPO_DIR"
  [[ -z "$(git status --porcelain --untracked-files=no)" ]] || { git status --short --untracked-files=no; die "working tree in $REPO_DIR is dirty; refusing to deploy"; }
  FROM_SHA="$(git rev-parse --short HEAD)"
  log "==> Fetching origin/$BRANCH"
  git fetch origin "+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}"
  TO_SHA="$(git rev-parse "origin/$BRANCH")"
  git checkout "$BRANCH"
  git merge --ff-only "origin/$BRANCH" || die "cannot fast-forward $BRANCH to origin/$BRANCH"
  TO_SHA="$(git rev-parse HEAD)"
  log "Deploying ${FROM_SHA} -> ${TO_SHA:0:7}"
  describe_range "$FROM_SHA" "$TO_SHA"

  set +e; CIMSG="$(ci_status "$TO_SHA")"; CIRC=$?; set -e
  log "CI gate: $CIMSG"
  if [[ $CIRC -ne 0 ]]; then
    [[ $FORCE == 1 ]] && log "WARNING: --force given, deploying without a green CI" || die "CI gate failed; fix CI or re-run with --force"
  fi

  if [[ -n "$COMPOSE_SRC" ]]; then cp "$COMPOSE_SRC" "$COMPOSE_FILE"; log "compose file synced from repo"; fi
  export APP_BUILD_ID="${TO_SHA:0:7}"
  printf '%s\n' "$APP_BUILD_ID" > "$REPO_DIR/apps/web/.build-id"
  for s in "${SERVICES[@]}"; do deploy_service "$s"; done
  log "==> Cleanup: dangling images and build cache older than 7 days"
  docker image prune -f | tail -1 || true
  docker builder prune -f --filter until=168h | tail -1 || true
else
  TO_SHA="$(git -C "$REPO_DIR" rev-parse HEAD)"; FROM_SHA="${TO_SHA:0:7}"
  rollback_service "${SERVICES[0]}"
fi

echo; dc ps
log "Done."
