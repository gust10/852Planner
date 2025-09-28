import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Clock, Navigation, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Sparkles, Code, ExternalLink, Save, BookmarkPlus, Calendar, MessageSquare, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslations();
  const { user } = useAuth();
  const { surveyData, selectedLandmarks, savedItinerary, itineraryId } = location.state || {};
  const [currentDay, setCurrentDay] = useState(0);
  const [aiItinerary, setAiItinerary] = useState<any>(savedItinerary || null);
  const [isGenerating, setIsGenerating] = useState(!savedItinerary);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSaveAfterAuth, setPendingSaveAfterAuth] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!itineraryId);
  const [saveData, setSaveData] = useState({
    title: '',
    description: '',
    isPublic: false
  });
  const [showExpenseChart, setShowExpenseChart] = useState(false);

  // Save itinerary to database
  const handleSaveItinerary = async () => {
    if (!user) {
      setShowSaveDialog(false);
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const itineraryData = {
        user_id: user.id,
        title: saveData.title || `WonderPlan HK Adventure - ${new Date().toLocaleDateString()}`,
        description: saveData.description,
        survey_data: surveyData,
        selected_landmarks: selectedLandmarks,
        generated_itinerary: aiItinerary,
        start_date: surveyData?.startDate || surveyData?.dateRange?.from,
        end_date: surveyData?.endDate || surveyData?.dateRange?.to,
        is_public: saveData.isPublic
      };

      const { error } = await supabase
        .from('itineraries')
        .insert([itineraryData]);

      if (error) throw error;

      setIsSaved(true);
      setShowSaveDialog(false);
      toast({
        title: "✨ Itinerary Saved!",
        description: "Your adventure has been saved to your dashboard.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate AI-powered itinerary
  useEffect(() => {
    if (!savedItinerary) {
      generateAiItinerary();
    }
  }, [savedItinerary]);

  // Auto-save after authentication
  useEffect(() => {
    if (user && pendingSaveAfterAuth && aiItinerary) {
      setPendingSaveAfterAuth(false);
      setShowSaveDialog(true);
    }
  }, [user, pendingSaveAfterAuth, aiItinerary]);

  const generateAiItinerary = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const { data: functionData, error: functionError } = await supabase.functions.invoke('ai', {
        body: { 
          selectedLandmarks,
          surveyData 
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to generate itinerary");
      }

      if (functionData?.success && functionData?.itinerary) {
        // Fetch images and coordinates for all activities before setting the itinerary
        await fetchImagesForItinerary(functionData.itinerary);
        
        // Celebration confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error(functionData?.error || "Invalid response from AI");
      }

    } catch (err) {
      console.error('Itinerary generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary');
      toast({
        title: "Generation Failed",
        description: "Using fallback itinerary. Please try again later.",
        variant: "destructive",
      });
      
      // Fallback to basic itinerary - calculate days from date range
      let days = 5; // default fallback
      if (surveyData?.startDate && surveyData?.endDate) {
        const startDate = new Date(surveyData.startDate);
        const endDate = new Date(surveyData.endDate);
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      } else if (surveyData?.dateRange?.from && surveyData?.dateRange?.to) {
        const startDate = new Date(surveyData.dateRange.from);
        const endDate = new Date(surveyData.dateRange.to);
        days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      }
      
      // Define landmarks mapping for fallback
      const landmarkMap: { [key: string]: { name: string; duration: string; coordinates?: { lat: number; lng: number } } } = {
        "disneyland": { name: "Hong Kong Disneyland", duration: "Full Day", coordinates: { lat: 22.3129, lng: 114.0413 } },
        "victoria-peak": { name: "Victoria Peak", duration: "3-4 hours", coordinates: { lat: 22.2708, lng: 114.1501 } },
        "victoria-harbour": { name: "Victoria Harbour", duration: "2-3 hours", coordinates: { lat: 22.2944, lng: 114.1722 } },
        "ocean-park": { name: "Ocean Park", duration: "Full Day", coordinates: { lat: 22.2462, lng: 114.1800 } },
        "avenue-of-stars": { name: "Avenue of Stars", duration: "1-2 hours", coordinates: { lat: 22.2944, lng: 114.1722 } },
        "dragons-back": { name: "Dragon's Back Trail", duration: "4-5 hours", coordinates: { lat: 22.2193, lng: 114.2694 } },
        "m-plus-museum": { name: "M+ Museum", duration: "2-3 hours", coordinates: { lat: 22.3037, lng: 114.1608 } },
        "temple-street-night-market": { name: "Temple Street Night Market", duration: "2-3 hours", coordinates: { lat: 22.3050, lng: 114.1714 } }
      };
      
      // Create fallback itinerary based on whether landmarks are selected or not
      let fallbackItinerary;
      
      if (selectedLandmarks && selectedLandmarks.length > 0) {
        // Use selected landmarks for fallback
        const landmarksPerDay = Math.ceil(selectedLandmarks.length / days);
        fallbackItinerary = {
          days: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            theme: `Day ${i + 1} Highlights`,
            activities: selectedLandmarks.slice(i * landmarksPerDay, (i + 1) * landmarksPerDay).map((landmarkId: string, j: number) => {
              const landmark = landmarkMap[landmarkId] || { name: landmarkId, duration: '2-3 hours' };
              return {
                time: `${(surveyData?.startTime || 9) + (j * 3)}:00 AM`,
                duration: landmark.duration,
                title: landmark.name,
                description: `Explore this amazing Hong Kong attraction.`,
                transportation: j === 0 ? 'Start here' : 'MTR (15-20 mins)',
                cost: 'HK$100-300'
                // No coordinates - will be fetched by fetch-images API from Google Places
              };
            })
          })),
          overallTips: ['Book tickets online', 'Use Octopus Card', 'Try local food']
        };
      } else {
        // Create a general Hong Kong itinerary based on travel interests
        const generalAttractions = [
          { name: "Victoria Peak", duration: "3-4 hours", coordinates: { lat: 22.2708, lng: 114.1501 } },
          { name: "Victoria Harbour", duration: "2-3 hours", coordinates: { lat: 22.2944, lng: 114.1722 } },
          { name: "Avenue of Stars", duration: "1-2 hours", coordinates: { lat: 22.2944, lng: 114.1722 } },
          { name: "Temple Street Night Market", duration: "2-3 hours", coordinates: { lat: 22.3050, lng: 114.1714 } },
          { name: "Central District", duration: "2-3 hours", coordinates: { lat: 22.2783, lng: 114.1747 } },
          { name: "Tsim Sha Tsui Promenade", duration: "1-2 hours", coordinates: { lat: 22.2944, lng: 114.1722 } }
        ];
        
        const attractionsPerDay = Math.ceil(generalAttractions.length / days);
        fallbackItinerary = {
          days: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            theme: `Day ${i + 1} - Hong Kong Highlights`,
            activities: generalAttractions.slice(i * attractionsPerDay, (i + 1) * attractionsPerDay).map((attraction, j: number) => ({
              time: `${(surveyData?.startTime || 9) + (j * 3)}:00 AM`,
              duration: attraction.duration,
              title: attraction.name,
              description: `Discover the best of Hong Kong at this popular attraction.`,
              transportation: j === 0 ? 'Start here' : 'MTR (15-20 mins)',
              cost: 'HK$50-200'
              // No coordinates - will be fetched by fetch-images API from Google Places
            }))
          })),
          overallTips: ['Use Octopus Card for transportation', 'Try local dim sum', 'Check weather before outdoor activities']
        };
      }
      setAiItinerary(fallbackItinerary);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch images for all activities in the itinerary
  const fetchImagesForItinerary = async (itinerary: any) => {
    try {
      setIsFetchingImages(true);
      
      // Collect all activities from all days
      const allActivities = itinerary.days.reduce((acc: any[], day: any) => {
        return acc.concat(day.activities || []);
      }, []);

      // Fetch images for all activities
      const { data: imageData, error: imageError } = await supabase.functions.invoke('fetch-images', {
        body: { activities: allActivities }
      });

      if (imageError) {
        console.error('Error fetching images:', imageError);
        // Still update with original itinerary if image fetch fails
        setAiItinerary(itinerary);
        return;
      }

      if (imageData?.success && imageData?.activities) {
        // Update the itinerary with image URLs and coordinates
        const updatedItinerary = {
          ...itinerary,
          days: itinerary.days.map((day: any) => ({
            ...day,
            activities: day.activities.map((activity: any, activityIndex: number) => {
              // Find the corresponding activity with image
              const dayIndex = itinerary.days.indexOf(day);
              const globalActivityIndex = itinerary.days.slice(0, dayIndex).reduce((sum: number, d: any) => sum + (d.activities?.length || 0), 0) + activityIndex;
              const activityWithImage = imageData.activities[globalActivityIndex];
              
              // Prioritize coordinates from Google Places API (fetch-images response)
              const finalCoordinates = activityWithImage?.coordinates || activity.coordinates;
              console.log(`[Itinerary] ${activity.title}: Using coordinates from ${activityWithImage?.coordinates ? 'Google Places API' : 'fallback'}: ${JSON.stringify(finalCoordinates)}`);
              
              return {
                ...activity,
                imageUrl: activityWithImage?.imageUrl || null,
                coordinates: finalCoordinates
              };
            })
          }))
        };
        
        setAiItinerary(updatedItinerary);
        console.log('Successfully updated itinerary with images and coordinates');
      } else {
        // If no activities data returned, still set the original itinerary
        console.log('No activities data returned, using original itinerary');
        setAiItinerary(itinerary);
      }
    } catch (error) {
      console.error('Error in fetchImagesForItinerary:', error);
      // Still update with original itinerary if fetch fails
      setAiItinerary(itinerary);
    } finally {
      setIsFetchingImages(false);
    }
  };

  // Only needed for loading saved itinerary, generation is handled in previous useEffect

  const itinerary = aiItinerary?.days || [];

  const handleBack = () => {
    navigate("/survey", { state: { surveyData, step: 6 } });
  };

  const nextDay = () => {
    if (currentDay < itinerary.length - 1) {
      setCurrentDay(prev => prev + 1);
      // Smooth scroll the scrollable content container to top
      const scrollableContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  const prevDay = () => {
    if (currentDay > 0) {
      setCurrentDay(prev => prev - 1);
      // Smooth scroll the scrollable content container to top
      const scrollableContainer = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  const currentDayData = itinerary[currentDay];

  // Generate Google Maps URL for navigation
  const getNavigationUrl = (currentActivity: any, previousActivity?: any) => {
    if (currentActivity.coordinates) {
      const { lat, lng } = currentActivity.coordinates;
      
      if (previousActivity?.coordinates) {
        // Navigation from previous location to current location
        const originLat = previousActivity.coordinates.lat;
        const originLng = previousActivity.coordinates.lng;
        return `https://www.google.com/maps/dir/${originLat},${originLng}/${lat},${lng}`;
      } else {
        // Navigation from current location to destination (first activity of the day)
        return `https://www.google.com/maps/dir//${lat},${lng}`;
      }
    } else {
      // Fallback to search by name
      const query = encodeURIComponent(currentActivity.title + " Hong Kong");
      return `https://www.google.com/maps/search/${query}`;
    }
  };

  // Parse and categorize expenses from itinerary
  const getExpenseData = () => {
    if (!aiItinerary?.days) {
      console.log('[Expense] No itinerary days available:', aiItinerary);
      return [];
    }

    const expenseCategories: { [key: string]: number } = {};
    const numberOfPeople = surveyData?.totalPeople || 1;

    console.log('[Expense] Calculating for', numberOfPeople, 'people');

    aiItinerary.days.forEach((day: any) => {
      day.activities?.forEach((activity: any) => {
        if (activity.cost) {
          // Parse cost string like "HK$100-300" or "HK$50-200"
          const costMatch = activity.cost.match(/HK\$(\d+)-(\d+)/);
          if (costMatch) {
            const minCost = parseInt(costMatch[1]);
            const maxCost = parseInt(costMatch[2]);
            const avgCost = Math.round((minCost + maxCost) / 2);

            // Multiply by number of people
            const totalCost = avgCost * numberOfPeople;

            // Categorize based on activity type
            let category = 'Attractions';
            const title = activity.title.toLowerCase();
            const description = activity.description.toLowerCase();

            if (title.includes('disneyland') || title.includes('ocean park') || title.includes('theme')) {
              category = 'Theme Parks';
            } else if (title.includes('peak') || title.includes('harbour') || title.includes('view') || title.includes('museum') || title.includes('gallery')) {
              category = 'Sightseeing';
            } else if (title.includes('market') || title.includes('shopping') || title.includes('mall')) {
              category = 'Shopping';
            } else if (title.includes('food') || title.includes('dim sum') || title.includes('restaurant') ||
                      title.includes('dining') || title.includes('lunch') || title.includes('dinner') ||
                      title.includes('breakfast') || title.includes('eat') || title.includes('meal') ||
                      title.includes('cafe') || title.includes('tea') || title.includes('bar') ||
                      description.includes('food') || description.includes('dining') || description.includes('restaurant') ||
                      description.includes('eat') || description.includes('meal')) {
              category = 'Food & Dining';
            } else if (title.includes('mtr') || title.includes('transport') || title.includes('bus') ||
                      title.includes('ferry') || title.includes('taxi') || title.includes('metro') ||
                      title.includes('subway') || title.includes('train')) {
              category = 'Transportation';
            }

            expenseCategories[category] = (expenseCategories[category] || 0) + totalCost;

            // Debug logging to understand categorization
            console.log(`[Expense] "${activity.title}" -> ${category} (HK$${totalCost})`);
          }
        }
      });
    });

    // Convert to chart data format
    return Object.entries(expenseCategories).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0 // Will be calculated below
    })).map(item => {
      const total = Object.values(expenseCategories).reduce((sum, amt) => sum + amt, 0);
      return {
        ...item,
        percentage: Math.round((item.amount / total) * 100)
      };
    });
  };

  // Calculate expense data reactively
  const expenseData = React.useMemo(() => {
    console.log('[Expense] Recalculating expense data');
    console.log('[Expense] surveyData:', surveyData);
    console.log('[Expense] aiItinerary:', aiItinerary);
    return getExpenseData();
  }, [aiItinerary, surveyData]);

  const totalExpenses = React.useMemo(() => {
    return expenseData.reduce((sum, item) => sum + item.amount, 0);
  }, [expenseData]);

  // Colors for the chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  // Loading state
  if (isGenerating) {
    return (
      <div className="h-screen bg-gradient-hero flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 animate-fade-in">
            Creating Your Perfect Itinerary
          </h2>
          <p className="text-muted-foreground animate-fade-in mb-4">
            Our AI is crafting a personalized adventure based on your selected attractions...
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ Analyzing your preferences</p>
            <p>🗺️ Optimizing routes and timing</p>
            <p>🍽️ Finding perfect dining spots</p>
            <p>💡 Adding insider tips</p>
            {isFetchingImages && <p>📸 Fetching attraction images</p>}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !aiItinerary) {
    return (
      <div className="h-screen bg-gradient-hero flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={generateAiItinerary} className="w-full neon-button">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/survey", { state: { surveyData, step: 6 } })} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-hero flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col h-full">
        {/* Fixed Header */}
        <div className="text-center pt-6 pb-3 px-6 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold text-foreground animate-fade-in">
              {t('itinerary.title')}
            </h1>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Map Section */}
          <div className="pb-3">
            <Card className="card-hover border-0 overflow-hidden">
              <div className="h-64">
                <Map 
                  key={`map-day-${currentDay}-${JSON.stringify(currentDayData?.activities?.map(a => a.coordinates))}`}
                  activities={currentDayData?.activities || []} 
                  className="w-full h-full"
                />
              </div>
              <div className="p-3 bg-gradient-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span className="text-secondary-foreground font-medium">Day {currentDay + 1} Route</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentDayData?.activities?.filter(a => a.coordinates).length || 0} locations
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

        {/* Activities */}
          <Card className="card-hover border-0">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {currentDay + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Day {currentDay + 1}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{currentDayData?.activities?.length || 0} activities</p>
                    {aiItinerary?.days?.[currentDay]?.theme && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{aiItinerary.days[currentDay].theme}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentDayData?.activities?.map((activity: any, index: number) => (
                  <div key={index} className="relative">
                    {index < currentDayData.activities.length - 1 && (
                      <div className="absolute left-3 top-12 w-0.5 h-8 bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-gradient-secondary rounded-full flex items-center justify-center text-xs font-bold text-secondary-foreground flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{activity.title}</h4>
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            {activity.time}
                          </Badge>
                        </div>
                        
                        {activity.imageUrl && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <img 
                              src={activity.imageUrl} 
                              alt={activity.title}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {activity.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{activity.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>{activity.transportation}</span>
                            </div>
                            {activity.cost && (
                              <span className="text-xs font-medium">{activity.cost}</span>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={() => {
                              const previousActivity = index > 0 ? currentDayData.activities[index - 1] : undefined;
                              const url = getNavigationUrl(activity, previousActivity);
                              window.open(url, '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {index === 0 ? 'Navigate Here' : 'Navigate From Previous'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiItinerary?.overallTips && currentDay === 0 && (
                  <div className="mt-6 p-3 bg-gradient-subtle rounded-lg border border-border/30">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Travel Tips</h4>
                    <div className="space-y-1">
                      {aiItinerary.overallTips.slice(0, 3).map((tip: string, index: number) => (
                        <p key={index} className="text-xs text-muted-foreground">• {tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center justify-between px-6 pb-3 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={prevDay}
            disabled={currentDay === 0}
            className="interactive-scale bg-background/80 backdrop-blur-sm border-2 hover:bg-primary/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <div className="text-xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Day {currentDay + 1}
            </div>
            <div className="flex gap-1 mt-1 justify-center">
              {itinerary.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentDay ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextDay}
            disabled={currentDay === itinerary.length - 1}
            className="interactive-scale bg-background/80 backdrop-blur-sm border-2 hover:bg-primary/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

  {/* Fixed Bottom Actions */}
  <div className="flex gap-2 p-4 flex-shrink-0 bg-gradient-hero">
          <Button
            variant="outline"
            size="default"
            onClick={handleBack}
            className="flex-1 interactive-scale"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modify
          </Button>
          
          {/* Save Button */}
          {!isSaved ? (
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (!user) {
                  setPendingSaveAfterAuth(true);
                  setShowAuthModal(true);
                } else {
                  setShowSaveDialog(true);
                }
              }}
              className="interactive-scale"
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Save
            </Button>
          ) : (
            <Button
              variant="outline"
              size="default"
              disabled
              className="interactive-scale"
            >
              <Save className="w-4 h-4 mr-2" />
              Saved
            </Button>
          )}

          {/* View Dashboard Button */}
          {user && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="interactive-scale"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="interactive-scale"
              >
                <DollarSign className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Expense Breakdown</DialogTitle>
                <DialogDescription>
                  Estimated costs for your itinerary activities
                  {surveyData?.totalPeople > 1 && (
                    <span className="block text-xs mt-1">
                      Calculated for {surveyData.totalPeople} people
                    </span>
                  )}
                  <span className="block text-xs mt-1 text-muted-foreground font-medium">
                    * This is just a raw estimation! *
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {expenseData.length > 0 ? (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        HK${totalExpenses.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total estimated cost</p>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percentage }) => `${percentage}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="amount"
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => {
                            const numberOfPeople = surveyData?.totalPeople || 1;
                            const totalCost = Number(value);
                            const costPerPerson = Math.round(totalCost / numberOfPeople);
                            return [
                              `HK$${totalCost.toLocaleString()}${numberOfPeople > 1 ? ` (HK$${costPerPerson.toLocaleString()}/person)` : ''}`, 
                              'Amount'
                            ];
                          }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Category Breakdown</h4>
                      {expenseData.map((item, index) => (
                        <div key={item.category} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="truncate">{item.category}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-medium">HK${item.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No expense data available</p>
                    <p className="text-xs text-muted-foreground mt-1">Cost estimates will appear here when available</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="interactive-scale"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>AI Prompt Data</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[60vh]">
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify({ selectedLandmarks, surveyData }, null, 2)}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Your Itinerary</DialogTitle>
              <DialogDescription>
                Save this itinerary to your dashboard for future reference
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My WonderPlan HK Adventure"
                  value={saveData.title}
                  onChange={(e) => setSaveData({ ...saveData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="A memorable trip planned with WonderPlan HK..."
                  value={saveData.description}
                  onChange={(e) => setSaveData({ ...saveData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="flex items-center gap-2">
                  Make public
                  <span className="text-xs text-muted-foreground">(share with others)</span>
                </Label>
                <Switch
                  id="public"
                  checked={saveData.isPublic}
                  onCheckedChange={(checked) => setSaveData({ ...saveData, isPublic: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItinerary} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Itinerary'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab="signup"
        />
      </div>
    </div>
  );
};

export default Itinerary;