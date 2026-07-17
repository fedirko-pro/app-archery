import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Club, ClubVisibility } from '../club/club.entity';
import type { ClubLink } from '../club/club-link.type';

type ClubSeedData = {
  name: string;
  shortCode: string;
  description: string;
  country: string;
  city: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  otherInfo?: string;
  links?: ClubLink[];
  visibility?: ClubVisibility;
};

export class ClubSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding clubs...');

    const clubs: ClubSeedData[] = [
      {
        name: 'Kyiv Archery Club',
        shortCode: 'KAC',
        description:
          'Premier archery club in Kyiv, offering training for all levels from beginners to competitive archers. We specialize in Olympic recurve and compound bow techniques.',
        country: 'UA',
        city: 'Kyiv',
        contactPerson: 'Olena Kovalenko',
        contactEmail: 'info@kyiv-archery.demo',
        contactPhone: '+380 44 123 4567',
        address: '12 Heroiv Sportu St, Kyiv, 02000',
        otherInfo:
          'Open Tue–Sun 10:00–20:00. Beginner courses every Saturday. Equipment rental available on site.',
        links: [
          { label: 'Website', url: 'https://example.com/kyiv-archery' },
          { label: 'Instagram', url: 'https://instagram.com/kyivarchery' },
          { label: 'Facebook', url: 'https://facebook.com/kyivarchery' },
        ],
      },
      {
        name: 'Lviv Traditional Archers',
        shortCode: 'LTA',
        description:
          'Dedicated to preserving traditional archery methods and techniques. Join us for a unique experience in historical archery practices.',
        country: 'UA',
        city: 'Lviv',
        contactPerson: 'Andriy Shevchenko',
        contactEmail: 'hello@lviv-archers.demo',
        contactPhone: '+380 32 555 0198',
        address: '45 Zelena St, Lviv, 79000',
        otherInfo: 'Weekly traditional bow workshops. Members get access to the historical range.',
        links: [
          { label: 'Website', url: 'https://example.com/lviv-archers' },
          { label: 'Facebook', url: 'https://facebook.com/lvivtraditionalarchers' },
        ],
      },
      {
        name: 'Odessa Bow Hunters',
        shortCode: 'OBH',
        description:
          'Coastal archery club focusing on field archery and 3D target shooting. Perfect for outdoor enthusiasts and hunters.',
        country: 'UA',
        city: 'Odessa',
        contactPerson: 'Maksym Bondarenko',
        contactEmail: 'contact@odessa-bow.demo',
        contactPhone: '+380 48 700 2211',
        address: '8 Frantsuzky Blvd, Odesa, 65000',
        otherInfo: '3D course open weekends. Guest day every first Sunday of the month.',
        links: [{ label: 'Website', url: 'https://example.com/odessa-bow-hunters' }],
      },
      {
        name: 'Dnipro Archery Academy',
        shortCode: 'DAA',
        description:
          'Professional training academy with certified coaches. We prepare athletes for national and international competitions.',
        country: 'UA',
        city: 'Dnipro',
        contactPerson: 'Iryna Melnyk',
        contactEmail: 'academy@dnipro-archery.demo',
        contactPhone: '+380 56 744 3388',
        address: '3 Sportyvna Sq, Dnipro, 49000',
        otherInfo: 'Indoor range with 18m and 70m lanes. Competition prep program year-round.',
        links: [
          { label: 'Website', url: 'https://example.com/dnipro-academy' },
          { label: 'YouTube', url: 'https://youtube.com/@dniproarchery' },
        ],
      },
      {
        name: 'Kharkiv Youth Archers',
        shortCode: 'KYA',
        description:
          'Youth-focused archery program promoting physical fitness, discipline, and sportsmanship among young athletes aged 8-18.',
        country: 'UA',
        city: 'Kharkiv',
        contactPerson: 'Natalia Hryhorenko',
        contactEmail: 'youth@kharkiv-archers.demo',
        contactPhone: '+380 57 321 0099',
        address: '21 Sumska St, Kharkiv, 61000',
        otherInfo: 'Parent intro session every Thursday at 17:00. Ages 8–18 welcome.',
        links: [{ label: 'Website', url: 'https://example.com/kharkiv-youth-archers' }],
      },
      {
        name: 'Lisbon Archery Center',
        shortCode: 'LAC',
        description:
          'Modern archery facility in Lisbon with indoor and outdoor ranges. Home to national team training sessions.',
        country: 'PT',
        city: 'Lisbon',
        contactPerson: 'João Ferreira',
        contactEmail: 'info@lisbon-archery.demo',
        contactPhone: '+351 21 345 6789',
        address: 'Av. da República 120, 1050-191 Lisboa',
        otherInfo:
          'Indoor range open daily 09:00–22:00. Outdoor range weekends. Café and pro shop on site.',
        links: [
          { label: 'Website', url: 'https://example.com/lisbon-archery' },
          { label: 'Instagram', url: 'https://instagram.com/lisbonarchery' },
          { label: 'Facebook', url: 'https://facebook.com/lisbonarcherycenter' },
        ],
      },
      {
        name: 'Porto Field Archers',
        shortCode: 'PFA',
        description:
          'Specialized in field archery and nature courses. Experience archery in the beautiful Portuguese countryside.',
        country: 'PT',
        city: 'Porto',
        contactPerson: 'Ana Costa',
        contactEmail: 'field@porto-archers.demo',
        contactPhone: '+351 22 208 4411',
        address: 'Rua do Campo Alegre 210, 4150-169 Porto',
        otherInfo: 'Forest field course with 24 targets. Guided sessions for beginners.',
        links: [
          { label: 'Website', url: 'https://example.com/porto-field-archers' },
          { label: 'Instagram', url: 'https://instagram.com/portofieldarchers' },
        ],
      },
      {
        name: 'Coimbra University Archery',
        shortCode: 'CUA',
        description:
          'University archery club open to students and community. Combining academic excellence with sporting achievement.',
        country: 'PT',
        city: 'Coimbra',
        contactPerson: 'Pedro Silva',
        contactEmail: 'archery@uc.demo',
        contactPhone: '+351 239 850 300',
        address: 'Faculdade de Ciências do Desporto, Universidade de Coimbra',
        otherInfo: 'Free trial for UC students. Community members welcome after 18:00.',
        links: [{ label: 'Website', url: 'https://example.com/coimbra-university-archery' }],
      },
      {
        name: 'Algarve Coastal Archers',
        shortCode: 'ACA',
        description:
          'Seaside archery club with stunning ocean views. Specializing in outdoor competitions and beach archery events.',
        country: 'PT',
        city: 'Faro',
        contactPerson: 'Sofia Martins',
        contactEmail: 'hello@algarve-archers.demo',
        contactPhone: '+351 289 870 122',
        address: 'Estrada da Praia, 8005-226 Faro',
        otherInfo: 'Beach archery events in summer. Equipment hire for holiday visitors.',
        links: [
          { label: 'Website', url: 'https://example.com/algarve-coastal-archers' },
          { label: 'Facebook', url: 'https://facebook.com/algarvecoastalarchers' },
        ],
      },
      {
        name: 'Braga Historic Bowmen',
        shortCode: 'BHB',
        description:
          'Traditional and medieval archery enthusiasts. Preserving the heritage of Portuguese archery traditions.',
        country: 'PT',
        city: 'Braga',
        contactPerson: 'Miguel Rocha',
        contactEmail: 'bowmen@braga-historic.demo',
        contactPhone: '+351 253 601 447',
        address: 'Rua de São Vicente 18, 4700-322 Braga',
        otherInfo: 'Medieval fair demos twice a year. Longbow and horsebow practice nights.',
        links: [{ label: 'Website', url: 'https://example.com/braga-historic-bowmen' }],
      },
    ];

    let created = 0;
    let updated = 0;

    for (const clubData of clubs) {
      const existing = await em.findOne(Club, {
        shortCode: clubData.shortCode,
      });

      if (!existing) {
        em.create(Club, {
          ...clubData,
          visibility: clubData.visibility ?? ClubVisibility.PUBLIC,
        });
        created++;
        continue;
      }

      // Keep demo clubs rich when re-seeding an existing database
      existing.name = clubData.name;
      existing.description = clubData.description;
      existing.country = clubData.country;
      existing.city = clubData.city;
      existing.contactPerson = clubData.contactPerson;
      existing.contactEmail = clubData.contactEmail;
      existing.contactPhone = clubData.contactPhone;
      existing.address = clubData.address;
      existing.otherInfo = clubData.otherInfo;
      existing.links = clubData.links;
      existing.visibility = clubData.visibility ?? ClubVisibility.PUBLIC;
      updated++;
    }

    await em.flush();

    console.log(`✅ Clubs seeded: ${created} created, ${updated} updated`);
  }
}
