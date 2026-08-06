import { config } from 'dotenv';
import { existsSync } from 'fs';
import * as path from 'path';
/** Resolve monorepo root `.env` (works from repo root, apps/api, or dist). */
export function resolveRootEnvPath(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../../../.env'),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

export function loadRootEnv(): void {
  const envPath = resolveRootEnvPath();
  if (envPath) {
    config({ path: envPath });
  }
}
