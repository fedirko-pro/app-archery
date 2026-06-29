/**
 * Participant in a patrol
 */
export interface Participant {
  id: string;
  name: string;
  club: string;
  division: string; // 'Cub Male', 'Junior Female', 'Adult Male', etc.
  bowCategory: string; // 'RC', 'CP', 'LB', etc.
  gender: string; // 'M', 'F', 'Other'
}

/**
 * Patrol group
 */
export interface Patrol {
  id: string;
  targetNumber: number; // 1-18+
  members: string[]; // participant IDs
  leaderId: string | null;
  judgeIds: string[]; // max 2
}

/**
 * Warning/validation message for a patrol
 */
export interface Warning {
  patrolId: string;
  type:
    | 'same-club-judges'
    | 'mixed-divisions'
    | 'mixed-genders'
    | 'size-imbalance'
    | 'missing-leader'
    | 'missing-judges';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Statistics for patrol generation quality
 */
export interface PatrolStats {
  totalParticipants: number;
  averagePatrolSize: number;
  clubDiversityScore: number; // percentage
  homogeneityScores: {
    category: number; // % of patrols where all have the same bow category
    division: number; // percentage
    gender: number; // percentage
  };
}
