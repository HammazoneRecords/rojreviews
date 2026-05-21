"use client";

import type { Summarization } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Separator } from './ui/separator';

interface SummarizationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  summarization: Summarization;
  restaurantName: string;
}

export function SummarizationDialog({
  isOpen,
  setIsOpen,
  summarization,
  restaurantName,
}: SummarizationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            AI Summary for {restaurantName}
          </DialogTitle>
          <DialogDescription>
            An AI-generated analysis of all customer and employee feedback.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
          {summarization ? (
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-bold font-headline mb-2 text-lg">Customer Feedback Summary</h4>
                <p className="text-muted-foreground">{summarization.customerSummary}</p>
              </div>

              <div>
                <h4 className="font-bold font-headline mb-2 text-lg">Employee Feedback Summary</h4>
                <p className="text-muted-foreground">{summarization.employeeSummary}</p>
              </div>
              
              <Separator/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold font-headline mb-3 text-lg flex items-center gap-2 text-green-600">
                    <ThumbsUp className="h-5 w-5" />
                    Key Positives
                  </h4>
                  <p className="text-muted-foreground">{summarization.keyPositivePoints}</p>
                </div>
                <div>
                   <h4 className="font-bold font-headline mb-3 text-lg flex items-center gap-2 text-red-600">
                    <ThumbsDown className="h-5 w-5" />
                    Key Negatives
                  </h4>
                  <p className="text-muted-foreground">{summarization.keyNegativePoints}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No summary available.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
