# @sokil/api

NestJS backend for Sokil — archery tournament management, user profiles, training tracking, and equipment management.

See the [monorepo README](../../README.md) for setup instructions.

## Development

```bash
pnpm dev:api        # from monorepo root
# or
pnpm --filter @sokil/api dev
```

API runs on http://localhost:3000. Reads env from `../../.env`.

## Build

```bash
pnpm --filter @sokil/api build
```

## Database

MikroORM with PostgreSQL. Migrations and seeders run automatically on container start.

```bash
pnpm --filter @sokil/api mikro-orm migration:create   # generate new migration
pnpm --filter @sokil/api mikro-orm migration:up        # apply pending
pnpm --filter @sokil/api mikro-orm migration:list      # check status
```

## Testing

```bash
pnpm --filter @sokil/api test
pnpm --filter @sokil/api test:e2e
```
