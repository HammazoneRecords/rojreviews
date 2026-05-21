
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2 } from 'lucide-react';
import { addSubscriber } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { getUsername, createNewUsername } from '@/lib/username-generator';


const DIALOG_STORAGE_KEY = 'ralfeedback-signup-shown';

export function EmailSignupDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem(DIALOG_STORAGE_KEY);
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(DIALOG_STORAGE_KEY, 'true');
      }, 3000); // 3-second delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const username = getUsername(); // Get the persistent username

    try {
      await addSubscriber(email, username);
      toast({
        title: 'Subscription Successful!',
        description: 'Thanks for joining! Keep an eye on your inbox for great deals.',
      });
      createNewUsername(); // Generate a new username for the next user on this browser
      setIsOpen(false);
    } catch (error) {
        const errorMessage = error instanceof Error && error.message.includes("already subscribed")
            ? "This email address has already been subscribed."
            : "Something went wrong. Please try again.";

        console.error("Failed to add subscriber:", error);
        toast({
            title: 'Subscription Failed',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Don't Miss Out!
          </DialogTitle>
          <DialogDescription className="pt-2">
            Get real meal deals, exclusive discounts, and a chance to win a <span className="font-bold text-primary">$20K/month meal card!</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Subscribe Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
