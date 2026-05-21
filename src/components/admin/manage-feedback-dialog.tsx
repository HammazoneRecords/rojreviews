
"use client";

import React from 'react';
import type { Restaurant, Feedback } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, Trash2, ThumbsUp } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface ManageFeedbackDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  restaurant: Restaurant;
  onDeleteFeedback: (restaurantId: string, feedbackId: string) => void;
}

const getSentimentBadgeVariant = (score: number) => {
    if (score > 0.3) return "default";
    if (score < -0.3) return "destructive";
    return "secondary";
}

const getSentimentBadgeLabel = (score: number) => {
    if (score > 0.3) return "Positive";
    if (score < -0.3) return "Negative";
    return "Neutral";
}

export function ManageFeedbackDialog({ isOpen, setIsOpen, restaurant, onDeleteFeedback }: ManageFeedbackDialogProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Manage Feedback for {restaurant.name}
          </DialogTitle>
          <DialogDescription>
            Review and remove feedback entries. Deletions are permanent.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <div className="space-y-3">
                {restaurant.feedback.length > 0 ? restaurant.feedback.map(f => (
                    <Card key={f.id} className="bg-secondary/50">
                        <CardContent className="p-3 flex justify-between items-start">
                           <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm font-semibold">{f.author}</p>
                                    <Badge variant={f.type === 'customer' ? 'secondary' : 'outline'}>{f.type}</Badge>
                                </div>
                                <p className="text-sm text-foreground">{f.text}</p>
                           </div>
                           <div className="flex flex-col items-end gap-2 ml-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant={getSentimentBadgeVariant(f.sentimentScore ?? 0)}>
                                            {getSentimentBadgeLabel(f.sentimentScore ?? 0)} ({(f.sentimentScore ?? 0).toFixed(2)})
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <ThumbsUp className="h-4 w-4 text-primary" />
                                        <span>{f.fawuds}</span>
                                    </div>
                                </div>
                               <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this
                                            piece of feedback from the database.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDeleteFeedback(restaurant.id, f.id)}>
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                           </div>
                        </CardContent>
                    </Card>
                )) : (
                    <p className="text-center text-muted-foreground py-8">No feedback for this restaurant.</p>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
