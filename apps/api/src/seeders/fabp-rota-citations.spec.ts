import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const seederPath = join(__dirname, 'BowCategorySeeder.ts');
const seederSource = readFileSync(seederPath, 'utf8');

describe('FABP Rota dos Castelos citations', () => {
  it('cites Art. 27 for every Rota class (not Art. 26, which is crossbow cup)', () => {
    expect(seederSource).not.toMatch(/FABP QC2025, Art\. 26 — Rota dos Castelos/);
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 1 (HLB)');
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 2 (HBR)');
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 3 (MB LB)');
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 4 (MB TR)');
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 5 (MB SB)');
    expect(seederSource).toContain('FABP QC2025, Art. 27 — Rota dos Castelos 6 (MC)');
  });
});
