import { getTrainingSessions, updateTrainingSession } from './local-data-storage';

const VERSION_KEY = 'sokil_data_version';
export const CURRENT_DATA_VERSION = 2;

export function runLocalDataMigrations(): void {
  const version = Number(localStorage.getItem(VERSION_KEY) ?? 1);
  if (version >= CURRENT_DATA_VERSION) return;

  if (version < 2) {
    migrateV1ToV2();
  }

  localStorage.setItem(VERSION_KEY, String(CURRENT_DATA_VERSION));
}

function migrateV1ToV2(): void {
  const sessions = getTrainingSessions();
  for (const session of sessions) {
    if (session.status === undefined) {
      updateTrainingSession(session.id, {
        status: 'finished',
        isSynced: session.isSynced,
      });
    }
  }
}
