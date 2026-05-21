
"use client";

import type { Restaurant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';

interface SentimentIndexCardsProps {
  topRated: Restaurant | null;
  needsImprovement: Restaurant | null;
  isLoading: boolean;
}

export function SentimentIndexCards({ topRated, needsImprovement, isLoading }: SentimentIndexCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-2 border-green-500 shadow-md transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-xs font-medium font-headline">Top Rated</CardTitle>
          <ThumbsUp className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl font-bold font-headline text-primary">{topRated?.name || 'Analyzing...'}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
            Avg. Sentiment: <span className="font-bold">{topRated?.averageSentiment?.toFixed(2) || 'N/A'}</span>
          </p>
        </CardContent>
      </Card>
      <Card className="border-2 border-red-500 shadow-md transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-xs font-medium font-headline">Needs Improvement</CardTitle>
          <ThumbsDown className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xl font-bold font-headline text-primary">{needsImprovement?.name || 'Analyzing...'}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg. Sentiment: <span className="font-bold">{needsImprovement?.averageSentiment?.toFixed(2) || 'N/A'}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
