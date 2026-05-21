
import type { Restaurant } from './types';

export const mockRestaurants: Omit<Restaurant, 'averageSentiment'>[] = [
  {
    id: '1',
    name: 'KFC',
    logo: '/logos/kfc.png',
    data_ai_hint: 'fried chicken',
    feedback: [],
  },
  {
    id: '2',
    name: 'Pizza Hut',
    logo: '/logos/pizza-hut.png',
    data_ai_hint: 'pizza place',
    feedback: [],
  },
  {
    id: '3',
    name: 'Wendy\'s',
    logo: '/logos/wendys.png',
    data_ai_hint: 'burgers fries',
    feedback: [],
  },
];
