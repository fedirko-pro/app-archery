import type { User } from '../contexts/types';
import type { BowCategory, DivisionDto } from '../services/types';

export interface ApplicationPrefillDefaults {
  category: string;
  division: string;
}

export function getApplicationPrefillDefaults(
  user: Pick<User, 'categories' | 'divisionId'> | null,
  availableCategories: BowCategory[],
  availableDivisions: DivisionDto[],
): ApplicationPrefillDefaults {
  let category = '';
  let division = '';

  if (user?.categories?.length && availableCategories.length > 0) {
    const availableCodes = new Set(availableCategories.filter((c) => c.code).map((c) => c.code));
    const match = user.categories.find((code) => availableCodes.has(code));
    if (match) {
      category = match;
    }
  }

  if (user?.divisionId && availableDivisions.length > 0) {
    const exists = availableDivisions.some((d) => d.id === user.divisionId);
    if (exists) {
      division = user.divisionId;
    }
  }

  return { category, division };
}
