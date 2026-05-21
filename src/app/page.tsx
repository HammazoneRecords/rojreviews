
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Restaurant, Feedback, ScoreFeedbackOutput } from '@/lib/types';
import { mockRestaurants } from '@/lib/mock-data';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import { Header } from '@/components/header';
import { EmailSignupDialog } from '@/components/email-signup-dialog';
import { SentimentIndexCards } from '@/components/sentiment-index-cards';
import { RestaurantGrid } from '@/components/restaurant-grid';
import { FeedbackSection } from '@/components/feedback-section';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addFeedback, getFeedbackForRestaurantPaginated, incrementFawudCount, updateFeedback, updateFeedbackSentimentScore } from '@/lib/firebase';
import Image from 'next/image';
import { DocumentSnapshot } from 'firebase/firestore';

const FAWUD_COUNTS_KEY = 'ralfeedback-fawud-counts';

type FeedbackCategoryState = {
  items: Feedback[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
};

type FeedbackState = {
  customer: FeedbackCategoryState;
  employee: FeedbackCategoryState;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [topRated, setTopRated] = useState<Restaurant | null>(null);
  const [needsImprovement, setNeedsImprovement] = useState<Restaurant | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [fawudCounts, setFawudCounts] = useState<Record<string, number>>({});
  
  const [feedbackState, setFeedbackState] = useState<Record<string, FeedbackState>>({});

  useEffect(() => {
    try {
      const storedCounts = localStorage.getItem(FAWUD_COUNTS_KEY);
      if (storedCounts) {
        setFawudCounts(JSON.parse(storedCounts));
      }
    } catch (error) {
      console.error("Could not parse fawud counts from localStorage", error);
    }
    
    const analyzeAllFeedback = async () => {
      setIsAnalyzing(true);
  
      const restaurantsWithInitialFeedback = await Promise.all(
        mockRestaurants.map(async (r) => {
          const [customerResult, employeeResult] = await Promise.all([
            getFeedbackForRestaurantPaginated(r.id, 'customer', null),
            getFeedbackForRestaurantPaginated(r.id, 'employee', null)
          ]);
  
          setFeedbackState(prev => ({
            ...prev,
            [r.id]: {
              customer: { items: customerResult.feedback, lastVisible: customerResult.lastVisible, hasMore: customerResult.lastVisible !== null },
              employee: { items: employeeResult.feedback, lastVisible: employeeResult.lastVisible, hasMore: employeeResult.lastVisible !== null }
            }
          }));
  
          const allFeedback = [...customerResult.feedback, ...employeeResult.feedback];
          return { ...r, feedback: allFeedback };
        })
      );
  
      const updatedRestaurants = restaurantsWithInitialFeedback.map((r) => {
        if (r.feedback.length === 0) {
          return { ...r, averageSentiment: 0 };
        }
        const totalScore = r.feedback.reduce((acc, f) => acc + (f.sentimentScore ?? 0), 0);
        const averageSentiment = totalScore / r.feedback.length;
        return { ...r, averageSentiment };
      });
  
      const restaurantsWithData = updatedRestaurants.filter(r => r.feedback.length > 0);
      restaurantsWithData.sort((a, b) => (b.averageSentiment ?? 0) - (a.averageSentiment ?? 0));
  
      setRestaurants(updatedRestaurants);
  
      if (restaurantsWithData.length > 0) {
        setTopRated(restaurantsWithData[0]);
        setNeedsImprovement(restaurantsWithData[restaurantsWithData.length - 1]);
      } else {
        const sortedMock = [...mockRestaurants].sort((a,b) => a.name.localeCompare(b.name));
        setTopRated(updatedRestaurants.find(r => r.id === sortedMock[0].id) || null);
        setNeedsImprovement(updatedRestaurants.find(r => r.id === sortedMock[1].id) || null);
      }
      
      setIsAnalyzing(false);
    };
  
    analyzeAllFeedback();
  }, []);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.scrollY > 400){
        setShowScroll(true)
      } else if (showScroll && window.scrollY <= 400){
        setShowScroll(false)
      }
    };
    window.addEventListener('scroll', checkScrollTop)
    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [showScroll]);


  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleClearSelection = () => {
    setSelectedRestaurant(null);
  }
  
  const handleFawud = (restaurantId: string, feedbackId: string) => {
    const currentCount = fawudCounts[feedbackId] || 0;
    if (currentCount >= 3) {
      return;
    }

    const newCounts = { ...fawudCounts, [feedbackId]: currentCount + 1 };
    setFawudCounts(newCounts);
    localStorage.setItem(FAWUD_COUNTS_KEY, JSON.stringify(newCounts));

    const updateFawuds = (feedbackList: Feedback[]) => feedbackList.map(f =>
        f.id === feedbackId ? { ...f, fawuds: (f.fawuds || 0) + 1 } : f
    );

    // Update detailed feedbackState for individual tabs
    setFeedbackState(prev => {
        const restaurantState = prev[restaurantId];
        if (!restaurantState) return prev;

        return {
            ...prev,
            [restaurantId]: {
                customer: {
                    ...restaurantState.customer,
                    items: updateFawuds(restaurantState.customer.items)
                },
                employee: {
                    ...restaurantState.employee,
                    items: updateFawuds(restaurantState.employee.items)
                }
            }
        };
    });

    incrementFawudCount(restaurantId, feedbackId).catch(error => {
      console.error("Failed to increment fawud count in Firestore:", error);
      // NOTE: Consider adding rollback logic here if the DB update fails
    });
  };

  const handleAddFeedback = async (restaurantId: string, feedbackData: Omit<Feedback, 'id' | 'fawuds' | 'author' | 'improvementAreas' | 'finalComment' | 'qualityScore'>): Promise<Feedback> => {
    const newFeedbackWithId = await addFeedback(restaurantId, feedbackData);
    
    const sentimentResult = await analyzeSentiment({ text: newFeedbackWithId.text });
    const newSentimentScore = sentimentResult.sentimentScore;
    
    await updateFeedbackSentimentScore(restaurantId, newFeedbackWithId.id, newSentimentScore);
    
    const newFeedbackWithScore = { ...newFeedbackWithId, sentimentScore: newSentimentScore };
    
    const updater = (prevR: Restaurant) => {
      const existingFeedback = prevR.feedback || [];
      const updatedFeedbackList = [newFeedbackWithScore, ...existingFeedback];
      
      const totalSentiment = updatedFeedbackList.reduce((sum, f) => sum + (f.sentimentScore || 0), 0);
      const averageSentiment = updatedFeedbackList.length > 0 ? totalSentiment / updatedFeedbackList.length : 0;
      
      return {
        ...prevR,
        feedback: updatedFeedbackList,
        averageSentiment: averageSentiment,
      };
    };

    setRestaurants(prevRestaurants => 
      prevRestaurants.map(r => (r.id === restaurantId ? updater(r) : r))
    );

    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant(prev => (prev ? updater(prev) : null));
    }
    
    // Also update the specific feedback state category
    const feedbackType = newFeedbackWithScore.type as 'customer' | 'employee';
    setFeedbackState(prev => {
        const currentRestaurantState = prev[restaurantId];
        const currentCategoryState = currentRestaurantState[feedbackType];
        return {
            ...prev,
            [restaurantId]: {
                ...currentRestaurantState,
                [feedbackType]: {
                    ...currentCategoryState,
                    items: [newFeedbackWithScore, ...currentCategoryState.items]
                }
            }
        }
    });

    return newFeedbackWithScore;
  };

  const handleUpdateFeedback = async (restaurantId: string, feedbackId: string, updateData: { improvementAreas: string[], finalComment?: string }) => {
    await updateFeedback(restaurantId, feedbackId, updateData);
    
    const updater = (feedbackList: Feedback[]) => feedbackList.map(f => 
      f.id === feedbackId ? { ...f, ...updateData } : f
    );

    setRestaurants(prevRestaurants => 
      prevRestaurants.map(r => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          feedback: updater(r.feedback)
        }
      })
    );
    
    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant(prev => {
        if (!prev) return null;
        return { ...prev, feedback: updater(prev.feedback) };
      });
    }

     // Also update the specific feedback state category
     setFeedbackState(prev => {
      const currentRestaurantState = prev[restaurantId];
      return {
          ...prev,
          [restaurantId]: {
              ...currentRestaurantState,
              customer: { ...currentRestaurantState.customer, items: updater(currentRestaurantState.customer.items) },
              employee: { ...currentRestaurantState.employee, items: updater(currentRestaurantState.employee.items) }
          }
      }
  });

  }

  const handleQualityScoreUpdate = (restaurantId: string, feedbackId: string, newScore: ScoreFeedbackOutput) => {
    const updater = (feedbackList: Feedback[]) => feedbackList.map(f =>
      f.id === feedbackId ? {...f, qualityScore: newScore} : f
    );
    
    setRestaurants(prevRestaurants => 
      prevRestaurants.map(r => {
        if (r.id !== restaurantId) return r;
        return { ...r, feedback: updater(r.feedback) };
      })
    );
      
    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant(prev => {
        if (!prev) return null;
        return { ...prev, feedback: updater(prev.feedback) };
      });
    }

    // Also update the specific feedback state category
    setFeedbackState(prev => {
      const currentRestaurantState = prev[restaurantId];
      return {
          ...prev,
          [restaurantId]: {
              ...currentRestaurantState,
              customer: { ...currentRestaurantState.customer, items: updater(currentRestaurantState.customer.items) },
              employee: { ...currentRestaurantState.employee, items: updater(currentRestaurantState.employee.items) }
          }
      }
    });
  };

  const handleLoadMoreFeedback = useCallback(async (restaurantId: string, feedbackType: 'customer' | 'employee') => {
    const currentState = feedbackState[restaurantId]?.[feedbackType];
    if (!currentState || !currentState.hasMore) return;
  
    const { feedback: newFeedback, lastVisible } = await getFeedbackForRestaurantPaginated(
      restaurantId,
      feedbackType,
      currentState.lastVisible
    );
  
    const combinedFeedback = [...currentState.items, ...newFeedback];
  
    setFeedbackState(prev => ({
        ...prev,
        [restaurantId]: {
            ...prev[restaurantId],
            [feedbackType]: {
                items: combinedFeedback,
                lastVisible: lastVisible,
                hasMore: lastVisible !== null,
            }
        }
    }));
  
  }, [feedbackState]);


  const scrollTop = () =>{
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className={`transition-opacity duration-500 ${selectedRestaurant ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
            <section id="sentiment-analysis" className="mb-12">
              <h2 className="text-2xl font-headline text-center mb-4">Sentiment Index</h2>
              <SentimentIndexCards
                topRated={topRated}
                needsImprovement={needsImprovement}
                isLoading={isAnalyzing}
              />
            </section>

            <section id="restaurant-selection" className="mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-headline text-center mb-8">Choose a Restaurant</h2>
              {isAnalyzing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
              ) : (
                <RestaurantGrid restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />
              )}
            </section>
        </div>

        {selectedRestaurant && (
          <section id="feedback-section" className="scroll-mt-20 animate-in fade-in duration-500">
             <div className="flex justify-center mb-8 relative">
                <Button variant="outline" onClick={handleClearSelection} className="absolute left-0 top-1/2 -translate-y-1/2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Restaurants
                </Button>
                <div className="relative h-36 w-72">
                    <Image
                        src={selectedRestaurant.logo}
                        alt={`${selectedRestaurant.name} logo`}
                        fill
                        className="object-contain"
                        data-ai-hint={selectedRestaurant.data_ai_hint}
                    />
                </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline text-center mb-8">
              Feedback for <span className="text-primary">{selectedRestaurant.name}</span>
            </h2>
            <FeedbackSection
              restaurant={selectedRestaurant}
              onFawud={(feedbackId) => handleFawud(selectedRestaurant.id, feedbackId)}
              onAddFeedback={(feedback) => handleAddFeedback(selectedRestaurant.id, feedback)}
              onUpdateFeedback={(feedbackId, updateData) => handleUpdateFeedback(selectedRestaurant.id, feedbackId, updateData)}
              onQualityScoreUpdate={(feedbackId, newScore) => handleQualityScoreUpdate(selectedRestaurant.id, feedbackId, newScore)}
              onLoadMore={handleLoadMoreFeedback}
              feedbackState={feedbackState[selectedRestaurant.id]}
            />
          </section>
        )}
      </main>
      <EmailSignupDialog />
      {showScroll && (
        <Button
          onClick={scrollTop}
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <ArrowUp className="h-6 w-6" />
          <span className="sr-only">Scroll to top</span>
        </Button>
      )}
    </>
  );
}
