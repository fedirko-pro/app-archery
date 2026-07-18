import type { Participant, Patrol } from './types';

/**
 * Validates if a member can be moved to a target patrol
 */
export function canDropMember(
  memberId: string,
  sourcePatrolId: string,
  targetPatrolId: string,
  patrols: Patrol[],
  participants: Map<string, Participant>,
): {
  allowed: boolean;
  reason?: string;
  reasonParams?: Record<string, string>;
  warnings?: string[];
} {
  const sourcePatrol = patrols.find((p) => p.id === sourcePatrolId);
  const targetPatrol = patrols.find((p) => p.id === targetPatrolId);
  const member = participants.get(memberId);

  if (!sourcePatrol || !targetPatrol || !member) {
    return {
      allowed: false,
      reason: 'pages.patrols.validation.invalid',
    };
  }

  // Hard constraint: source patrol must have >= 3 members after removal
  if (sourcePatrol.members.length <= 3) {
    return {
      allowed: false,
      reason: 'pages.patrols.validation.sourceTooSmall',
    };
  }

  // Collect warnings for soft constraints
  const warnings: string[] = [];

  // Check division homogeneity
  const targetDivisions = targetPatrol.members
    .map((id) => participants.get(id)?.division)
    .filter(Boolean) as string[];
  const dominantDivision = getMostCommon(targetDivisions);

  if (dominantDivision && member.division !== dominantDivision) {
    warnings.push('pages.patrols.validation.divisionMismatch');
  }

  // Check gender homogeneity
  const targetGenders = targetPatrol.members
    .map((id) => participants.get(id)?.gender)
    .filter(Boolean) as string[];
  const dominantGender = getMostCommon(targetGenders);

  if (dominantGender && member.gender !== dominantGender) {
    warnings.push('pages.patrols.validation.genderMismatch');
  }

  return {
    allowed: true,
    warnings,
    reasonParams:
      dominantDivision && member.division !== dominantDivision
        ? { member: member.division, dominant: dominantDivision }
        : undefined,
  };
}

/**
 * Gets the most common item in an array
 */
function getMostCommon(arr: string[]): string | null {
  if (arr.length === 0) return null;

  const counts: Record<string, number> = {};
  arr.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}
