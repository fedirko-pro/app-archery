import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';

async function testProfileApi() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔍 Testing profile API response...\n');

  // Get a user with club
  const user = await em.findOne(
    User,
    { email: 'admin@archery.com' },
    { populate: ['club'] },
  );

  if (!user) {
    console.log('User not found');
    await orm.close();
    return;
  }

  console.log('Raw user from DB:');
  console.log('  email:', user.email);
  console.log('  club object:', user.club);
  console.log('  club?.id:', user.club?.id);
  console.log('  club?.name:', user.club?.name);

  // Simulate what the controller does
  const userRecord = user as unknown as Record<string, unknown>;
  const clubRecord = userRecord.club as Record<string, unknown> | undefined;

  const response = {
    id: userRecord.id as string,
    email: userRecord.email as string,
    role: userRecord.role as string,
    firstName: userRecord.firstName as string,
    lastName: userRecord.lastName as string,
    clubId: (clubRecord?.id as string) || null,
  };

  console.log('\nSimulated API response:');
  console.log(JSON.stringify(response, null, 2));

  await orm.close();
}

testProfileApi().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
