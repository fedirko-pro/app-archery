import { describe, expect, it } from 'vitest';

import { getApplicationPrefillDefaults } from './application-prefill-utils';

const categories = [
  { id: '1', code: 'RC', name: 'Recurve' },
  { id: '2', code: 'CP', name: 'Compound' },
];

const divisions = [
  { id: 'div-1', name: 'Senior' },
  { id: 'div-2', name: 'Junior' },
];

describe('getApplicationPrefillDefaults', () => {
  it('returns empty strings for null user', () => {
    expect(getApplicationPrefillDefaults(null, categories, divisions)).toEqual({
      category: '',
      division: '',
    });
  });

  it('prefills first matching profile category in profile order', () => {
    expect(
      getApplicationPrefillDefaults(
        { categories: ['XX', 'CP', 'RC'], divisionId: 'div-1' },
        categories,
        divisions,
      ),
    ).toEqual({ category: 'CP', division: 'div-1' });
  });

  it('prefills single matching category', () => {
    expect(
      getApplicationPrefillDefaults(
        { categories: ['RC'], divisionId: undefined },
        categories,
        divisions,
      ),
    ).toEqual({ category: 'RC', division: '' });
  });

  it('leaves category empty when no profile codes match tournament rule', () => {
    expect(
      getApplicationPrefillDefaults(
        { categories: ['BB'], divisionId: 'div-1' },
        categories,
        divisions,
      ),
    ).toEqual({ category: '', division: 'div-1' });
  });

  it('leaves division empty when profile division is not in tournament rule', () => {
    expect(
      getApplicationPrefillDefaults(
        { categories: ['RC'], divisionId: 'div-unknown' },
        categories,
        divisions,
      ),
    ).toEqual({ category: 'RC', division: '' });
  });

  it('returns empty when options lists are empty', () => {
    expect(
      getApplicationPrefillDefaults({ categories: ['RC'], divisionId: 'div-1' }, [], []),
    ).toEqual({ category: '', division: '' });
  });
});
