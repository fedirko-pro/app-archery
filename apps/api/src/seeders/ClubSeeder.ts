import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Club, ClubVisibility } from '../club/club.entity';

export class ClubSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding clubs...');

    const clubs = [
      {
        name: 'Kyiv Archery Club',
        shortCode: 'KAC',
        description:
          'Premier archery club in Kyiv, offering training for all levels from beginners to competitive archers. We specialize in Olympic recurve and compound bow techniques.',
        country: 'UA',
        city: 'Kyiv',
      },
      {
        name: 'Lviv Traditional Archers',
        shortCode: 'LTA',
        description:
          'Dedicated to preserving traditional archery methods and techniques. Join us for a unique experience in historical archery practices.',
        country: 'UA',
        city: 'Lviv',
      },
      {
        name: 'Odessa Bow Hunters',
        shortCode: 'OBH',
        description:
          'Coastal archery club focusing on field archery and 3D target shooting. Perfect for outdoor enthusiasts and hunters.',
        country: 'UA',
        city: 'Odessa',
      },
      {
        name: 'Dnipro Archery Academy',
        shortCode: 'DAA',
        description:
          'Professional training academy with certified coaches. We prepare athletes for national and international competitions.',
        country: 'UA',
        city: 'Dnipro',
      },
      {
        name: 'Kharkiv Youth Archers',
        shortCode: 'KYA',
        description:
          'Youth-focused archery program promoting physical fitness, discipline, and sportsmanship among young athletes aged 8-18.',
        country: 'UA',
        city: 'Kharkiv',
      },
      {
        name: 'Lisbon Archery Center',
        shortCode: 'LAC',
        description:
          'Modern archery facility in Lisbon with indoor and outdoor ranges. Home to national team training sessions.',
        country: 'PT',
        city: 'Lisbon',
      },
      {
        name: 'Porto Field Archers',
        shortCode: 'PFA',
        description:
          'Specialized in field archery and nature courses. Experience archery in the beautiful Portuguese countryside.',
        country: 'PT',
        city: 'Porto',
      },
      {
        name: 'Coimbra University Archery',
        shortCode: 'CUA',
        description:
          'University archery club open to students and community. Combining academic excellence with sporting achievement.',
        country: 'PT',
        city: 'Coimbra',
      },
      {
        name: 'Algarve Coastal Archers',
        shortCode: 'ACA',
        description:
          'Seaside archery club with stunning ocean views. Specializing in outdoor competitions and beach archery events.',
        country: 'PT',
        city: 'Faro',
      },
      {
        name: 'Braga Historic Bowmen',
        shortCode: 'BHB',
        description:
          'Traditional and medieval archery enthusiasts. Preserving the heritage of Portuguese archery traditions.',
        country: 'PT',
        city: 'Braga',
      },
    ];

    const toPersist: Club[] = [];
    for (const clubData of clubs) {
      const existing = await em.findOne(Club, {
        shortCode: clubData.shortCode,
      });
      if (!existing) {
        const club = em.create(Club, { ...clubData, visibility: ClubVisibility.PUBLIC });
        toPersist.push(club);
      }
    }
    await em.persistAndFlush(toPersist);

    console.log(
      `✅ ${toPersist.length} clubs created (${clubs.length - toPersist.length} already existed)`,
    );
  }
}
