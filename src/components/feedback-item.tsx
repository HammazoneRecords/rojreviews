
"use client";

import React, { useState, useEffect } from 'react';
import type { Feedback, ScoreFeedbackOutput, Restaurant } from '@/lib/types';
import { scoreFeedback } from '@/ai/flows/score-feedback';
import { updateFeedbackQualityScore } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThumbsUp, BrainCircuit, Loader2, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';

const FAWUD_COUNTS_KEY = 'ralfeedback-fawud-counts';

interface FeedbackItemProps {
  feedback: Feedback;
  restaurantId: string;
  onFawud: () => void;
  onQualityScoreUpdate: (feedbackId: string, newScore: ScoreFeedbackOutput) => void;
}

export function FeedbackItem({ feedback, restaurantId, onFawud, onQualityScoreUpdate }: FeedbackItemProps) {
  const [isScoring, setIsScoring] = useState(false);
  const [qualityScore, setQualityScore] = useState<ScoreFeedbackOutput | null>(feedback.qualityScore ?? null);
  const [fawudLimitReached, setFawudLimitReached] = useState(false);

  useEffect(() => {
    try {
      const storedCounts = localStorage.getItem(FAWUD_COUNTS_KEY);
      if (storedCounts) {
        const counts = JSON.parse(storedCounts);
        if (counts[feedback.id] >= 3) {
          setFawudLimitReached(true);
        }
      }
    } catch (error) {
      console.error("Could not parse fawud counts from localStorage", error);
    }
  }, [feedback.id]);

  const handleScoreFeedback = async () => {
    if (qualityScore) return; // Don't re-score
    setIsScoring(true);
    try {
      const result = await scoreFeedback({
        feedbackText: feedback.text,
        feedbackSource: feedback.type,
      });
      await updateFeedbackQualityScore(restaurantId, feedback.id, result);
      setQualityScore(result);
      onQualityScoreUpdate(feedback.id, result);
    } catch (error) {
      console.error('Error scoring feedback:', error);
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-green-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleFawudClick = () => {
    if (!fawudLimitReached) {
        onFawud();
        // Check for limit reached again immediately after click for faster UI feedback
        try {
          const storedCounts = localStorage.getItem(FAWUD_COUNTS_KEY);
          if (storedCounts) {
            const counts = JSON.parse(storedCounts);
            if ((counts[feedback.id] || 0) >= 3) { // Use the value from storage which is updated by parent
              setFawudLimitReached(true);
            }
          }
        } catch (error) {
          console.error("Could not parse fawud counts from localStorage", error);
        }
    }
  }

  return (
    <Card className="bg-secondary/50" key={feedback.id}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-semibold">{feedback.author}</p>
            </div>
            <p className="text-foreground">{feedback.text}</p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFawudClick}
              disabled={fawudLimitReached}
              className="flex items-center gap-2"
              title={fawudLimitReached ? "You've reached your fawud limit for this comment" : "Give a Fawud"}
            >
              <ThumbsUp className="h-4 w-4 text-primary" />
              <span>{feedback.fawuds}</span>
              <span className="hidden sm:inline">Fawuds</span>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleScoreFeedback}
                  className="flex items-center gap-2"
                >
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">AI Score</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium font-headline leading-none">AI Quality Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Powered by GenAI to assess feedback quality.
                    </p>
                  </div>
                  {isScoring ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : qualityScore ? (
                    <div className="grid gap-2 text-sm">
                        <div className='flex items-center justify-between'>
                            <p className='font-semibold'>Quality Score</p>
                            <p className={`font-bold text-lg ${getScoreColor(qualityScore.qualityScore)}`}>{qualityScore.qualityScore}/100</p>
                        </div>
                        <Separator />
                         <p className='font-semibold'>Summary</p>
                        <p className='italic text-muted-foreground'>"{qualityScore.summary}"</p>
                        <Separator />
                        <p className='font-semibold'>Source Relevance</p>
                        <p>{qualityScore.sourceRelevance}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click the "AI Score" button to analyze this feedback.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
