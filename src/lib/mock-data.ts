
import type { Restaurant } from './types';

export const mockRestaurants: Omit<Restaurant, 'averageSentiment'>[] = [
  {
    id: '1',
    name: 'KFC',
    logo: 'https://1000logos.net/wp-content/uploads/2017/03/Kfc_logo.png',
    data_ai_hint: 'fried chicken',
    feedback: [],
  },
  {
    id: '2',
    name: 'Pizza Hut',
    logo: 'https://1000logos.net/wp-content/uploads/2017/05/Pizza-Hut-Logo.png',
    data_ai_hint: 'pizza place',
    feedback: [],
  },
  {
    id: '3',
    name: 'Wendy\'s',
    logo: 'https://1000logos.net/wp-content/uploads/2017/08/Wendys-Logo.png',
    data_ai_hint: 'burgers fries',
    feedback: [],
  },
];
