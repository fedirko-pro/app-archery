## UArchery PWA and API Audit – Recommendations

### Should improve (security, performance, UX, DX)

- **Token handling and auth security**:
  - Prefer httpOnly secure cookies for access/refresh tokens over `localStorage`.
  - Implement refresh token rotation and centralized 401 handling with automatic refresh + replay.
  - Add CSRF protection if you keep cookies.

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


