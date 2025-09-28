import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, ArrowLeft, Sparkles, ExternalLink, DollarSign } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import Map from '@/components/Map';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface SharedItinerary {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
  survey_data: any;
  selected_landmarks: any[];
  generated_itinerary: any;
  is_public: boolean;
}

const SharedItinerary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchSharedItinerary(id);
    }
  }, [id]);

  const fetchSharedItinerary = async (itineraryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', itineraryId)
        .eq('is_public', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('This itinerary is not available or has been made private.');
        } else {
          throw error;
        }
        return;
      }

      setItinerary(data);
    } catch (error: any) {
      console.error('Error fetching shared itinerary:', error);
      setError('Failed to load the shared itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const getNavigationUrl = (currentActivity: any, previousActivity?: any) => {
    if (currentActivity.coordinates) {
      const { lat, lng } = currentActivity.coordinates;

      if (previousActivity?.coordinates) {
        const originLat = previousActivity.coordinates.lat;
        const originLng = previousActivity.coordinates.lng;
        return `https://www.google.com/maps/dir/${originLat},${originLng}/${lat},${lng}`;
      } else {
        return `https://www.google.com/maps/dir//${lat},${lng}`;
      }
    } else {
      const query = encodeURIComponent(currentActivity.title + " Hong Kong");
      return `https://www.google.com/maps/search/${query}`;
    }
  };

  // Parse and categorize expenses from itinerary
  const getExpenseData = () => {
    if (!itinerary?.generated_itinerary?.days) return [];

    const expenseCategories: { [key: string]: number } = {};
    const numberOfPeople = itinerary.survey_data?.totalPeople || 1;

    itinerary.generated_itinerary.days.forEach((day: any) => {
      day.activities?.forEach((activity: any) => {
        if (activity.cost) {
          const costMatch = activity.cost.match(/HK\$(\d+)-(\d+)/);
          if (costMatch) {
            const minCost = parseInt(costMatch[1]);
            const maxCost = parseInt(costMatch[2]);
            const avgCost = Math.round((minCost + maxCost) / 2);
            const totalCost = avgCost * numberOfPeople;

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
          }
        }
      });
    });

    return Object.entries(expenseCategories).map(([category, amount]) => ({
      category,
      amount,
      percentage: 0
    })).map(item => {
      const total = Object.values(expenseCategories).reduce((sum, amt) => sum + amt, 0);
      return {
        ...item,
        percentage: Math.round((item.amount / total) * 100)
      };
    });
  };

  const expenseData = getExpenseData();
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const itineraryData = itinerary?.generated_itinerary?.days || [];
  const currentDayData = itineraryData[currentDay];

  const nextDay = () => {
    if (currentDay < itineraryData.length - 1) {
      setCurrentDay(prev => prev + 1);
    }
  };

  const prevDay = () => {
    if (currentDay > 0) {
      setCurrentDay(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero p-6">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {error || 'Itinerary not found'}
          </h2>
          <p className="text-muted-foreground mb-6">
            This shared itinerary may have been made private or deleted.
          </p>
          <Button onClick={() => navigate('/')} className="neon-button">
            Create Your Own Itinerary
          </Button>
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
              {itinerary.title}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Shared itinerary • {getDuration(itinerary.start_date, itinerary.end_date)}
          </p>
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
                    {itinerary.generated_itinerary?.days?.[currentDay]?.theme && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{itinerary.generated_itinerary.days[currentDay].theme}</p>
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
                              <MapPin className="w-3 h-3" />
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

                {itinerary.generated_itinerary?.overallTips && currentDay === 0 && (
                  <div className="mt-6 p-3 bg-gradient-subtle rounded-lg border border-border/30">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Travel Tips</h4>
                    <div className="space-y-1">
                      {itinerary.generated_itinerary.overallTips.slice(0, 3).map((tip: string, index: number) => (
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
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <div className="text-xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Day {currentDay + 1}
            </div>
            <div className="flex gap-1 mt-1 justify-center">
              {itineraryData.map((_, index) => (
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
            disabled={currentDay === itineraryData.length - 1}
            className="interactive-scale bg-background/80 backdrop-blur-sm border-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Button>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex gap-2 p-4 flex-shrink-0 bg-gradient-hero">
          <Button
            variant="outline"
            size="default"
            onClick={() => navigate('/')}
            className="flex-1 interactive-scale"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Your Own
          </Button>

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
                  Estimated costs for this itinerary
                  {itinerary.survey_data?.totalPeople > 1 && (
                    <span className="block text-xs mt-1">
                      Calculated for {itinerary.survey_data.totalPeople} people
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
                            const numberOfPeople = itinerary.survey_data?.totalPeople || 1;
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
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;
