import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Division } from '../division/division.entity';
import { Rule } from '../rule/rule.entity';
import { DIVISIONS_BY_RULE } from './division-catalog';

export class DivisionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('📋 Seeding divisions from rulebooks...\n');

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const [ruleCode, divisions] of Object.entries(DIVISIONS_BY_RULE)) {
      const rule = await em.findOne(Rule, { ruleCode });
      if (!rule) {
        console.log(`   ⚠️  Rule ${ruleCode} not found, skipping`);
        continue;
      }

      let created = 0;
      let updated = 0;
      for (const div of divisions) {
        const existing = await em.findOne(Division, {
          name: div.name,
          rule,
        });
        if (!existing) {
          em.persist(
            em.create(Division, {
              name: div.name,
              description: div.description,
              rule,
            }),
          );
          created++;
          continue;
        }
        if (existing.description !== div.description) {
          existing.description = div.description;
          updated++;
        }
      }
      totalCreated += created;
      totalUpdated += updated;
      console.log(`   ${ruleCode}: ${created} new, ${updated} descriptions updated`);
    }

    await em.flush();
    console.log(`\n✅ ${totalCreated} divisions created, ${totalUpdated} descriptions updated`);
  }
}
