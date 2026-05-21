
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Restaurant, Feedback, Subscriber } from '@/lib/types';
import { mockRestaurants } from '@/lib/mock-data';
import { getFeedbackForRestaurant, deleteFeedback as deleteFeedbackFromDB, getSubscribers } from '@/lib/firebase';
import { suggestImprovements } from '@/ai/flows/suggest-improvements';
import { Header } from '@/components/header';
import { RestaurantDataTable } from '@/components/admin/restaurant-data-table';
import { columns } from '@/components/admin/columns';
import { SubscriberDataTable } from '@/components/admin/subscriber-data-table';
import { subscriberColumns, downloadSubscribersCSV } from '@/components/admin/subscriber-columns';
import { StatCard } from '@/components/admin/stat-card';
import { SentimentChart } from '@/components/admin/sentiment-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, MessageSquare, Star, Lightbulb, Loader2, Wand2, Users, Download, RefreshCw } from 'lucide-react';
import withAuth from '@/components/with-auth';
import { ManageFeedbackDialog } from '@/components/admin/manage-feedback-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


function AdminDashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = useState(false);
  const [selectedRestaurantForImprovements, setSelectedRestaurantForImprovements] = useState<string>('');
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
  
    const [restaurantsWithFeedback, subscriberData] = await Promise.all([
        Promise.all(
            mockRestaurants.map(async (r) => {
              const feedback = await getFeedbackForRestaurant(r.id);
              return { ...r, feedback };
            })
        ),
        getSubscribers()
    ]);
    
    setSubscribers(subscriberData);
  
    const updatedRestaurants = restaurantsWithFeedback.map((r) => {
      if (r.feedback.length === 0) {
        return { ...r, averageSentiment: 0 };
      }
      const totalScore = r.feedback.reduce((acc, f) => acc + (f.sentimentScore ?? 0), 0);
      const averageSentiment = totalScore / r.feedback.length;
      return { ...r, averageSentiment };
    });
  
    setRestaurants(updatedRestaurants);

    if (updatedRestaurants.length > 0) {
        const restaurantWithMostFeedback = [...updatedRestaurants].sort((a, b) => (b.feedback?.length ?? 0) - (a.feedback?.length ?? 0))[0];
        if (restaurantWithMostFeedback && restaurantWithMostFeedback.id) {
            setSelectedRestaurantForImprovements(restaurantWithMostFeedback.id);
        }
    }
    setIsLoading(false);
  }, []);

  const handleRefresh = () => {
      loadData();
      toast({
          title: "Dashboard Refreshed",
          description: "The latest data has been loaded.",
      });
  }

  const handleGenerateImprovements = async (restaurantId: string) => {
    if (!restaurantId) return;

    setSelectedRestaurantForImprovements(restaurantId);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant || !restaurant.feedback || restaurant.feedback.length === 0) {
      setImprovementSuggestions(["No feedback available to generate suggestions for this restaurant."]);
      return;
    };

    setIsGeneratingImprovements(true);
    setImprovementSuggestions([]);

    try {
        const result = await suggestImprovements({
            restaurantName: restaurant.name,
            feedback: restaurant.feedback.map(f => ({ text: f.text, type: f.type }))
        });
        setImprovementSuggestions(result.improvements);
    } catch (error) {
        console.error("Error generating improvements:", error);
        setImprovementSuggestions(["Could not generate suggestions at this time."]);
    } finally {
        setIsGeneratingImprovements(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDialog = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDialogOpen(true);
  }

  const handleDeleteFeedback = async (restaurantId: string, feedbackId: string) => {
    // Optimistically update UI
    const originalRestaurants = [...restaurants];
    
    let deletedFeedback: Feedback | undefined;
    const updatedRestaurants = originalRestaurants.map(r => {
        if (r.id === restaurantId) {
            const feedbackToDelete = r.feedback.find(f => f.id === feedbackId);
            deletedFeedback = feedbackToDelete;

            const updatedFeedback = r.feedback.filter(f => f.id !== feedbackId);
            
            // Recalculate average sentiment
            const totalScore = updatedFeedback.reduce((acc, f) => acc + (f.sentimentScore ?? 0), 0);
            const averageSentiment = updatedFeedback.length > 0 ? totalScore / updatedFeedback.length : 0;

            const updatedRestaurant = { ...r, feedback: updatedFeedback, averageSentiment };

            // Also update the dialog if it's open
            if (selectedRestaurant?.id === restaurantId) {
                setSelectedRestaurant(updatedRestaurant);
            }
            return updatedRestaurant;
        }
        return r;
    });

    setRestaurants(updatedRestaurants);

    try {
        await deleteFeedbackFromDB(restaurantId, feedbackId);
        toast({
            title: "Success",
            description: "Feedback has been deleted.",
        });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        toast({
            title: "Error",
            description: "Could not delete feedback. Please try again.",
            variant: "destructive"
        });
        // Rollback on error
        setRestaurants(originalRestaurants);
        if (selectedRestaurant?.id === restaurantId && deletedFeedback) {
            setSelectedRestaurant(prev => prev ? {...prev, feedback: [...prev.feedback, deletedFeedback!]} : null);
        }
    }
  }

  const totalRestaurants = restaurants.length;
  const totalFeedback = restaurants.reduce((acc, r) => acc + (r.feedback?.length ?? 0), 0);
  const totalSubscribers = subscribers.length;
  const overallAverageSentiment = restaurants.length > 0 ? restaurants.reduce((acc, r) => acc + (r.averageSentiment || 0), 0) / totalRestaurants : 0;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-headline">Admin Dashboard</h1>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="sr-only">Refresh Data</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh Dashboard Data</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        
        <section className="mb-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : (
                    <>
                        <StatCard title="Total Restaurants" value={totalRestaurants} icon={Utensils} />
                        <StatCard title="Total Feedback" value={totalFeedback} icon={MessageSquare} />
                        <StatCard title="Total Subscribers" value={totalSubscribers} icon={Users} />
                        <StatCard title="Overall Sentiment" value={overallAverageSentiment.toFixed(2)} icon={Star} />
                    </>
                )}
            </div>
        </section>

        <section className="mb-8 grid md:grid-cols-2 gap-8 items-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Sentiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                ) : (
                    <SentimentChart data={restaurants} />
                )}
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                        <Lightbulb className="h-6 w-6 text-primary"/>
                        AI-Generated Improvements
                    </CardTitle>
                     <CardDescription>
                        Select a restaurant to get AI-powered suggestions based on its feedback.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex gap-2">
                        <Select 
                            value={selectedRestaurantForImprovements} 
                            onValueChange={setSelectedRestaurantForImprovements} 
                            disabled={isGeneratingImprovements || isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a restaurant..." />
                            </SelectTrigger>
                            <SelectContent>
                                {restaurants.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => handleGenerateImprovements(selectedRestaurantForImprovements)}
                            disabled={isGeneratingImprovements || isLoading || !selectedRestaurantForImprovements}
                        >
                            {isGeneratingImprovements ? <Loader2 className="animate-spin" /> : <Wand2/>}
                            <span className="hidden md:inline ml-2">Generate</span>
                        </Button>
                     </div>
                    
                    {isGeneratingImprovements ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="ml-4 text-muted-foreground">Generating suggestions...</p>
                        </div>
                    ) : (
                        <ul className="list-disc pl-5 pt-2 space-y-2 text-sm text-foreground min-h-[100px]">
                            {improvementSuggestions.length > 0 ? (
                                improvementSuggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))
                            ) : (
                                <li className="text-muted-foreground">Select a restaurant and click "Generate" to see AI-powered improvement suggestions.</li>
                            )}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </section>


        <section className="mb-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline">Restaurant Details</h2>
             </div>
             {isLoading ? (
                 <Skeleton className="h-96 w-full" />
             ) : (
                <RestaurantDataTable columns={columns({ onManageFeedback: handleOpenDialog })} data={restaurants} />
             )}
        </section>

        <section>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline">Subscribers</h2>
                <Button 
                    variant="outline"
                    onClick={() => downloadSubscribersCSV(subscribers)}
                    disabled={isLoading || subscribers.length === 0}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export Subscribers
                </Button>
             </div>
             {isLoading ? (
                 <Skeleton className="h-96 w-full" />
             ) : (
                <SubscriberDataTable columns={subscriberColumns} data={subscribers} />
             )}
        </section>
      </main>
      {selectedRestaurant && (
        <ManageFeedbackDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            restaurant={selectedRestaurant}
            onDeleteFeedback={handleDeleteFeedback}
        />
      )}
    </>
  );
}

export default withAuth(AdminDashboard);

    