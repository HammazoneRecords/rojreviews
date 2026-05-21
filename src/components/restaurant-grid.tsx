
"use client";

import type { Restaurant } from '@/lib/types';
import { RestaurantCard } from './restaurant-card';
import { Card } from './ui/card';

interface RestaurantGridProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function RestaurantGrid({ restaurants, onSelectRestaurant }: RestaurantGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
      {restaurants.map((restaurant) => (
        <Card key={restaurant.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <RestaurantCard
              restaurant={restaurant}
              onSelect={() => onSelectRestaurant(restaurant)}
            />
        </Card>
      ))}
    </div>
  );
}
