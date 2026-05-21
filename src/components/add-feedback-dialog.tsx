
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Feedback } from '@/lib/types';
import { getImprovementSuggestions } from '@/ai/flows/get-improvement-suggestions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Loader2, Wand2, CheckCircle } from 'lucide-react';

const feedbackSchema = z.object({
  text: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
  type: z.enum(['customer', 'employee'], { required_error: "You must select a feedback type." }),
});

const improvementSchema = z.object({
    improvementAreas: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one item.",
    }),
    finalComment: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;
type ImprovementFormValues = z.infer<typeof improvementSchema>;

interface AddFeedbackDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (feedback: Omit<Feedback, 'id' | 'fawuds' | 'author' | 'improvementAreas' | 'finalComment' | 'qualityScore'>) => Promise<Feedback>;
  onUpdate: (feedbackId: string, updateData: { improvementAreas: string[], finalComment?: string }) => void;
}

export function AddFeedbackDialog({ isOpen, setIsOpen, onSubmit, onUpdate }: AddFeedbackDialogProps) {
  const [step, setStep] = useState(1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedAreas, setSuggestedAreas] = useState<string[]>([]);
  const [newFeedbackId, setNewFeedbackId] = useState<string | null>(null);

  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      text: '',
      type: 'customer',
    },
  });

  const improvementForm = useForm<ImprovementFormValues>({
      resolver: zodResolver(improvementSchema),
      defaultValues: {
          improvementAreas: [],
          finalComment: '',
      }
  });

  const handleInitialSubmit = async (values: FeedbackFormValues) => {
    setIsSuggesting(true);
    try {
        const newFeedback = await onSubmit(values); // Submit initial feedback to parent to save to DB
        setNewFeedbackId(newFeedback.id);
        
        const result = await getImprovementSuggestions({ feedbackText: values.text });
        setSuggestedAreas(result.suggestions);
        setStep(2);
    } catch(e) {
        console.error("Error during initial feedback submission or suggestion fetching", e)
        // Fallback in case of error
        setSuggestedAreas(["Food Quality", "Service Speed", "Cleanliness", "Staff Friendliness", "Order Accuracy"]);
        setStep(2);
    } finally {
        setIsSuggesting(false);
    }
  };
  
  const handleImprovementSubmit = (values: ImprovementFormValues) => {
    if (newFeedbackId) {
        onUpdate(newFeedbackId, values);
    }
    setStep(3); // Go to "Thank you" step
  };

  const resetAndClose = () => {
    feedbackForm.reset();
    improvementForm.reset();
    setStep(1);
    setSuggestedAreas([]);
    setNewFeedbackId(null);
    setIsOpen(false);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetAndClose();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Submit New Feedback
          </DialogTitle>
          {step === 1 && (
            <DialogDescription className="pt-2">
              Share your experience. Your feedback helps us improve.
            </DialogDescription>
          )}
           {step === 2 && (
            <DialogDescription className="pt-2">
              Thanks! To help us improve, please select the areas your feedback relates to.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {step === 1 && (
            <Form {...feedbackForm}>
                <form onSubmit={feedbackForm.handleSubmit(handleInitialSubmit)} className="space-y-4 py-4">
                    <FormField
                        control={feedbackForm.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Feedback</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Tell us about your experience..."
                                className="resize-none"
                                {...field}
                                disabled={isSuggesting}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={feedbackForm.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>I am a...</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                                disabled={isSuggesting}
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="customer" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Customer</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="employee" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Employee</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={isSuggesting}>
                            {isSuggesting ? <Loader2 className="animate-spin" /> : 'Next'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )}

        {step === 2 && (
            isSuggesting ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <Wand2 className="h-8 w-8 text-accent animate-pulse" />
                    <p className="text-muted-foreground">AI is analyzing your feedback...</p>
                </div>
            ) : (
                <Form {...improvementForm}>
                    <form onSubmit={improvementForm.handleSubmit(handleImprovementSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={improvementForm.control}
                            name="improvementAreas"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Areas for Improvement</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                    {suggestedAreas.map((item) => (
                                        <FormField
                                            key={item}
                                            control={improvementForm.control}
                                            name="improvementAreas"
                                            render={({ field }) => {
                                                return (
                                                <FormItem
                                                    key={item}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item
                                                                )
                                                                )
                                                        }}
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal">
                                                        {item}
                                                    </FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={improvementForm.control}
                            name="finalComment"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Anything else to add? (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Add any other details here..."
                                    className="resize-none"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Submit Feedback</Button>
                        </DialogFooter>
                    </form>
                </Form>
            )
        )}
        
        {step === 3 && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-headline">Thank You!</h3>
                <p className="text-muted-foreground">Your feedback has been submitted and is vital for our improvement.</p>
                <Button onClick={resetAndClose}>Close</Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
