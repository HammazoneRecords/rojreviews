
"use client";

import type { Feedback, ScoreFeedbackOutput } from '@/lib/types';
import { FeedbackItem } from './feedback-item';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface FeedbackListProps {
  feedback: Feedback[];
  onFawud: (feedbackId: string) => void;
  restaurantId: string;
  onQualityScoreUpdate: (feedbackId: string, newScore: ScoreFeedbackOutput) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const PAGE_SIZE = 5;

export function FeedbackList({ feedback, onFawud, restaurantId, onQualityScoreUpdate, onLoadMore, hasMore, isLoadingMore }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No feedback available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <FeedbackItem
          key={item.id}
          feedback={item}
          restaurantId={restaurantId}
          onFawud={() => onFawud(item.id)}
          onQualityScoreUpdate={onQualityScoreUpdate}
        />
      ))}
      {hasMore && feedback.length >= PAGE_SIZE && (
        <div className="flex justify-center pt-4">
          <Button onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Loader2 className="animate-spin" /> : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
