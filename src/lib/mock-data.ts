
import type { Restaurant } from './types';

export const mockRestaurants: Omit<Restaurant, 'averageSentiment'>[] = [
  {
    id: '1',
    name: 'KFC',
    logo: 'https://firebasestorage.googleapis.com/v0/b/ralfeedback.firebasestorage.app/o/img%2Fkfc-logo.png?alt=media&token=e58a2f44-46b0-4e3e-a131-e1293a5518b5',
    data_ai_hint: 'fried chicken',
    feedback: [],
  },
  {
    id: '2',
    name: 'Pizza Hut',
    logo: 'https://firebasestorage.googleapis.com/v0/b/ralfeedback.firebasestorage.app/o/img%2Fpizza-hut-logo.png?alt=media&token=c1f0b094-918d-4a37-b95a-c4125af2d7e0',
    data_ai_hint: 'pizza place',
    feedback: [],
  },
  {
    id: '3',
    name: 'Wendy\'s',
    logo: 'https://firebasestorage.googleapis.com/v0/b/ralfeedback.firebasestorage.app/o/img%2Fwendys-logo.png?alt=media&token=38c53503-4c4c-4740-8456-4c31e9c222da',
    data_ai_hint: 'burgers fries',
    feedback: [],
  },
];
