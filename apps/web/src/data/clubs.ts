import type { ClubDto } from '../services/types';

/**
 * FE-only seed data for clubs, used until the backend is ready.
 * Extend freely during development.
 */
const clubsData: ClubDto[] = [
  {
    id: '1',
    name: 'Kyiv Archery Club',
    description: 'Leading archery club in Kyiv, Ukraine',
    location: 'Kyiv, Ukraine',
    clubLogo: '/img/clubs/kyiv-ac.png',
  },
  {
    id: '2',
    name: 'Lviv Bowmen',
    description: 'Traditional archery club based in Lviv',
    location: 'Lviv, Ukraine',
    clubLogo: '/img/clubs/lviv-bowmen.png',
  },
  {
    id: '3',
    name: 'Odesa Archers',
    description: 'Coastal archery club in Odesa',
    location: 'Odesa, Ukraine',
    clubLogo: '/img/clubs/odesa-archers.png',
  },
];

export default clubsData;
