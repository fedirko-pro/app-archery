import type { CreateTrainingSessionDto } from '../services/types';
import type { LocalTrainingSession } from './local-data-storage';
import { getTrainingSessions, updateTrainingSession } from './local-data-storage';

export type TrainingSessionStatus = 'started' | 'finished';
export type TrainingMood = 'bad' | 'normal' | 'good' | 'amazing';

export const TRAINING_MOODS: TrainingMood[] = ['bad', 'normal', 'good', 'amazing'];
export const DEFAULT_ARROWS_PER_SET = 6;

export function isSessionFinished(session: LocalTrainingSession): boolean {
  return session.status !== 'started';
}

export function getStartedSession(sessions: LocalTrainingSession[]): LocalTrainingSession | null {
  return sessions.find((s) => s.status === 'started') ?? null;
}

export function finishOtherStartedSessions(exceptId?: string): void {
  for (const session of getTrainingSessions()) {
    if (session.status === 'started' && session.id !== exceptId) {
      updateTrainingSession(session.id, { status: 'finished' });
    }
  }
}

export function sessionToDto(session: LocalTrainingSession): CreateTrainingSessionDto {
  return {
    date: session.date,
    status: session.status ?? 'finished',
    shotsCount: session.shotsCount,
    arrowsPerSet: session.arrowsPerSet,
    distance: session.distance,
    targetType: session.targetType,
    equipmentSetId: session.equipmentSetId,
    scoreTotal: session.scoreTotal,
    notes: session.notes,
    mood: session.mood,
    customFields: session.customFields,
  };
}
