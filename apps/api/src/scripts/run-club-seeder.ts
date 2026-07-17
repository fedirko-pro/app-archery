import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { ClubSeeder } from '../seeders/ClubSeeder';

async function runSeeder() {
  const orm = await MikroORM.init(config);

  try {
    const seeder = orm.getSeeder();
    await seeder.seed(ClubSeeder);
    console.log('\n✨ Club seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await orm.close();
  }
}

void runSeeder();
