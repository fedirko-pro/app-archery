# Backend–Frontend Sync Code Review

**Date:** January 29, 2025  
**Scope:** DTO alignment, API endpoints vs hooks, and cross-workspace consistency (app-archery + archery-app-backend)

---

## Executive Summary

The frontend (app-archery) and backend (archery-app-backend) are largely aligned on auth, tournaments, patrols, clubs, rules, bow-categories, and uploads. Several **critical mismatches** affect user profile (language), tournament application create (division/bowCategory), rules route order, and upload image (entityId). This document lists endpoint ↔ hook mapping, DTO gaps, and recommended fixes.

---

## 1. API Endpoints vs Frontend Hooks

### 1.1 Auth

| Backend (NestJS) | Frontend (api.ts) | Status |
|------------------|-------------------|--------|
| `POST /auth/login` | `login(email, password)` | ✅ OK |
| `POST /auth/forgot-password` | `forgotPassword(email)` | ✅ OK |
| `POST /auth/reset-password` | `resetPassword(token, password, confirmPassword)` | ✅ OK |
| `POST /auth/set-password` (JWT) | `setPassword(password, confirmPassword)` | ✅ OK |
| `POST /auth/admin/reset-password/:userId` | `adminResetUserPassword(userId)` | ✅ OK |
| `GET /auth/google`, `GET /auth/google/callback` | OAuth redirect; FE stores token from callback | ✅ OK |

**Note:** Backend login returns only `{ access_token }`. Frontend `AuthResponse` type includes `user?: User`; FE correctly fetches user via `getProfile()` after login, so no change required.

---

### 1.2 Users

| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /users` | `register(userData)` | ✅ OK |
| `GET /users/profile` | `getProfile()` | ⚠️ **DTO mismatch** (see §2.1) |
| `PATCH /users/profile` | `updateProfile(profileData)` | ✅ OK |
| `PATCH /users/change-password` | `changePassword(passwordData)` | ✅ OK |
| `GET /users/admin/all` | `getAllUsers()` | ✅ OK |
| `GET /users/admin/:userId` | `getUserById(userId)` | ⚠️ **DTO mismatch** (see §2.1) |
| `PATCH /users/admin/:id` | `adminUpdateUser(userId, userData)` | ✅ OK |
| `DELETE /users/:id` | — | Backend has route; FE has no `deleteUser()` (optional) |

---

### 1.3 Tournaments

| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /tournaments` | `createTournament(data)` | ✅ OK |
| `GET /tournaments` | `getAllTournaments()` | ✅ OK |
| `GET /tournaments/:id` | `getTournament(id)` | ✅ OK |
| `PUT /tournaments/:id` | `updateTournament(id, data)` | ✅ OK |
| `DELETE /tournaments/:id` | `deleteTournament(id)` | ✅ OK |

---

### 1.4 Patrols

| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /patrols` | `getAllPatrols()` | ✅ OK |
| `GET /patrols/tournament/:tournamentId` | `getPatrolsByTournament(tournamentId)` | ✅ OK |
| `GET /patrols/:id` | `getPatrol(id)` | ✅ OK |
| `POST /patrols` | `createPatrol(data)` | ✅ OK |
| `PUT /patrols/:id` | `updatePatrol(id, data)` | ✅ OK |
| `DELETE /patrols/:id` | `deletePatrol(id)` | ✅ OK |
| `POST /patrols/:patrolId/members` | `addPatrolMember(patrolId, userId, role)` | ✅ OK |
| `DELETE /patrols/:patrolId/members/:userId` | `removePatrolMember(patrolId, userId)` | ✅ OK |
| `POST /patrols/tournaments/:id/generate` | `generatePatrolsPreview(id)` | ✅ OK |
| `POST /patrols/tournaments/:id/generate-and-save` | `generateAndSavePatrols(id)` | ✅ OK |
| `GET /patrols/tournaments/:id/pdf` | — | FE uses raw `fetch(API_BASE_URL/patrols/...)`; no `apiService` method (optional) |

---

### 1.5 Tournament Applications

| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /tournament-applications` | `createTournamentApplication(data)` | ⚠️ **Payload mismatch** (see §2.2) |
| `GET /tournament-applications/my-applications` | `getMyApplications()` | ✅ OK |
| `GET /tournament-applications/tournament/:id` | `getTournamentApplications(tournamentId)` | ✅ OK |
| `GET /tournament-applications/tournament/:id/stats` | `getTournamentApplicationStats(tournamentId)` | ✅ OK |
| `PUT /tournament-applications/:id/status` | `updateApplicationStatus(id, status, rejectionReason?)` | ✅ OK |
| `DELETE /tournament-applications/:id` | `withdrawApplication(id)` | ✅ OK |
| `DELETE /tournament-applications/:id/admin` | `deleteApplication(id)` | ✅ OK |
| `GET /tournament-applications` (admin all) | — | No FE method (admin list by tournament is enough) |
| `GET /tournament-applications/:id` | — | No FE `getApplicationById(id)`; add if needed for detail view |

---

### 1.6 Bow Categories, Rules, Clubs, Divisions

| Backend | Frontend | Status |
|---------|----------|--------|
| `GET /bow-categories`, `?ruleId=` | `getBowCategories(ruleId?)` | ✅ OK |
| `GET /bow-categories/:id` | `getBowCategoryById(id)` | ✅ OK |
| `GET /bow-categories/code/:code` | `getBowCategoryByCode(code)` | ⚠️ **Route order** (see §2.3) |
| `POST/PATCH/DELETE /bow-categories` | create/update/delete | ✅ OK |
| `GET /rules`, `GET /rules/:id`, `GET /rules/code/:ruleCode` | getRules, getRuleById, getRuleByCode | ⚠️ **Route order** (see §2.3) |
| `GET/POST/PATCH/DELETE /clubs` | getClubs, getClubById, upsertClub, deleteClub | ✅ OK |
| `GET /divisions`, `?ruleId=`, `GET /divisions/:id` | getDivisions(ruleId?), getDivisionById | ✅ OK |
| `POST/PATCH/DELETE /divisions` | — | FE has stubs `upsertDivision`/`deleteDivision` that throw; backend has real routes (FE can add when needed) |

---

### 1.7 Upload

| Backend | Frontend | Status |
|---------|----------|--------|
| `POST /upload/image` | `uploadImage(file, type, options?)` | ⚠️ **entityId** (see §2.4) |
| `POST /upload/attachment` | `uploadAttachment(file, tournamentId)` | ✅ OK |
| `DELETE /upload/attachment/:tournamentId/:filename` | `deleteAttachment(tournamentId, filename)` | ✅ OK |

---

## 2. DTO and Contract Mismatches

### 2.1 User profile: `language` vs `appLanguage` and `website`

- **Backend:** `User` entity has `appLanguage`; no `website` or `language` property.  
- **Backend controller:** `getProfile()` and `getUserById()` return a object that destructures `language` and `website` from `user` — but the entity has neither, so both are always `undefined`.
- **Frontend:** `User` type and components use `appLanguage`, `app_language`, or `language` (and sometimes `website`). Because the API never sends `appLanguage`, the UI can’t reliably show or persist app language.

**Recommendation:**

1. **Backend:** In `user.controller.ts`, map entity → response explicitly and include:
   - `language: user.appLanguage ?? undefined` (or keep a single field name, e.g. `appLanguage`, and use it everywhere).
   - Either add `website` to the User entity and DTOs if the product needs it, or remove `website` from the response so the contract is consistent.
2. **Frontend:** Standardize on one field (e.g. `appLanguage`) in `contexts/types.ts` and in components (LanguageToggler, profile-edit-form), and ensure the backend returns that field.

---

### 2.2 Tournament application create: `division`/`category` vs `divisionId`/`bowCategoryId`

- **Frontend:** Sends `createTournamentApplication({ tournamentId, division, category, notes, ... })` where:
  - `division` = division **id** (UUID from select),
  - `category` = bow category **code** (e.g. `"FSC"`) from select.
- **Backend controller:** Receives `{ tournamentId, category?, division?, equipment?, notes? }` and passes `{ ...data, applicantId }` to the service.
- **Backend service:** `create()` expects `divisionId` and `bowCategoryId` (UUIDs). It does **not** read `division` or `category`, so division and bow category are never set.

**Recommendation:**

1. **Backend:** In `tournament-application.controller.ts`, map body to service shape, e.g.:
   - `divisionId: data.division || undefined`
   - `bowCategoryId`: resolve from `data.category` — if it looks like a UUID use as id, else resolve by `code` via BowCategoryService and use the id.
2. **Frontend (optional but clearer):** Send `divisionId` and `bowCategoryId` (IDs only). In the application form, use `category.id` as value for the bow category select (instead of `category.code`) so the payload is `bowCategoryId`; keep sending division id as `divisionId` for consistency.

---

### 2.3 Rules (and Bow Categories) route order

- **Backend:** In `rule.controller.ts`, routes are declared as:
  - `GET :id` (findOne)
  - `GET code/:ruleCode` (findByCode)
- In NestJS, the first matching route wins. So `GET /rules/code/FABP` is matched by `GET :id` with `id = 'code'`, and `findByCode` is never called.

**Recommendation:** Declare the more specific route before the parametric one:
  - `GET code/:ruleCode` before `GET :id`.
- Apply the same pattern in `bow-category.controller.ts` if `GET code/:code` is declared after `GET :id`.

---

### 2.4 Upload image: `entityId` required vs optional

- **Backend:** `UploadImageDto` and upload service require `entityId` (used for filenames and overwrites).
- **Frontend:** `uploadImage(..., options?)` has `entityId` optional. `AvatarUploader` and `LogoUploader` pass `entityId`; `BannerUploader` does not. So banner uploads can fail validation when `entityId` is missing.

**Recommendation:** Either:
- Make `entityId` optional in the backend DTO and service: when missing, generate a UUID (or type-based path) for the file; or
- Require `entityId` in the frontend for all image types (e.g. pass tournament id for banner) and document it in the API.

---

## 3. DTO Sync Checklist (summary)

| Area | Backend | Frontend | Action |
|------|---------|----------|--------|
| User profile response | Return `language`/`website` (currently undefined) | Expects `appLanguage`/`language` | Backend: map `appLanguage` → `language` (or standardize on `appLanguage`); add or drop `website` |
| User update (profile) | `UpdateUserDto` has `appLanguage` | `ProfileData` has `appLanguage` | ✅ Aligned once response is fixed |
| Tournament application create | Service expects `divisionId`, `bowCategoryId` | Sends `division`, `category` (code) | Backend: map and resolve; FE: optional rename to ids |
| Application status | `ApplicationStatus` enum | `ApplicationStatus` type | ✅ Aligned |
| Upload image | `entityId` required | `entityId` optional; banner omits it | Make optional in BE or always send from FE |
| Rules/bow-categories | Route order | — | Move `code/:x` before `:id` in controllers |

---

## 4. Optional Improvements

- **Shared types package:** Consider a small shared package (or copied types) for DTOs used by both FE and BE (e.g. `CreateTournamentApplicationDto`, `ApplicationStatus`, user profile fields) to avoid drift.
- **Backend DTOs for tournaments/patrols:** Tournament and patrol controllers use `data: any`; introducing proper DTOs (e.g. `CreateTournamentDto`, `UpdatePatrolDto`) would improve validation and documentation.
- **Frontend:** Add `getApplicationById(id)` if an application-detail screen is needed; add a dedicated `downloadPatrolPdf(tournamentId)` on `apiService` that wraps the existing PDF URL fetch.

---

## 5. Priority Fixes

| Priority | Item | Owner | Status |
|----------|------|--------|--------|
| P0 | User profile: backend return `language`/`appLanguage` from entity and fix `website` | Backend | **Done** – controller now returns `language` and `appLanguage` from entity; `website` removed (not on entity) |
| P0 | Tournament application create: backend map `division`/`category` → `divisionId`/`bowCategoryId` (resolve category by code when not UUID) | Backend | **Done** – service accepts `division`/`category`, resolves divisionId and bowCategoryId (category by id or code) |
| P0 | Rules (and bow-categories) route order: `GET code/:param` before `GET :id` | Backend | **Done** – rule and bow-category controllers reordered |
| P1 | Upload image: make `entityId` optional in backend or always send from FE (banner) | Backend or FE | **Done** – backend DTO and service accept optional `entityId`; UUID generated when missing |
| P2 | Frontend: standardize User type to single language field (`appLanguage`) once backend is fixed | Frontend | Pending |
| P2 | Frontend application form: optionally send `divisionId`/`bowCategoryId` with IDs only | Frontend | Pending (backend accepts both id and code for category) |

Implementing the P0 and P1 items resolves the main sync issues between the two apps.
