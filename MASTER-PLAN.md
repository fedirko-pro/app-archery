# Sokil master plan

**Date:** 2026-09-29  
**Status:** Not started. Execute one step at a time.  
The 2026-09-29 architecture, code, and security reviews are folded into the steps below.

This is the only improvement backlog. Do not start a later step because it looks related. When a step is finished, check it off here and note the commit.

## How to run a step

1. Read the step and its "Leave alone" list.
2. Change only the files that step names, plus tests for that behavior.
3. Keep the current architecture: cookie session, Next.js shell + React Router screens, local-first trainings, pnpm.
4. Prove the step with the tests it lists. Run `pnpm typecheck` if types moved.
5. Stop. Do not clean up neighboring code.

## Decisions to confirm before the gated steps

| Decision | Blocks | Working assumption until you say otherwise |
| -------- | ------ | ------------------------------------------ |
| One federation per deployment, or many | Step 3 tournament scope | Treat FederationAdmin as scoped to their federation, same idea as ClubAdmin and their own tournaments |
| Email verification before full use | Step 6 | Local signup stays usable; verification is a later product change |
| Competition scorecard (`views/competition`) | Step 16 | Leave the mock in place |
| `trainings-legacy` and `InstallPrompt` | Step 16 | Leave them until you confirm nothing links to them |
| Object storage vs disk uploads | Step 20 | Keep local disk |

## Order

| Step | Phase | Outcome |
| ---- | ----- | ------- |
| 1 | Account safety | Stolen sessions die when the password changes |
| 2 | Account safety | Login, signup, reset, and OAuth exchange have their own limits |
| 3 | Account safety | Club and federation admins cannot act outside their org |
| 4 | Secrets at rest | Reset and invite tokens are hashed; invites cannot be burned or stolen by the link alone |
| 5 | Secrets at rest | Signup password rules match reset and change |
| 6 | Confidentiality | Tournament attachments are not world-readable |
| 7 | Safe to refactor | Patrol layout and generation have transactions and tests |
| 8 | Safe to refactor | Offline sync can be tested without React |
| 9 | Structure | HTTP client is split by domain |
| 10 | Structure | Web and API share the stable response types |
| 11 | Structure | Home and application admin are smaller screens |
| 12 | Structure | One image crop/upload component |
| 13 | Hardening | Mail, browser headers, and push links stop being injection paths |
| 14 | Hardening | Remaining medium and low security items |
| 15 | Gates | Tests run in CI; two UI flows have component tests |
| 16 | Cleanup | Dead routes and aliases removed after confirmation |
| 17 | Cleanup | Docs and unused tooling match the repo |
| 18–22 | Later | Only with an explicit go-ahead |

---

## Phase 1 — Account safety

### Step 1 — Revoke sessions on credential change

**Why:** A password reset or change leaves every existing `AuthSession` valid until it expires (HIGH-01).

**Change:**

- On successful password reset, password change, OAuth user set-password, and completed admin reset, revoke every session for that user.
- Invalidate outstanding reset tokens once they are used.
- Add a focused test in `auth.service` / `session.service` / `user.service` specs.

**Where:** `apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/session.service.ts`, `apps/api/src/user/user.service.ts`.

**Leave alone:** New "log out other devices" UI, JWT strategy, cookie flags.

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

## Phase 2 — Secrets and private files

### Step 4 — Hash reset and invitation tokens

**Why:** Sessions and OAuth codes are hashed; password-reset and club-invitation tokens are stored and compared in plaintext. Accepting an invite does not require the invitee's session, and a missing user marks the invite accepted (MEDIUM-01, MEDIUM-02).

**Change:**

- Store SHA-256 of reset and invitation tokens, same helper pattern as session hashes. Compare hashes, not raw strings.
- Invitation accept requires a logged-in user whose email matches the invite. Do not mark the invite accepted unless membership is created.
- Keep the raw token only in the email link. Stop putting the raw token in in-app notification payloads; use a path that still requires auth.
- Migration for existing rows: existing unused tokens cannot be verified after this change, so expire them in the migration.

**Where:** `apps/api/src/user/user.service.ts`, `apps/api/src/user/entity/user.entity.ts`, `apps/api/src/club/club-invitation.service.ts`, `apps/api/src/club/club-membership.controller.ts`, a new MikroORM migration.

**Leave alone:** Session cookie format, OAuth exchange (already hashed).

**Done when:** DB fixtures contain hashes only; accept without a matching session fails; accept with no user leaves the invite pending.

- [ ] Step 4

### Step 5 — One password policy

**Why:** Signup allows 6 characters; reset and change require 8 (MEDIUM-04).

**Change:**

- `CreateUserDto` and `UserService.create` require the same minimum as reset (8).
- Reject shorter passwords in the signup UI with the existing i18n pattern.

**Where:** `apps/api/src/user/dto/create-user.dto.ts`, `apps/api/src/user/user.service.ts`, signup view and locale keys for all six languages.

**Leave alone:** Complexity rules, email verification, bcrypt cost.

**Done when:** API and signup UI reject a 6-character password and accept an 8-character one.

- [ ] Step 5

### Step 6 — Authenticated attachment downloads

**Why:** Upload writes are authorized; every file under `/uploads`, including tournament attachments, is then served with no auth (MEDIUM-03, MEDIUM-09).

**Change:**

- Keep avatars, banners, and logos on the public static path.
- Serve `uploads/attachments` through an authenticated controller that checks tournament view/manage permission.
- Set `Content-Disposition: attachment` and a safe content type. Sniff magic bytes before save; do not trust the client MIME alone.
- Update web attachment links to the new route.

**Where:** `apps/api/src/main.ts`, `apps/api/src/upload/`, tournament attachment callers in `apps/web`.

**Leave alone:** Moving files to S3, image sharp pipeline (already re-encodes to WebP).

**Done when:** An anonymous GET of an attachment URL returns 401, and a user who may view that tournament still downloads it.

- [ ] Step 6

---

## Phase 3 — Make the risky modules safe to change

### Step 7 — Patrol writes and generation tests

**Why:** `PatrolService` is the largest API service, batch layout is not in a transaction, and generation has no golden tests (code analysis P1).

**Change:**

- Wrap `batchUpdatePatrolLayout` (and any other multi-entity mutation in this service) in `em.transactional`.
- Load patrols and leaders in batches instead of per-row `findOne`.
- Replace `Record<string, unknown>` returns on this path with the patrol DTO types already started in `@sokil/shared-types`.
- Add golden tests for `PatrolGenerationService` using fixed inputs and expected groups.
- Add a service spec for batch layout that fails if a throw leaves partial membership.

**Where:** `apps/api/src/tournament/patrol.service.ts`, `patrol-generation.service.ts`, their specs.

**Leave alone:** PDF layout (`patrol-pdf.service.ts`), patrol drag-and-drop UI, splitting the Nest module.

**Done when:** Generation tests pin the current grouping, and the batch-update spec covers rollback.

- [ ] Step 7

### Step 8 — Testable offline sync engine

**Why:** Training integrity lives in `local-data-context.tsx` (~584 lines) with no tests. Storage and sync utils are tested; the orchestration is not.

**Change:**

- Move push / merge / tombstone decisions into a plain module under `apps/web/src/utils/` (or next to the existing sync util).
- Leave the context as the React adapter: storage, auth, debounce, error strings.
- Add tests for duplicate push, offline edit then online merge, and tombstone vs server row.

**Where:** `apps/web/src/contexts/local-data-context.tsx`, `apps/web/src/utils/local-data-sync.ts`, `local-data-storage.ts`.

**Leave alone:** A new state library, multi-device merge policy, API training routes.

**Done when:** The new engine tests fail if a tombstoned local session is resurrected by a sync response.

- [ ] Step 8

---

## Phase 4 — Structure

### Step 9 — Split the API client

**Why:** `apps/web/src/services/api.ts` (~1,450 lines, ~124 methods) mixes CSRF, offline cache, and every domain.

**Change:**

- Extract a small `httpClient` that owns base URL, credentials, timeout, CSRF header, and offline fallback.
- Move methods into domain modules (`auth`, `tournaments`, `trainings`, `equipment`, `clubs`, `notifications`, `uploads`) re-exported from one `apiService` so call sites stay stable.
- Delete deprecated category stubs only when no caller remains.

**Where:** `apps/web/src/services/`.

**Leave alone:** React Query, SWR, DTO moves (Step 10), backend controllers.

**Done when:** `api.ts` is a barrel or a thin facade, existing call sites compile, and CSRF still attaches on POST/PUT/PATCH/DELETE.

- [ ] Step 9

### Step 10 — Shared response contracts

**Why:** `TournamentDto`, training, and equipment response shapes live only in `apps/web/src/services/types.ts`, so the API can drift silently.

**Change:**

- Move those stable response types into `packages/shared-types` and import them from web and from API response mapping.
- Keep class-validator input DTOs in `apps/api`.
- Add a shared-types build to the check you run for this step.

**Where:** `packages/shared-types/src/`, `apps/web/src/services/types.ts`, API services that return those resources.

**Leave alone:** OpenAPI generation, write-DTO duplication that is still validated by class-validator, `User` language field aliases.

**Done when:** Web list/detail screens and the API compile against the same tournament, training, and equipment types.

- [ ] Step 10

### Step 11 — Thin two fat screens

**Why:** `Home` (~962 lines) and `admin-applications` (~966 lines) each own fetching, dialogs, and layout.

**Change:**

- Split each into presentational sections and one container that still uses the current `apiService` + `useState` loading pattern.
- Use the global snackbar (`useNotification`) in the admin screen instead of a second local snackbar.

**Where:** `apps/web/src/views/Home/`, `apps/web/src/views/tournament/admin-applications/`.

**Leave alone:** Other large views (patrols page, statistics, profile forms), a new data-fetching library.

**Done when:** Each container file is a composition of sections, behavior of load / error / status update is unchanged, and both routes still render in the running app.

- [ ] Step 11

### Step 12 — One image crop uploader

**Why:** `AvatarUploader`, `BannerUploader`, and `LogoUploader` repeat crop, canvas export, and `uploadImage`.

**Change:**

- Add one primitive parameterized by aspect ratio, upload kind, and copy.
- Keep the three public components as thin wrappers so call sites stay put.

**Where:** `apps/web/src/components/AvatarUploader/`, `BannerUploader/`, `LogoUploader/`.

**Leave alone:** Upload authorization on the API, attachment uploads.

**Done when:** Avatar, banner, and logo still crop and upload through the shared primitive.

- [ ] Step 12

---

## Phase 5 — Hardening

### Step 13 — Email, headers, and notification links

**Why:** Template variables are concatenated into HTML mail (MEDIUM-10). The web app sets no CSP or frame headers (MEDIUM-08). Push `notificationclick` can open an absolute admin-supplied URL (LOW-04).

**Change:**

- HTML-escape every interpolated value in `apps/api/src/email/templates/`. Encode URLs used in attributes.
- Add baseline security headers in `apps/web/next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors` via CSP, and a CSP that still allows the current MUI/GA/script needs. Check response headers in the browser.
- In `apps/web/src/app/sw.ts`, open only same-origin relative paths (`isSafeRelativePath`).

**Where:** email templates, `apps/web/next.config.ts`, `apps/web/src/app/sw.ts`.

**Leave alone:** Traefik config on the VPS, HSTS at the edge (ops checklist below).

**Done when:** A name containing `<img>` is escaped in the welcome mail string, a push URL of `https://evil.example` is ignored, and the document response includes the new headers.

- [ ] Step 13

### Step 14 — Remaining security items

Do these as one step only because each change is small. Skip any item that needs a product decision.

| Item | Action |
| ---- | ------ |
| MEDIUM-06 registration enumeration | Signup conflict becomes the same generic message as a successful pending state, or stays specific if product wants immediate "email taken" UX — ask first if unsure, default to a uniform API message |
| MEDIUM-07 `COOKIE_DOMAIN` | Document in `DEPLOYMENT.md` that parent domains (`.fedirko.pro`) widen CSRF to sibling sites. Do not change live env from the repo |
| MEDIUM-11 push endpoint | Upsert only if the endpoint is free or already owned by the caller; otherwise 409 |
| MEDIUM-12 seed passwords | Randomize seeder passwords; `reseed-users.ts` refuses to run without an explicit env flag |
| LOW-01 CSRF compare | `crypto.timingSafeEqual` on equal-length buffers |
| LOW-02 / LOW-03 dead JWT | Delete `JwtStrategy` and rename `JwtAuthGuard` to `SessionAuthGuard` in the same change so imports stay consistent. Drop `JWT_SECRET` from required env if nothing else reads it |
| LOW-05 cached profile | Confirm logout clears `cached-user` and do not add new profile fields to that snapshot |
| LOW-07 `GET /` | Replace the hello string with a minimal health JSON and no framework banner |

**Leave alone:** Email verification (Step 21), bcrypt cost, payments.

**Done when:** Each row above has a test or a documented ops note, and `rg JwtAuthGuard` / `rg JwtStrategy` under `apps/api/src` is empty.

- [ ] Step 14

---

## Phase 6 — Gates and cleanup

### Step 15 — Tests in CI and two UI flows

**Why:** Pre-commit typechecks but does not test. Pre-push builds but does not run Jest or Vitest. There are zero React component tests.

**Change:**

- Add CI (or extend the existing workflow) to run `pnpm test:run` on pull requests.
- Add one Testing Library test for the training start guard and one for the application status update path. Prefer extracting the pure decision if the page is still too heavy to render.
- Do not fail the hook on Playwright yet; the two existing Playwright specs can join CI as a separate optional job.

**Where:** `.github/workflows/` if present, otherwise the repo's existing CI config; `apps/web` tests next to the flows.

**Leave alone:** Rewriting API tests from Jest to Vitest, Testcontainers.

**Done when:** A pull request runs unit tests, and the two new component tests fail if the guard or status action is removed.

- [ ] Step 15

### Step 16 — Remove confirmed legacy

**Only after you confirm the decisions table.**

- Unused `components/InstallPrompt/` if AppStatusBar owns install UX.
- `views/Trainings.tsx` and the `trainings-legacy` route.
- `ApiService` category stubs and `data/categories.ts` if bow-category APIs cover every caller.
- Competition mock route, or a feature flag, if it should not ship.
- Deprecated `Roles` / `UserRoles` aliases after call sites use `ROLES`.

**Done when:** Those entry points are gone and `pnpm typecheck` is clean.

- [ ] Step 16

### Step 17 — Tooling and doc drift

**Change:**

- `AGENTS.md`: shared-configs is TypeScript config; lint is Biome; API tests are Jest; web tests are Vitest; Next + React Router is intentional.
- Either call Turbo from root scripts or remove `turbo` and `@turbo/windows-64`.
- Point contributors at this file.

**Leave alone:** Product behavior.

**Done when:** A new agent reading `AGENTS.md` does not look for ESLint configs or a live JWT login.

- [ ] Step 17

---

## Phase 7 — Later, only when asked

These are real, and they are not part of the default queue.

| Step | Topic | Rule |
| ---- | ----- | ---- |
| 18 | Next.js + React Router | Document only. Do not move screens one-by-one into the App Router |
| 19 | Notification delivery | Push already covers important types. Replace the 60s poll only with a designed channel (SSE or push), not both plus polling |
| 20 | Upload storage | Introduce object storage only when a second API instance is planned. Single-host bind mounts stay valid until then |
| 21 | Email verification | Gate local accounts before club, tournament, or admin actions. Google users already have a verified email from Google |
| 22 | Payments | No processor until a product spec exists. `MyPayments` stays labeled demo |

Also parked from the architecture review, not steps yet: streak cron loads every training date at 18:00 Europe/Lisbon; fine until row counts grow. Revisit with a per-user query when trainings leave the small-data range.

- [ ] Step 18
- [ ] Step 19
- [ ] Step 20
- [ ] Step 21
- [ ] Step 22

---

## Ops checklist (no repo change required)

Confirm on the VPS before calling the security work finished:

- API containers run `NODE_ENV=production` (secure cookies, seeder skip, email test routes 404).
- Traefik is the only ingress (`trust proxy` is 1).
- Whether live `sokil.app` sets `COOKIE_DOMAIN`.
- Whether Traefik already sends HSTS and hides its dashboard.
- Attachment files currently on disk are acceptable to leave public until Step 6 ships.

## Explicitly out of scope

- Rewriting the UI off MUI.
- Replacing React Context with another store.
- A second web origin.
- Penetration testing. After Steps 1–6, a focused re-review of auth and uploads is the right follow-up.
