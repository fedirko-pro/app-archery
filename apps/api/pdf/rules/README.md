# Rule PDFs (legacy folder)

PDFs are served from the repo-root `uploads/rules/` directory, not this folder.

- **In DB:** `Rule.downloadLink` — e.g. `/uploads/rules/FABP_QC2025.pdf`
- **On disk:** `uploads/rules/<filename>.pdf` at the monorepo root
- **URL:** `GET /uploads/rules/<filename>` (API static assets)

This `apps/api/pdf/rules/` directory is leftover from an older layout. Prefer placing new rule PDFs under `uploads/rules/` and pointing `downloadLink` there.

After changing seeder paths, re-run:

```bash
pnpm --filter @sokil/api mikro-orm seeder:run --class=RuleSeeder
```
