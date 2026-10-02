import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const seederPath = join(__dirname, 'BowCategorySeeder.ts');
const seederSource = readFileSync(seederPath, 'utf8');

describe('FABP Campeonato dos Castelos citations (QC2026)', () => {
  it('cites Art. 27 Castelos classes and restores MBR without MB-SB', () => {
    expect(seederSource).not.toMatch(/Rota dos Castelos/);
    expect(seederSource).not.toMatch(/QC2025/);
    expect(seederSource).not.toMatch(/code: 'MB-SB'/);
    expect(seederSource).toContain("code: 'MBR'");
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos A (HLB)');
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos B.1 (HBR)');
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos B.2 (MBR)');
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos C (MB LB)');
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos D (MB TR)');
    expect(seederSource).toContain('FABP QC2026, Art. 27 — Campeonato dos Castelos E (MC)');
  });
});
