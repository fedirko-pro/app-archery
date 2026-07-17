import type { ClubDto } from '../services/types';

/**
 * FE-only seed data for clubs, used until the backend is ready.
 * Keep in sync with apps/api/src/seeders/ClubSeeder.ts for offline/demo parity.
 */
const clubsData: ClubDto[] = [
  {
    id: '1',
    name: 'Kyiv Archery Club',
    shortCode: 'KAC',
    description:
      'Premier archery club in Kyiv, offering training for all levels from beginners to competitive archers. We specialize in Olympic recurve and compound bow techniques.',
    country: 'UA',
    city: 'Kyiv',
    location: 'Kyiv, Ukraine',
    clubLogo: '/img/clubs/kyiv-ac.png',
    visibility: 'public',
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
    id: '2',
    name: 'Lviv Traditional Archers',
    shortCode: 'LTA',
    description:
      'Dedicated to preserving traditional archery methods and techniques. Join us for a unique experience in historical archery practices.',
    country: 'UA',
    city: 'Lviv',
    location: 'Lviv, Ukraine',
    clubLogo: '/img/clubs/lviv-bowmen.png',
    visibility: 'public',
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
    id: '3',
    name: 'Odesa Archers',
    shortCode: 'OBH',
    description:
      'Coastal archery club focusing on field archery and 3D target shooting. Perfect for outdoor enthusiasts and hunters.',
    country: 'UA',
    city: 'Odessa',
    location: 'Odesa, Ukraine',
    clubLogo: '/img/clubs/odesa-archers.png',
    visibility: 'public',
    contactPerson: 'Maksym Bondarenko',
    contactEmail: 'contact@odessa-bow.demo',
    contactPhone: '+380 48 700 2211',
    address: '8 Frantsuzky Blvd, Odesa, 65000',
    otherInfo: '3D course open weekends. Guest day every first Sunday of the month.',
    links: [{ label: 'Website', url: 'https://example.com/odessa-bow-hunters' }],
  },
];

export default clubsData;
