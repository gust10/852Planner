import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, Trash2, Eye, ArrowLeft, Share2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface SavedItinerary {
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchItineraries();
  }, [user, navigate]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading itineraries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setItineraries(itineraries.filter(it => it.id !== deleteId));
      toast({
        title: "Itinerary deleted",
        description: "The itinerary has been successfully removed.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleView = (itinerary: SavedItinerary) => {
    navigate('/itinerary', {
      state: {
        surveyData: itinerary.survey_data,
        selectedLandmarks: itinerary.selected_landmarks,
        savedItinerary: itinerary.generated_itinerary,
        itineraryId: itinerary.id
      }
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const handleShare = async (itinerary: SavedItinerary) => {
    const shareUrl = `${window.location.origin}/shared/${itinerary.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: `Check out this amazing Hong Kong itinerary: ${itinerary.title}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share or error occurred, fallback to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const getLandmarksCount = (landmarks: any[]) => {
    return landmarks.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Itineraries</h1>
              <p className="text-muted-foreground">Manage your saved WonderPlan HK adventures</p>
            </div>
          </div>
          <Button onClick={() => navigate('/')} className="neon-button px-8">
            Create New
          </Button>
        </div>

        {/* Itineraries Grid */}
        {itineraries.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🗺️</div>
              <h3 className="text-xl font-semibold">No itineraries yet</h3>
              <p className="text-muted-foreground">
                Start planning your Hong Kong adventure and save your personalized itineraries here.
              </p>
              <Button onClick={() => navigate('/')} className="neon-button">
                Create Your First Itinerary
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary) => (
              <Card key={itinerary.id} className="card-hover overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{itinerary.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {itinerary.description || `Explore ${getLandmarksCount(itinerary.selected_landmarks)} amazing locations in Hong Kong`}
                      </CardDescription>
                    </div>
                    {itinerary.is_public && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(itinerary.start_date), 'MMM dd')} - {format(new Date(itinerary.end_date), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {/* Duration & Landmarks */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getDuration(itinerary.start_date, itinerary.end_date)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleView(itinerary)} 
                      className={itinerary.is_public ? "flex-1" : "flex-1"}
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    {itinerary.is_public && (
                      <Button 
                        onClick={() => handleShare(itinerary)} 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    )}
                    <Button 
                      onClick={() => setDeleteId(itinerary.id)} 
                      variant="outline"
                      size="sm"
                      className={itinerary.is_public ? "flex-1" : "flex-1"}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
