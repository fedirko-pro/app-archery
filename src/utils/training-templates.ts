import type { LocalTrainingSession } from './local-data-storage';

export interface TrainingTemplate {
  id: string;
  labelKey: string;
  defaults: Partial<LocalTrainingSession>;
}

export const TRAINING_TEMPLATES: TrainingTemplate[] = [
  {
    id: 'indoor-18m',
    labelKey: 'trainings.emptyState.templates.indoor18m',
    defaults: { distance: '18', shotsCount: 60, targetType: 'NFAA_Indoor' },
  },
  {
    id: 'outdoor-70m',
    labelKey: 'trainings.emptyState.templates.outdoor70m',
    defaults: { distance: '70', shotsCount: 72, targetType: 'WA_10_ring' },
  },
  {
    id: 'quick-log',
    labelKey: 'trainings.emptyState.templates.quickLog',
    defaults: {},
  },
];
