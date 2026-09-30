# Sokil master plan

**Date:** 2026-09-30  
**Status:** Not started. Execute one step at a time.  
The 2026-09-29 architecture, code, and security reviews plus a repo check on 2026-09-30 (CI, deploy, observability, performance) are folded into the steps below.

This is the only improvement backlog. Do not start a later step because it looks related. When a step is finished, check it off here and note the commit.

## How to run a step

1. Read the step and its "Leave alone" list.
2. Change only the files that step names, plus tests for that behavior.
3. Keep the current architecture: cookie session, Next.js shell + React Router screens, local-first trainings, pnpm.
4. Prove the step with the tests it lists. Run `pnpm typecheck` if types moved.
5. Commit to `dev`. Stop. Do not clean up neighboring code.

## Decisions to confirm before the gated steps

| Decision | Blocks | Working assumption until you say otherwise |
| -------- | ------ | ------------------------------------------ |
| One federation per deployment, or many | Step 3 tournament scope | Treat FederationAdmin as scoped to their federation, same idea as ClubAdmin and their own tournaments |
| Backup destination (S3-compatible bucket, Backblaze B2, Hetzner Storage Box, second VPS) | Step 4 | Any off-host, S3-compatible bucket; encrypted at rest; 30 daily + 12 monthly copies |
| Error tracking vendor (Sentry SaaS, self-hosted GlitchTip, none) | Step 6 | Sentry free tier with PII scrubbing; swap for GlitchTip if you prefer self-hosted |
| Email verification before full use | Step 9 | Local signup stays usable; verification is a later product change |
| Competition scorecard (`views/competition`) | Step 22 | Leave the mock in place |
| `trainings-legacy` and `InstallPrompt` | Step 22 | Leave them until you confirm nothing links to them |
| Object storage vs disk uploads | Later | Keep local disk |
| CI-built images pulled by the VPS | Later | Keep building on the VPS |

## Order

| Step | Phase | Outcome |
| ---- | ----- | ------- |
| 0 | Prerequisite | CI runs for `dev`, the branch we commit to |
| 1 | Account safety | Stolen sessions die when the password changes |
| 2 | Account safety | Login, signup, reset, and OAuth exchange have their own limits |
| 3 | Account safety | Club and federation admins cannot act outside their org |
| 4 | Operability | Nightly off-host database backups with a tested restore |
| 5 | Operability | Health endpoints, graceful shutdown, container limits, deploy that verifies itself |
| 6 | Operability | Structured logs with request ids, and error tracking on API and web |
| 7 | Secrets at rest | Reset and invite tokens are hashed; invites cannot be burned or stolen by the link alone |
| 8 | Secrets at rest | Signup password rules match reset and change |
| 9 | Confidentiality | Tournament attachments are not world-readable |
| 10 | Safe to refactor | Patrol layout and generation have transactions and tests |
| 11 | Safe to refactor | Offline sync can be tested without React |
| 12 | Structure | HTTP client is split by domain |
| 13 | Structure | Web and API share the stable response types |
| 14 | Structure | Home and application admin are smaller screens |
| 15 | Structure | One image crop/upload component |
| 16 | Performance | Screens load on demand; first-load bundle has a budget |
| 17 | Hardening | Mail, browser headers, and push links stop being injection paths |
| 18 | Hardening | Admin actions leave an audit trail |
| 19 | Hardening | Remaining medium and low security items |
| 20 | Gates | Playwright, locale parity, and coverage run in CI; local hooks get faster |
| 21 | Gates | Two UI flows have component tests; accessibility and Lighthouse budgets |
| 22 | Cleanup | Dead routes and aliases removed after confirmation |
| 23 | Cleanup | Docs and tooling match the repo |
| 24 | Cleanup | Framework majors caught up |
| 25–32 | Later | Only with an explicit go-ahead |

---

## Prerequisite

### Step 0 — CI runs on `dev`

**Why:** `.github/workflows/ci.yml` runs audit, lint, typecheck, unit tests, and build, but only on pushes and pull requests to `main`. Every commit on `dev` skips it, so the tests added in later steps would never run in CI.

**Change:**

- Trigger on `push` to `dev` and `main`, and on `pull_request` to both.
- Add `concurrency` so a new push cancels the previous run for the same branch.

**Where:** `.github/workflows/ci.yml`.

**Leave alone:** Job contents, Playwright, Husky hooks.

**Done when:** The next push to `dev` shows a green (or honestly red) CI run.

- [ ] Step 0

---

## Phase 1 — Account safety

### Step 1 — Revoke sessions on credential change

**Why:** A password reset or change leaves every existing `AuthSession` valid until it expires (HIGH-01).

**Change:**

- On successful password reset, password change, OAuth user set-password, and completed admin reset, revoke every session for that user.
- Invalidate outstanding reset tokens once they are used.
- Add a focused test in `auth.service` / `session.service` / `user.service` specs.

**Where:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/session.service.ts`, `apps/api/src/user/user.service.ts`.

**Leave alone:** New "log out other devices" UI, cookie flags.

**Done when:** A test shows sessions created before the password change fail afterward, and the current request's new session (if one is issued) still works.

- [ ] Step 1

### Step 2 — Dedicated auth rate limits

**Why:** Login, signup, forgot-password, reset, and OAuth exchange share the global 100 requests / minute budget (HIGH-02).

**Change:**

- Add stricter `@Throttle` on those routes (single-digit per minute per IP).
- Keep forgot-password and login error messages uniform.
- Cover the throttle metadata or guard behavior with a test if the suite already boots a Nest app; otherwise a unit test around the configured limits.

**Where:** `apps/api/src/auth/auth.controller.ts`, `apps/api/src/user/user.controller.ts` signup, `apps/api/src/app.module.ts` only if a named throttler is required.

**Leave alone:** CAPTCHA, account lockout UX, Traefik config.

**Done when:** Auth entrypoints declare tighter limits than the global guard, and other routes stay at the global limit.

- [ ] Step 2

### Step 3 — Scope admin mutations to the org

**Why:** FederationAdmin can email a password reset for any user, ClubAdmin/FederationAdmin can apply on behalf of any user, and FederationAdmin can update any tournament (HIGH-03, HIGH-04, HIGH-05).

**Change:**

- `POST auth/admin/reset-password/:userId` uses the same scope as admin user read (`getAdminScope` / `canViewUserAsAdmin`). GeneralAdmin stays global.
- `POST /tournament-applications/admin` requires the target user to be inside that admin's audience (the announcements code already does this for recipients).
- `canUpdateTournament` for FederationAdmin matches the stricter application-view rule: only tournaments tied to their federation, not every tournament.
- Extend `permissions.service` and application/auth specs.

**Where:** `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/permissions.service.ts`, `apps/api/src/tournament/tournament-application.controller.ts`.

**Leave alone:** The role matrix UI, announcement sending, ClubAdmin invite flow (already calls `assertCanManageClub`).

**Done when:** Specs fail a FederationAdmin acting on a user or tournament outside their scope, and succeed inside it.

- [ ] Step 3

---

## Phase 2 — Operability

### Step 4 — Database backups with a restore drill

**Why:** Postgres lives in a single Docker volume on one VPS. Nothing in `deploy/` or `DEPLOYMENT.md` backs it up. A disk failure or a bad migration is currently unrecoverable.

**Change:**

- Add a `db-backup` service to `deploy/docker-compose.prod.yml` that runs `pg_dump` nightly (custom format, compressed) and ships the file off-host to the bucket from the decisions table, encrypted (`age` or server-side encryption).
- Retention: 30 daily, 12 monthly. Prune automatically.
- Back up the uploads directories the same way (they are the only other state).
- Write `deploy/restore.md`: restore into a scratch Postgres container, run `migration:up`, spot-check row counts. Do the drill once and record the date in that file.
- Alert on a missed backup (the bucket's object age, or a healthcheck ping service).

**Where:** `deploy/docker-compose.prod.yml`, new `deploy/backup/` script, `DEPLOYMENT.md`, `.env.example` (bucket variable names only).

**Leave alone:** Object storage for live uploads (that is a later step), Postgres major version.

**Done when:** A backup object appears off-host after the first scheduled run, and a restore drill produced a working database from it.

- [ ] Step 4

### Step 5 — Health, shutdown, and a self-verifying deploy

**Why:** The API exposes only a hello `GET /`. Compose has a healthcheck for the frontend but none for the API. `deploy.sh` prints `Done` regardless of whether the new container came up. There is no `enableShutdownHooks`, so Docker's SIGTERM drops in-flight requests and open DB connections. The 4 GB VPS has no memory limits or log rotation on containers.

**Change:**

- `@nestjs/terminus`: `GET /health` (liveness) and `GET /health/ready` (Postgres ping). Replace the hello handler; no framework banner.
- `app.enableShutdownHooks()` in `main.ts`; MikroORM closes on shutdown.
- Compose: API healthcheck against `/health/ready`, `frontend` `depends_on` API healthy, `mem_limit` per service, `logging` with `json-file` `max-size` / `max-file`.
- `deploy.sh`: after `up -d`, poll the service healthcheck; on failure print the last 50 log lines and exit non-zero instead of `Done`.
- Web `connectivity.ts` and the DEPLOYMENT health section point at `/health`.

**Where:** `apps/api/src/main.ts`, `apps/api/src/app.controller.ts` (or a new `health` module), `deploy/docker-compose.prod.yml`, `deploy/deploy.sh`, `DEPLOYMENT.md`.

**Leave alone:** Traefik, CI-built images, zero-downtime rollout.

**Done when:** `docker compose ps` shows both app containers `healthy`, a deploy with a deliberately broken env exits non-zero, and `GET /` no longer returns the hello string.

- [ ] Step 5

### Step 6 — Structured logs and error tracking

**Why:** Only 13 API files use `Logger`. There is no request id, no JSON logs, and no error reporting for either app. When live breaks, the only signal is a user message.

**Change:**

- `nestjs-pino`: JSON logs in production, pretty in development, `X-Request-Id` generated per request and echoed in the response, redaction of `authorization`, `cookie`, `set-cookie`, `password`, and token fields. Replace `console.*` in app code (not `scripts/` or `seeders/`).
- Error tracking (vendor from the decisions table) on API and web with `release = NEXT_PUBLIC_APP_BUILD_ID` / git SHA, environment `test` or `prod`, PII scrubbing on, no request bodies. Web: wire into the existing `ErrorBoundary` and `RouteErrorBoundary`.
- One global Nest `ExceptionFilter` that logs 5xx with the request id and returns a stable `{ statusCode, message, requestId }` body. 4xx keep Nest's shape.
- Ops checklist: a free external uptime monitor on both origins' `/health`.

**Where:** `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, a new `apps/api/src/common/` filter, `apps/web/src/components/ErrorBoundary*`, env names in `.env.example`.

**Leave alone:** Metrics/Prometheus, tracing, log shipping to a hosted stack.

**Done when:** A thrown error in a controller appears in the tracker with the request id, and the same id is in the JSON log line and in the response.

- [ ] Step 6

---

## Phase 3 — Secrets and private files

### Step 7 — Hash reset and invitation tokens

**Why:** Sessions and OAuth codes are hashed; password-reset and club-invitation tokens are stored and compared in plaintext. Accepting an invite does not require the invitee's session, and a missing user marks the invite accepted (MEDIUM-01, MEDIUM-02).

**Change:**

- Store SHA-256 of reset and invitation tokens, same helper pattern as session hashes. Compare hashes, not raw strings.
- Invitation accept requires a logged-in user whose email matches the invite. Do not mark the invite accepted unless membership is created.
- Keep the raw token only in the email link. Stop putting the raw token in in-app notification payloads; use a path that still requires auth.
- Migration for existing rows: existing unused tokens cannot be verified after this change, so expire them in the migration.

**Where:** `apps/api/src/user/user.service.ts`, `apps/api/src/user/entity/user.entity.ts`, `apps/api/src/club/club-invitation.service.ts`, `apps/api/src/club/club-membership.controller.ts`, a new MikroORM migration.

**Leave alone:** Session cookie format, OAuth exchange (already hashed).

**Done when:** DB fixtures contain hashes only; accept without a matching session fails; accept with no user leaves the invite pending.

- [ ] Step 7

### Step 8 — One password policy

**Why:** Signup allows 6 characters; reset and change require 8 (MEDIUM-04).

**Change:**

- `CreateUserDto` and `UserService.create` require the same minimum as reset (8).
- Reject shorter passwords in the signup UI with the existing i18n pattern.

**Where:** `apps/api/src/user/dto/create-user.dto.ts`, `apps/api/src/user/user.service.ts`, signup view and locale keys for all six languages.

**Leave alone:** Complexity rules, email verification, bcrypt cost.

**Done when:** API and signup UI reject a 6-character password and accept an 8-character one.

- [ ] Step 8

### Step 9 — Authenticated attachment downloads

**Why:** Upload writes are authorized; every file under `/uploads`, including tournament attachments, is then served with no auth (MEDIUM-03, MEDIUM-09).

**Change:**

- Keep avatars, banners, and logos on the public static path.
- Serve `uploads/attachments` through an authenticated controller that checks tournament view/manage permission.
- Set `Content-Disposition: attachment` and a safe content type. Sniff magic bytes before save; do not trust the client MIME alone.
- Update web attachment links to the new route.

**Where:** `apps/api/src/main.ts`, `apps/api/src/upload/`, tournament attachment callers in `apps/web`.

**Leave alone:** Moving files to S3, image sharp pipeline (already re-encodes to WebP).

**Done when:** An anonymous GET of an attachment URL returns 401, and a user who may view that tournament still downloads it.

- [ ] Step 9

---

## Phase 4 — Make the risky modules safe to change

### Step 10 — Patrol writes and generation tests

**Why:** `PatrolService` is the largest API service, batch layout is not in a transaction, and generation has no golden tests.

**Change:**

- Wrap `batchUpdatePatrolLayout` (and any other multi-entity mutation in this service) in `em.transactional`.
- Load patrols and leaders in batches instead of per-row `findOne`.
- Replace `Record<string, unknown>` returns on this path with the patrol DTO types already started in `@sokil/shared-types`.
- Add golden tests for `PatrolGenerationService` using fixed inputs and expected groups.
- Add a service spec for batch layout that fails if a throw leaves partial membership.

**Where:** `apps/api/src/tournament/patrol.service.ts`, `patrol-generation.service.ts`, their specs.

**Leave alone:** PDF layout (`patrol-pdf.service.ts`), patrol drag-and-drop UI, splitting the Nest module.

**Done when:** Generation tests pin the current grouping, and the batch-update spec covers rollback.

- [ ] Step 10

### Step 11 — Testable offline sync engine

**Why:** Training integrity lives in `local-data-context.tsx` (~584 lines) with no tests. Storage and sync utils are tested; the orchestration is not.

**Change:**

- Move push / merge / tombstone decisions into a plain module under `apps/web/src/utils/` (or next to the existing sync util).
- Leave the context as the React adapter: storage, auth, debounce, error strings.
- Add tests for duplicate push, offline edit then online merge, and tombstone vs server row.

**Where:** `apps/web/src/contexts/local-data-context.tsx`, `apps/web/src/utils/local-data-sync.ts`, `local-data-storage.ts`.

**Leave alone:** A new state library, multi-device merge policy, API training routes.

**Done when:** The new engine tests fail if a tombstoned local session is resurrected by a sync response.

- [ ] Step 11

---

## Phase 5 — Structure

### Step 12 — Split the API client

**Why:** `apps/web/src/services/api.ts` (~1,450 lines, ~124 methods) mixes CSRF, offline cache, and every domain.

**Change:**

- Extract a small `httpClient` that owns base URL, credentials, timeout, CSRF header, offline fallback, and forwards the `X-Request-Id` from Step 6 into error reports.
- Move methods into domain modules (`auth`, `tournaments`, `trainings`, `equipment`, `clubs`, `notifications`, `uploads`) re-exported from one `apiService` so call sites stay stable.
- Delete deprecated category stubs only when no caller remains.

**Where:** `apps/web/src/services/`.

**Leave alone:** React Query, SWR, DTO moves (Step 13), backend controllers.

**Done when:** `api.ts` is a barrel or a thin facade, existing call sites compile, and CSRF still attaches on POST/PUT/PATCH/DELETE.

- [ ] Step 12

### Step 13 — Shared response contracts

**Why:** `TournamentDto`, training, and equipment response shapes live only in `apps/web/src/services/types.ts`, so the API can drift silently.

**Change:**

- Move those stable response types into `packages/shared-types` and import them from web and from API response mapping.
- Keep class-validator input DTOs in `apps/api`.
- Add a shared-types build to the check you run for this step.

**Where:** `packages/shared-types/src/`, `apps/web/src/services/types.ts`, API services that return those resources.

**Leave alone:** OpenAPI generation (a later option), write-DTO duplication that is still validated by class-validator, `User` language field aliases.

**Done when:** Web list/detail screens and the API compile against the same tournament, training, and equipment types.

- [ ] Step 13

### Step 14 — Thin two fat screens

**Why:** `Home` (~962 lines) and `admin-applications` (~966 lines) each own fetching, dialogs, and layout.

**Change:**

- Split each into presentational sections and one container that still uses the current `apiService` + `useState` loading pattern.
- Use the global snackbar (`useNotification`) in the admin screen instead of a second local snackbar.

**Where:** `apps/web/src/views/Home/`, `apps/web/src/views/tournament/admin-applications/`.

**Leave alone:** Other large views (patrols page, statistics, profile forms), a new data-fetching library.

**Done when:** Each container file is a composition of sections, behavior of load / error / status update is unchanged, and both routes still render in the running app.

- [ ] Step 14

### Step 15 — One image crop uploader

**Why:** `AvatarUploader`, `BannerUploader`, and `LogoUploader` repeat crop, canvas export, and `uploadImage`.

**Change:**

- Add one primitive parameterized by aspect ratio, upload kind, and copy.
- Keep the three public components as thin wrappers so call sites stay put.

**Where:** `apps/web/src/components/AvatarUploader/`, `BannerUploader/`, `LogoUploader/`.

**Leave alone:** Upload authorization on the API, attachment uploads.

**Done when:** Avatar, banner, and logo still crop and upload through the shared primitive.

- [ ] Step 15

### Step 16 — Load screens on demand

**Why:** `Content.tsx` imports every view eagerly, so the `[lang]/[[...path]]` route ships ~610 kB of first-load JS to a guest opening the About page. Admin tables, patrol drag-and-drop, PDF tooling, charts, and the 2,300-line glossary all load for everyone.

**Change:**

- `React.lazy` + `Suspense` per route in `Content.tsx`, using the existing `RouteLoadingSpinner` as fallback. Keep sign-in, home, and the training tab eager if they measurably need it.
- Lazy-load heavy leaves inside screens: recharts (statistics), Atlaskit DnD (patrols), canvas-confetti, the glossary data module.
- Add a bundle budget check to CI (`size-limit` or a script over `.next/build-manifest`) that fails when the shared first-load JS grows by more than an agreed margin.
- Confirm the Serwist precache still covers the lazy chunks so offline navigation keeps working.

**Where:** `apps/web/src/components/Content/Content.tsx`, the screens that import heavy libraries, `.github/workflows/ci.yml`, `apps/web/package.json`.

**Leave alone:** Moving screens into the App Router, removing MUI, image pipeline.

**Done when:** First-load JS for the catch-all route drops materially (target under 300 kB), the offline shell still opens trainings after a reload, and CI fails on a budget regression.

- [ ] Step 16

---

## Phase 6 — Hardening

### Step 17 — Email, headers, and notification links

**Why:** Template variables are concatenated into HTML mail (MEDIUM-10). The web app sets no CSP or frame headers (MEDIUM-08). Push `notificationclick` can open an absolute admin-supplied URL (LOW-04).

**Change:**

- HTML-escape every interpolated value in `apps/api/src/email/templates/`. Encode URLs used in attributes.
- Add baseline security headers in `apps/web/next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` via CSP, and a CSP that still allows the current MUI/GA/script needs. Check response headers in the browser.
- In `apps/web/src/app/sw.ts`, open only same-origin relative paths (`isSafeRelativePath`).

**Where:** email templates, `apps/web/next.config.ts`, `apps/web/src/app/sw.ts`.

**Leave alone:** Traefik config on the VPS, HSTS at the edge (ops checklist below).

**Done when:** A name containing `<img>` is escaped in the welcome mail string, a push URL of `https://evil.example` is ignored, and the document response includes the new headers.

- [ ] Step 17

### Step 18 — Admin audit trail

**Why:** ClubAdmin, FederationAdmin, and GeneralAdmin change roles, edit the permission matrix, trigger password resets, delete users, and approve or reject applications. None of that is recorded beyond the row's final state. After Step 3 the scope is right; this makes misuse or mistakes reconstructable.

**Change:**

- `audit_log` entity: actor id, actor role, action key, target type, target id, request id (from Step 6), timestamp, small JSON diff. Append-only; no update or delete endpoints.
- Write entries from the services for: role change, permission matrix PATCH, admin reset-password, user delete, application approve/reject, club/federation membership changes, tournament delete.
- GeneralAdmin read endpoint with pagination and filters; no UI beyond a plain table under the admin panel.
- Retention note in `DEPLOYMENT.md` (keep 12 months by default).

**Where:** new `apps/api/src/audit/` module, the services listed, one migration, a small admin view.

**Leave alone:** Auditing reads, per-user activity feeds, exporting logs.

**Done when:** A spec proves each listed action writes exactly one entry with the actor and target, and the table renders for GeneralAdmin only.

- [ ] Step 18

### Step 19 — Remaining security items

Do these as one step only because each change is small. Skip any item that needs a product decision.

| Item | Action |
| ---- | ------ |
| MEDIUM-06 registration enumeration | Signup conflict becomes the same generic message as a successful pending state, or stays specific if product wants immediate "email taken" UX — ask first if unsure, default to a uniform API message |
| MEDIUM-07 `COOKIE_DOMAIN` | Document in `DEPLOYMENT.md` that parent domains (`.fedirko.pro`) widen CSRF to sibling sites. Do not change live env from the repo |
| MEDIUM-11 push endpoint | Upsert only if the endpoint is free or already owned by the caller; otherwise 409 |
| MEDIUM-12 seed passwords | Randomize seeder passwords; `reseed-users.ts` refuses to run without an explicit env flag |
| LOW-01 CSRF compare | `crypto.timingSafeEqual` on equal-length buffers |
| LOW-02 / LOW-03 dead JWT | Delete `JwtStrategy`, `passport-jwt`, `@nestjs/jwt`, and rename `JwtAuthGuard` to `SessionAuthGuard` in the same change so imports stay consistent. Drop `JWT_SECRET` from required env if nothing else reads it |
| LOW-05 cached profile | Confirm logout clears `cached-user` and do not add new profile fields to that snapshot |
| bcrypt cost | Raise to 12 for new hashes; existing hashes rehash on next successful login |

**Leave alone:** Email verification (later), payments.

**Done when:** Each row above has a test or a documented ops note, and `rg JwtAuthGuard` / `rg JwtStrategy` under `apps/api/src` is empty.

- [ ] Step 19

---

## Phase 7 — Gates

### Step 20 — CI owns the slow checks

**Why:** CI (after Step 0) runs unit tests and build, but not Playwright. Six locale files are kept in sync by hand plus `scripts/sync-i18n.py`; a missing key ships silently as an English fallback. Coverage is never reported. The local pre-push hook runs a full `next build`, which is slow and duplicates CI.

**Change:**

- CI job for Playwright (`apps/web/e2e`) against a production build with a mocked or seeded API, uploading the trace on failure.
- CI step that fails when the six `locales/*/common.json` files do not have identical key sets, and when a key used in `t('...')` is missing from `en`.
- Coverage report (Vitest `--coverage`, Jest `--coverage`) uploaded as an artifact. No threshold yet; record the baseline number in this file when the step lands.
- Pre-push hook becomes `typecheck` + `lint` + unit tests. CI owns `next build` and `nest build`.
- Cache pnpm store and Next build cache in CI.

**Where:** `.github/workflows/ci.yml`, `.husky/pre-push`, `apps/web/scripts/pre-push-check.mjs`, a small locale check script under `scripts/`.

**Leave alone:** Rewriting API tests from Jest to Vitest, Testcontainers, coverage thresholds.

**Done when:** A PR to `dev` shows unit, e2e, and locale jobs; a deliberately deleted `de` key fails CI; pushing from a laptop takes under a minute of checks.

- [ ] Step 20

### Step 21 — Component tests, accessibility, and Lighthouse budgets

**Why:** There are zero React component tests despite Testing Library being installed. Nothing checks accessibility or performance regressions on an athlete-facing PWA used on phones outdoors.

**Change:**

- One Testing Library test for the training start guard and one for the application status update path. Extract the pure decision first if the page is still too heavy to render.
- `@axe-core/playwright` in the two existing e2e specs plus sign-in and tournament list; fail on `serious` and `critical` violations.
- Lighthouse CI on the production build for `/en/about`, `/en/signin`, and the trainings tab: assert PWA installability, accessibility ≥ 90, performance budget consistent with Step 16.
- Fix what those checks find on the covered pages only (contrast, labels, focus order, tap targets).

**Where:** `apps/web/src/**/*.test.tsx`, `apps/web/e2e/`, `.github/workflows/ci.yml`, `lighthouserc` in `apps/web`.

**Leave alone:** Full a11y sweep of every screen, design changes.

**Done when:** The two component tests fail if the guard or status action is removed, and the a11y and Lighthouse jobs pass on `dev`.

- [ ] Step 21

---

## Phase 8 — Cleanup

### Step 22 — Remove confirmed legacy

**Only after you confirm the decisions table.**

- Unused `components/InstallPrompt/` if AppStatusBar owns install UX.
- `views/Trainings.tsx` and the `trainings-legacy` route.
- `ApiService` category stubs and `data/categories.ts` if bow-category APIs cover every caller.
- Competition mock route, or a feature flag, if it should not ship.
- Deprecated `Roles` / `UserRoles` aliases after call sites use `ROLES`.
- One-off scripts under `apps/api/src/scripts/` that were for a past data migration.

**Done when:** Those entry points are gone and `pnpm typecheck` is clean.

- [ ] Step 22

### Step 23 — Tooling and doc drift

**Change:**

- `AGENTS.md`: Next + React Router is intentional; Renovate (not Dependabot) owns dependency bumps.
- `DEPLOYMENT.md` "Git Workflow": `dev` deploys to test, `main` to live; remove "deploy from origin/main" as the only path.
- Either call Turbo from root scripts (remote cache off) or remove `turbo` and `@turbo/windows-64`.
- `@types/react` / `@types/react-dom` match the installed React major (currently 19 vs 18).
- `.claude/` and `dist/` at the repo root: ignore or remove.
- Point contributors at this file.

**Leave alone:** Product behavior.

**Done when:** A new agent reading `AGENTS.md` and `DEPLOYMENT.md` does not look for ESLint configs, a live JWT login, or a main-only deploy.

- [ ] Step 23

### Step 24 — Framework majors

**Why:** Renovate automerges minor and patch, so majors pile up. Today: `@nestjs/config` 3, `@nestjs/passport` 10, `@nestjs/jwt` 10 (removed in Step 19) beside Nest 11; React 18 with Next 15 and MUI 7 (both support 19); Zod 3; Postgres 15 (17 is current).

**Change, one PR each, in this order:**

1. Nest satellites to the Nest 11 line (`@nestjs/config`, `@nestjs/passport`).
2. Zod 4 (`env.zod.ts` only).
3. React 19 + `@types/react` 19; run Playwright and the component tests; check MUI and react-router peer ranges.
4. Postgres 17 via the Step 4 backup: dump, new volume, restore, verify, switch. Keep the 15 volume until the next successful nightly backup.

**Leave alone:** Next 16 or MUI 8 unless they are already current when this step starts; evaluate then.

**Done when:** CI is green on each PR and the live containers report the new versions.

- [ ] Step 24

---

## Phase 9 — Later, only when asked

These are real, and they are not part of the default queue.

| Step | Topic | Rule |
| ---- | ----- | ---- |
| 25 | CI-built images | Build API and web images in GitHub Actions, push to GHCR tagged with the SHA, VPS pulls instead of building. Gives rollback by tag and removes OOM builds. Do this before any larger traffic push |
| 26 | Next.js + React Router | Document only. Do not move screens one-by-one into the App Router |
| 27 | Notification delivery | Push already covers important types. Replace the 60s poll only with a designed channel (SSE or push), not both plus polling |
| 28 | Upload storage | Introduce object storage only when a second API instance is planned. Single-host bind mounts stay valid until then |
| 29 | Email verification | Gate local accounts before club, tournament, or admin actions. Google users already have a verified email from Google |
| 30 | Data export | "Download my data" JSON for trainings, equipment, profile, applications. Self-delete already exists |
| 31 | Generated contract | If Step 13 hand-copying becomes a drift source, add `@nestjs/swagger` decorators and generate the client types in CI. Never expose Swagger UI in production |
| 32 | Payments | No processor until a product spec exists. `MyPayments` stays labeled demo |

Also parked from the architecture review, not steps yet: streak cron loads every training date at 18:00 Europe/Lisbon; fine until row counts grow. Revisit with a per-user query when trainings leave the small-data range.

- [ ] Step 25
- [ ] Step 26
- [ ] Step 27
- [ ] Step 28
- [ ] Step 29
- [ ] Step 30
- [ ] Step 31
- [ ] Step 32

---

## Ops checklist (no repo change required)

Confirm on the VPS before calling the security and operability work finished:

- API containers run `NODE_ENV=production` (secure cookies, seeder skip, email test routes 404).
- Traefik is the only ingress (`trust proxy` is 1), sends HSTS, has gzip/brotli compression on, and hides its dashboard.
- Whether live `sokil.app` sets `COOKIE_DOMAIN`.
- Disk headroom on the VPS after Step 5 log rotation; Docker image prune is scheduled.
- Attachment files currently on disk are acceptable to leave public until Step 9 ships.
- An external uptime monitor watches both origins' `/health` (Step 6).
- The first off-host backup exists and the restore drill date is recorded (Step 4).

## Explicitly out of scope

- Rewriting the UI off MUI.
- Replacing React Context with another store.
- A second web origin.
- Kubernetes, multi-region, or a managed database while the product fits one VPS.
- Penetration testing. After Steps 1–9, a focused re-review of auth and uploads is the right follow-up.
