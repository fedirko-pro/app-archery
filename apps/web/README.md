# @sokil/web

Next.js frontend for Sokil — archery training companion with offline support, gamification, and tournament management.

See the [monorepo README](../../README.md) for setup instructions.

## Development

```bash
pnpm dev:web        # from monorepo root
# or
pnpm --filter @sokil/web dev
```

Web runs on http://localhost:3001. Reads env from `../../.env`.

## Build

```bash
pnpm --filter @sokil/web build
```

Uses Next.js standalone output for minimal Docker images.

## Testing

```bash
pnpm --filter @sokil/web test
pnpm --filter @sokil/web test:run
```

## Tech stack

- Next.js 15 (App Router)
- React 18, TypeScript
- MUI v7, Emotion
- i18next (EN, PT, IT, UK, ES)
- Vitest
