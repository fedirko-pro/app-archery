import { DIVISIONS_BY_RULE } from './division-catalog';

function names(ruleCode: string): string[] {
  return DIVISIONS_BY_RULE[ruleCode].map((division) => division.name);
}

function description(ruleCode: string, name: string): string {
  const division = DIVISIONS_BY_RULE[ruleCode].find((item) => item.name === name);
  if (!division) throw new Error(`${ruleCode} is missing ${name}`);
  return division.description;
}

describe('division catalog', () => {
  it('includes Senior for the rules that define it', () => {
    for (const ruleCode of ['IFAA', 'IFAA-HB', 'FABP', 'FPTA']) {
      expect(names(ruleCode)).toEqual(expect.arrayContaining(['Senior Male', 'Senior Female']));
    }
  });

  it('keeps IFAA and FABP Senior at 65 and FPTA Senior at 21', () => {
    expect(description('IFAA', 'Senior Male')).toContain('65');
    expect(description('FABP', 'Senior Female')).toContain('65');
    expect(description('FPTA', 'Senior Male')).toContain('21');
  });

  it('does not reuse the old generic age bands', () => {
    const descriptions = Object.values(DIVISIONS_BY_RULE)
      .flat()
      .map((division) => division.description);
    expect(descriptions.join('\n')).not.toMatch(/18-49|under 12|12-17|50\+ years/);
  });

  it('treats HDH 55+ as Veteran, matching the Hungarian age table', () => {
    expect(names('HDH-IAA')).not.toContain('Senior Male');
    expect(description('HDH-IAA', 'Veteran Male')).toContain('55');
  });
});
