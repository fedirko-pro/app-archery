# Detailed Code Review: UArchery App

**Date:** January 29, 2025  
**Scope:** Full codebase review (architecture, security, types, i18n, UX, maintainability)

---

## Executive Summary

The project is a React + TypeScript + Vite SPA for archery federation/tournament management, with i18n, PWA support, and a custom API layer. The structure is clear and the stack is modern. The main areas to improve are: **type safety** (heavy use of `any`), **i18n consistency** (hardcoded strings and comments), **bug fixes** (navigation, auth context), **test coverage** (none), **config hygiene** (ts-nocheck/ts-ignore), and **error handling / UX** (no Error Boundary, inconsistent user feedback).

---

## 1. Architecture & Project Structure

### Strengths
- **Clear separation:** `components/`, `pages/`, `contexts/`, `services/`, `config/`, `utils/`, `locales/`, `sass/` are well organized.
- **Single API service:** `ApiService` in `src/services/api.ts` centralizes backend calls, token handling, and `Accept-Language`.
- **Env validation:** `config/env.ts` validates required vars and fails fast in production.
- **Language-first routing:** `:lang` in routes and `LangLayout` syncing i18n with path is consistent.

### Suggestions
- **Path aliases:** No `baseUrl`/`paths` in `tsconfig.json`; deep relative imports like `../../../services/api` are used. Consider aliases (e.g. `@/services/api`) for readability and refactors.
- **Route definitions:** Consider moving route config (path strings, protected flags) into a single module to avoid duplication and simplify adding new routes.

---

## 2. TypeScript & Type Safety

### Critical: Overuse of `any`

There are **68+ usages** of `any` across the codebase, which weakens type safety and refactoring safety.

| Location | Issue |
|----------|--------|
| `src/services/api.ts` | `adminUpdateUser(userData: any)`, tournament/patrol/application methods return `Promise<any>` or `Promise<any[]>` |
| `src/pages/tournament/*` | Tournament types use `createdBy: any`; state `useState<any[]>()`, `useState<any>(null)`; `(t: any)`, `(application: any)` in callbacks |
| `src/pages/profile/profile-edit-page.tsx` | `(user as any).appLanguage`, `(user as any).app_language`, `(user as any).language` |
| `src/pages/admin/user-profile-view.tsx` | `(foundUser as any).categories`, `(user as any)?.categories` |
| `src/components/LanguageToggler/LanguageToggler.tsx` | `(user as any)?.appLanguage`, `(value as any)` for language |
| `src/components/AvatarUploader/AvatarUploader.tsx` | `style={{ ['--avatar-size' as any]: ... }}`, `onChange={handleZoomChange as any}` |
| `src/components/Converter/ConverterInputs.tsx` | `props: any` |
| `src/pages/competition/user-card/user-card.tsx` | `props: any` |
| `src/pages/profile/profile-card/profile-card.tsx` | `user: any` |
| `src/utils/i18n-lang.ts` | `pickLocalizedDescription(record: { [k: string]: any }, ...)` |

**Recommendations:**
- Define shared types for **Tournament**, **Patrol**, **TournamentApplication**, **CreatedBy** (user stub), and use them in API and pages.
- Extend **User** (or backend DTO type) with `appLanguage` / `app_language` so that profile and LanguageToggler don’t need `as any`.
- Use proper MUI types for Slider (e.g. `SliderChangeHandler`) instead of `as any` in AvatarUploader/BannerUploader.
- Use CSS custom properties via a type-safe approach (e.g. `React.CSSProperties` with a cast only for `--avatar-size`) or a small typed helper.

---

## 3. Bugs & Correctness

### 3.1 Navigation missing leading slash (auth-context)

**File:** `src/contexts/auth-context.tsx` (around line 219)

```ts
navigate(`${currentLang}/profile`);
```

This produces a path like `pt/profile` (relative). It should be:

```ts
navigate(`/${currentLang}/profile`);
```

**Impact:** After “set password” flow, redirect can break (e.g. append to current path instead of going to `/pt/profile`).

---

### 3.2 Auth context `isAuthenticated` not derived from state

**File:** `src/contexts/auth-context.tsx`

```ts
const value: AuthContextType = {
  // ...
  isAuthenticated: apiService.isAuthenticated(),
};
```

`isAuthenticated` is computed from `apiService.getToken()` at render time. Prefer deriving it from React state so it’s consistent with `user` and doesn’t depend on a side effect:

```ts
isAuthenticated: !!user,
```

If you need to reflect token presence before profile load, you could expose both `!!user` and a “has token” flag; currently `loading` and `user` already drive the UX, so `!!user` is likely enough.

---

### 3.3 Protected admin route loses language

**File:** `src/pages/admin/protected-admin-route.tsx`

- Unauthenticated: `<Navigate to="/signin" />` — no `:lang`; user lands on a path that may not match your `:lang` routes.
- Not admin: `<Navigate to="/" />` — same; better to redirect to `/${defaultLang}/...` (e.g. tournaments).

**Recommendation:** Use `useParams()` for `lang` and `getDefaultAppLang()` so all redirects go to `/${lang}/signin` or `/${lang}/tournaments`, consistent with `protected-route.tsx` and Content routes.

---

### 3.4 Sign-in: duplicate `autoFocus`

**File:** `src/pages/sign-in/sign-in.tsx`

Both the email and password `TextField` have `autoFocus`. Only one element should have it (typically email).

---

## 4. Security & Data Handling

### Strengths
- No `dangerouslySetInnerHTML` / `eval` found.
- Token in `localStorage` only; API sends it via `Authorization` header.
- Env validation for API and Google auth URLs; PWA Workbox avoids caching API responses.

### Considerations
- **Token storage:** `localStorage` is XSS-sensitive. If the app grows or handles very sensitive data, consider httpOnly cookies for tokens and CSRF measures.
- **Session storage:** `returnUrl` and `pendingApplication` in `sessionStorage` are used for redirects; ensure no sensitive data is stored there (current use looks fine).
- **Register flow:** After register, the app calls `apiService.login(userData.email, userData.password)` — the password is in memory only for that request; ensure it’s not logged or retained elsewhere.

---

## 5. Internationalization (i18n)

### Issues
- **Ukrainian comments in code:** e.g. `auth-context.tsx`: “Після успішної реєстрації автоматично логінимо користувача”, “Запобігаємо повторній обробці”. Prefer English (or move to i18n if ever shown in UI).
- **Hardcoded UI strings:**
  - Sign-in validation: “Please enter a valid email address.”, “Password must be at least 6 characters long.” — should use `t('...')` and keys in `locales/*/common.json`.
  - Alert dialog: “Yes” / “No” in `src/components/dialogs/alert-dialog.tsx` — should be translated.
- **Protected route fallback:** `const lang = pathSegments[0] || 'pt'` — consider using `getDefaultAppLang()` for consistency with the rest of the app.

### Strengths
- i18n setup (i18next, namespaces, language detector) is clear.
- Most UI already uses `t()` with fallbacks; locale files are structured.

---

## 6. Build & Config

### Vite config

**File:** `vite.config.ts`

- Line 1: `// @ts-nocheck` disables type-checking for the whole file.
- Line 8: `// @ts-ignore` for `loadEnv`.

**Recommendation:** Prefer fixing typings (e.g. correct type for `loadEnv` and `defineConfig` env) and remove `@ts-nocheck` / `@ts-ignore` so the config stays type-safe.

### Lint / format
- ESLint + Prettier + import order (perfectionist) and filename-case (unicorn) are configured; good for consistency.
- `lint-staged` runs on staged files; consider also running `tsc --noEmit` in CI and pre-push to catch type errors.

---

## 7. Error Handling & Resilience

### Missing Error Boundary
- There is no React Error Boundary. A single uncaught error in the tree can blank the whole app.
- **Recommendation:** Add an Error Boundary at the top level (e.g. in `App.tsx`) that shows a friendly message and optionally a “Reload” button; in dev you can still show the error stack.

### Inconsistent user feedback
- Many `catch` blocks only call `console.error(...)` and don’t set a local error state or show a toast/snackbar.
- **Recommendation:** Centralize or standardize: e.g. a small `useErrorToast()` or context that shows a Snackbar on API/page errors, and use it in key flows (login, profile save, tournament CRUD, etc.).

### Backend health check
- `profile.tsx` uses `fetch(env.API_BASE_URL)` and logs on failure; good for debugging. Consider a small “Backend unavailable” banner or redirect to a status page if you want to expose this to users.

---

## 8. Accessibility & UX

### Strengths
- Dialogs use `aria-labelledby` and `aria-describedby`.
- Semantic structure (header, main, footer) and MUI components generally improve a11y.

### Gaps
- **Loading states:** Some pages don’t show a skeleton or spinner while data is loading (e.g. tournament list, profile); adding them would improve perceived performance and clarity.
- **Focus management:** After login/register redirect, focus is not explicitly set; consider moving focus to main content or a “success” message for keyboard/screen reader users.
- **Alert dialog:** “Yes”/“No” order and which one is default (autoFocus) should match user expectations (e.g. destructive actions: “Cancel” as default and “Confirm” as primary).

---

## 9. Code Quality & Maintainability

### Debug and console
- **UserMenu:** `console.log('UserMenu - user updated:', ...)` — remove or guard with `import.meta.env.DEV`.
- **main.tsx:** Commented `// console.log('App ready to work offline')` — fine; consider removing if not needed.
- Many `console.error` in catch blocks — acceptable for now; prefer routing to a logging/error-reporting layer in production and still showing user-facing messages.

### Duplication
- **Protected route loading UI:** `protected-route.tsx` and `protected-admin-route.tsx` both render the same MUI `Box` + `CircularProgress`. Extract a small `RouteLoadingSpinner` (or similar) component.
- **Competition pages:** `getLeader(users: any[])` duplicated in `patrol-list.tsx` and `competitions-list.tsx` — move to a shared util or type-safe helper.

### ESLint disable
- **auth-context.tsx:** `// eslint-disable-next-line react-hooks/exhaustive-deps` on `handleGoogleAuth`’s `useCallback`. Prefer adding the real dependencies (e.g. `handlePostAuthRedirect`) or documenting why the dependency array is intentionally minimal.

---

## 10. Testing

- **setupTests.js** exists but there are **no test files** (`*.test.ts`, `*.test.tsx`, etc.).
- **Recommendation:** Start with:
  - Unit tests for pure utils (`normalizeAppLang`, `pickLocalizedDescription`, date helpers).
  - Integration/component tests for critical flows: sign-in (validation, submit), protected route redirect, and one tournament or profile flow.
  - Optionally mock `apiService` and test auth context behavior (login/logout, redirect).

---

## 11. Dependency & Scripts

- **package.json:** React 18, Vite 7, TypeScript 5.7, MUI 7, react-router-dom 7 — all current.
- **Scripts:** `dev`, `build`, `start`, `lint`, `format`, `prepare` (husky). Consider adding:
  - `"typecheck": "tsc --noEmit"` and running it in CI and optionally in `lint-staged` or pre-push.

---

## 12. PWA & main.tsx

- PWA registration and “new version” prompt are clear.
- Legacy service worker cleanup (unregister `/service-worker.js`) is documented with “todo: remove after first release” — remember to remove once the old SW is no longer in use.
- Root element check and `createRoot` usage are correct.

---

## Summary of Priority Fixes

| Priority | Item | Action |
|----------|------|--------|
| **P0** | Wrong redirect after set password | Use `navigate(\`/${currentLang}/profile\`)` in auth-context |
| **P0** | Admin route redirects | Use lang in Navigate (`/signin` → `/${lang}/signin`, `/` → `/${lang}/tournaments`) |
| **P1** | Remove debug log | Remove or guard `console.log` in UserMenu |
| **P1** | Sign-in duplicate autoFocus | Keep autoFocus only on email field |
| **P1** | Alert dialog i18n | Translate “Yes”/“No” (and optionally question/hint) |
| **P1** | Sign-in validation strings | Move to i18n keys |
| **P2** | Replace `any` in API and pages | Introduce Tournament, Patrol, Application, User extensions |
| **P2** | Vite config | Remove @ts-nocheck / @ts-ignore and fix types |
| **P2** | Error Boundary | Add top-level Error Boundary |
| **P2** | Auth context | Prefer `isAuthenticated: !!user` (or document current choice) |
| **P3** | Path aliases, route config | Optional refactors for maintainability |
| **P3** | Tests | Add typecheck script and first unit/integration tests |

Overall the codebase is in good shape for feature set and structure; addressing the bugs and type safety first will make further development and refactoring safer and easier.
