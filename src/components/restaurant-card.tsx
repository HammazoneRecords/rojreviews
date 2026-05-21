
"use client";

import type { Restaurant } from '@/lib/types';
import Image from 'next/image';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: () => void;
}

export function RestaurantCard({ restaurant, onSelect }: RestaurantCardProps) {
  const getScaleClass = () => {
    switch (restaurant.name) {
      case 'KFC':
        return 'scale-100 group-hover:scale-110';
      case 'Pizza Hut':
        return 'scale-90 group-hover:scale-100';
      case "Wendy's":
        return 'scale-90 group-hover:scale-100';
      default:
        return 'group-hover:scale-105';
    }
  };

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer group"
    >
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.logo}
            alt={`${restaurant.name} logo`}
            fill
            className={`transition-transform duration-300 p-4 object-contain ${getScaleClass()}`}
            data-ai-hint={restaurant.data_ai_hint}
          />
        </div>
    </div>
  );
}
