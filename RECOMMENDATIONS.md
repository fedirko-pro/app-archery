## UArchery PWA and API Audit – Recommendations

### Must fix (high impact, correctness/stability)

- **Consolidate service worker implementation**: You currently use `vite-plugin-pwa` and also register a custom SW (`public/service-worker.js`) in `src/main.tsx`. Keep a single approach to avoid conflicts.
  - Recommended: keep `vite-plugin-pwa` with `registerType: 'autoUpdate'`, remove `public/service-worker.js` and the manual registration in `src/main.tsx`.
  - Alternative: disable `vite-plugin-pwa` and keep a single custom `service-worker.js`.

- **Remove duplicate fetch handlers in custom SW**: If you keep a custom SW, merge the two `fetch` listeners into one. Having two `fetch` listeners with `event.respondWith` will throw and break offline handling. Scope runtime caching properly (see below).

- **Fix import path casing (Linux/CI breakage)**:
  - `src/main.tsx` imports `./app` but the file is `App.tsx`. Use `./App`.
  - `src/App.tsx` imports lowercased component paths while folders are capitalized (e.g., `./components/Header/Header`). Align all imports with actual casing.

- **Handle 204/empty responses in API client**: `src/services/api.ts` calls `response.json()` unconditionally. For 204 No Content or empty bodies, parse conditionally (e.g., branch on `response.status === 204` or missing `content-type/content-length`). Return `undefined` for void endpoints.

- **Avoid caching private API responses in SW**: Do not cache authenticated or mutating requests in the SW. Use:
  - Static assets: cache-first.
  - Safe GET APIs: network-first or stale-while-revalidate with cache names/expirations.
  - Auth/mutations: network-only. Never cache tokens or user-specific data.

- **Unify environment validation**: You validate both in `src/env.validation.ts` and `src/config/env.ts`. Choose one source of truth.
  - Recommended: centralize in `src/config/env.ts`, throw in PROD when required vars are missing/invalid, and avoid PROD defaults that mask misconfigurations.
  - Remove or disable `src/env.validation.ts` to prevent double throws.

- **Dependency hygiene**: Move build-time tooling to `devDependencies` to avoid shipping dev libs:
  - Move: `vite`, `@vitejs/plugin-react`, `typescript`, `vite-plugin-pwa`, `workbox-*`, and `web-vitals` (unless used at runtime) to `devDependencies`.
  - Keep only runtime libraries in `dependencies`.

- **ESLint config duplication**: Remove CRA-style `eslintConfig` from `package.json` since `eslint.config.js` is used. This prevents conflicts.

- **Husky setup**: Change `prepare` script to `"husky install"`, and add actual hooks (e.g., `pre-commit` running lint and format).

### Should improve (security, performance, UX, DX)

- **Token handling and auth security**:
  - Prefer httpOnly secure cookies for access/refresh tokens over `localStorage`.
  - Implement refresh token rotation and centralized 401 handling with automatic refresh + replay.
  - Add CSRF protection if you keep cookies.

- **Adopt vite-plugin-pwa fully**:
  - Use `virtual:pwa-register` to surface update-available prompts and handle reloads.
  - Configure `workbox.runtimeCaching` for HTML, static assets, images, and safe GET APIs.
  - Use `navigateFallback` for SPA deep links, and serve `offline.html` only when truly offline and navigating.
  - Consider Background Sync for queued POSTs (e.g., applications) if offline edits are important.

- **API error handling and offline awareness**:
  - Map network failures to friendly offline messages (`navigator.onLine` as a hint).
  - Consider exponential backoff/retry for idempotent GETs.
  - Preserve and surface server error payloads consistently.

- **Type safety**:
  - Replace `any` in API methods (tournaments, patrols, applications) with shared DTO types.
  - Centralize API response/request types to catch regressions at compile time.

- **Route-level code splitting**:
  - Use `React.lazy`/`Suspense` or `react-router` lazy routes to split large pages (admin, tournament modules), reducing initial bundle size.

- **PWA manifest polish**:
  - Add `scope`, maskable icons, and `shortcuts`.
  - Ensure `theme_color` matches UI theme (light/dark variants if needed).
  - Include additional screenshots (dark mode where applicable).

- **Security headers and CSP**:
  - Set CSP (`script-src 'self'` plus dev host in development), `Referrer-Policy`, and `Permissions-Policy` on your Node server/hosting.

- **Accessibility and UX**:
  - Verify color contrast in dark mode, visible focus outlines, and keyboard navigation.
  - Ensure proper ARIA roles/labels in dialogs and interactive components.
  - Add offline indicator and update-available prompt in the UI.

- **Performance**:
  - Preload critical fonts/assets, compress large images, and use responsive images.
  - Configure Workbox image caching with expiration/maximum entries.

- **Developer experience consistency**:
  - Use TS path aliases (`@/...`) consistently; enforce import order and naming conventions.
  - Standardize file/folder casing and ensure imports match exactly.

### Suggested next steps

1. Remove custom SW and manual registration; configure `vite-plugin-pwa` with proper `runtimeCaching` and `navigateFallback`.
2. Fix import casing and 204 handling in `src/services/api.ts`.
3. Unify env validation under `src/config/env.ts` (throw in PROD), remove duplicate.
4. Move build-time tools to `devDependencies`; clean `eslintConfig` from `package.json`; set `prepare` to `husky install`.
5. Plan token storage changes (cookies + refresh) and route-based code splitting.


