
"use client";

import React, { useState } from 'react';
import type { Restaurant, Summarization, Feedback, ScoreFeedbackOutput } from '@/lib/types';
import { summarizeFeedback } from '@/ai/flows/summarize-feedback';
import { DocumentSnapshot } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FeedbackList } from './feedback-list';
import { SummarizationDialog } from './summarization-dialog';
import { AddFeedbackDialog } from './add-feedback-dialog';
import { MessageSquare, Users, Wand2, Loader2, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type FeedbackCategoryState = {
    items: Feedback[];
    lastVisible: DocumentSnapshot | null;
    hasMore: boolean;
};

type FeedbackState = {
  customer: FeedbackCategoryState;
  employee: FeedbackCategoryState;
};

interface FeedbackSectionProps {
  restaurant: Restaurant;
  onFawud: (feedbackId: string) => void;
  onAddFeedback: (feedback: Omit<Feedback, 'id' | 'fawuds' | 'author' | 'improvementAreas' | 'finalComment' | 'qualityScore'>) => Promise<Feedback>;
  onUpdateFeedback: (feedbackId: string, updateData: { improvementAreas: string[], finalComment?: string }) => void;
  onQualityScoreUpdate: (feedbackId: string, newScore: ScoreFeedbackOutput) => void;
  onLoadMore: (restaurantId: string, feedbackType: 'customer' | 'employee') => void;
  feedbackState: FeedbackState;
}

export function FeedbackSection({ restaurant, onFawud, onAddFeedback, onUpdateFeedback, onQualityScoreUpdate, onLoadMore, feedbackState }: FeedbackSectionProps) {
  const [summarization, setSummarization] = useState<Summarization>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loadingState, setLoadingState] = useState({ customer: false, employee: false });
  
  const customerFeedbackItems = feedbackState?.customer?.items ?? [];
  const employeeFeedbackItems = feedbackState?.employee?.items ?? [];
  const allFeedback = [...customerFeedbackItems, ...employeeFeedbackItems];
  
  const handleLoadMore = async (type: 'customer' | 'employee') => {
    setLoadingState(prev => ({...prev, [type]: true}));
    await onLoadMore(restaurant.id, type);
    setLoadingState(prev => ({...prev, [type]: false}));
  }

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const customerText = customerFeedbackItems.map((f) => f.text).join('\n\n');
      const employeeText = employeeFeedbackItems.map((f) => f.text).join('\n\n');
      const result = await summarizeFeedback({
        customerFeedback: customerText,
        employeeFeedback: employeeText,
      });
      setSummarization(result);
      setIsSummaryDialogOpen(true);
    } catch (error)
      {
      console.error('Error summarizing feedback:', error);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-2xl font-headline">Feedback Details</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Feedback
            </Button>
            <Button onClick={handleSummarize} disabled={isSummarizing || allFeedback.length === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              AI Summarize
            </Button>
          </div>
        </div>
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">
              <MessageSquare className="mr-2 h-4 w-4" />
              Customer Reviews ({customerFeedbackItems.length})
            </TabsTrigger>
            <TabsTrigger value="employee">
              <Users className="mr-2 h-4 w-4" />
              Employee Feedback ({employeeFeedbackItems.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customer" className="mt-6">
            <FeedbackList
              feedback={customerFeedbackItems}
              onFawud={onFawud}
              restaurantId={restaurant.id}
              onQualityScoreUpdate={onQualityScoreUpdate}
              onLoadMore={() => handleLoadMore('customer')}
              hasMore={feedbackState?.customer?.hasMore ?? false}
              isLoadingMore={loadingState.customer}
            />
          </TabsContent>
          <TabsContent value="employee" className="mt-6">
            <FeedbackList
              feedback={employeeFeedbackItems}
              onFawud={onFawud}
              restaurantId={restaurant.id}
              onQualityScoreUpdate={onQualityScoreUpdate}
              onLoadMore={() => handleLoadMore('employee')}
              hasMore={feedbackState?.employee?.hasMore ?? false}
              isLoadingMore={loadingState.employee}
            />
          </TabsContent>
        </Tabs>
        <SummarizationDialog
          isOpen={isSummaryDialogOpen}
          setIsOpen={setIsSummaryDialogOpen}
          summarization={summarization}
          restaurantName={restaurant.name}
        />
        <AddFeedbackDialog
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            onSubmit={onAddFeedback}
            onUpdate={onUpdateFeedback}
        />
      </CardContent>
    </Card>
  );
}
