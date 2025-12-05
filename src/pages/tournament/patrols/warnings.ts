import type { Participant, Patrol, Warning } from './types';

/**
 * Recalculates all warnings for all patrols
 */
export function recalculateWarnings(
  patrols: Patrol[],
  participants: Map<string, Participant>,
): Warning[] {
  const warnings: Warning[] = [];

  patrols.forEach((patrol) => {
    // Check if judges are from same club
    if (patrol.judgeIds.length === 2) {
      const judge1 = participants.get(patrol.judgeIds[0]);
      const judge2 = participants.get(patrol.judgeIds[1]);

      if (judge1 && judge2 && judge1.club === judge2.club) {
        warnings.push({
          patrolId: patrol.id,
          type: 'same-club-judges',
          message: 'Judges are from the same club',
          severity: 'warning',
        });
      }
    }

    // Check if all judges assigned
    if (patrol.judgeIds.length < 2) {
      warnings.push({
        patrolId: patrol.id,
        type: 'missing-judges',
        message: `Only ${patrol.judgeIds.length} judge(s) assigned`,
        severity: 'error',
      });
    }

    // Check if leader assigned
    if (!patrol.leaderId) {
      warnings.push({
        patrolId: patrol.id,
        type: 'missing-leader',
        message: 'No leader assigned',
        severity: 'error',
      });
    }

    // Check division homogeneity
    const divisions = patrol.members
      .map((id) => participants.get(id)?.division)
      .filter(Boolean) as string[];

    if (new Set(divisions).size > 1) {
      warnings.push({
        patrolId: patrol.id,
        type: 'mixed-divisions',
        message: 'Mixed divisions in patrol',
        severity: 'info',
      });
    }

    // Check sex homogeneity
    const sexes = patrol.members
      .map((id) => participants.get(id)?.sex)
      .filter(Boolean) as string[];

    if (new Set(sexes).size > 1) {
      warnings.push({
        patrolId: patrol.id,
        type: 'mixed-genders',
        message: 'Mixed genders in patrol',
        severity: 'info',
      });
    }
  });

  // Check size imbalance across all patrols
  const sizes = patrols.map((p) => p.members.length);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  if (maxSize - minSize > 2) {
    patrols.forEach((patrol) => {
      if (
        patrol.members.length === minSize ||
        patrol.members.length === maxSize
      ) {
        warnings.push({
          patrolId: patrol.id,
          type: 'size-imbalance',
          message: `Patrol size (${patrol.members.length}) differs significantly from average`,
          severity: 'info',
        });
      }
    });
  }

  return warnings;
}
