import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activities } = await req.json();
    
    if (!activities || !Array.isArray(activities)) {
      return new Response(
        JSON.stringify({ error: 'Activities array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not found');
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Processing ${activities.length} activities for image fetching`);

    const activitiesWithImages = await Promise.all(
      activities.map(async (activity: any) => {
        try {
          let photoUrl = null;
          
          // First try to find place using coordinates if available
          if (activity.coordinates) {
            const { lat, lng } = activity.coordinates;
            const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&keyword=${encodeURIComponent(activity.title)}&key=${GOOGLE_MAPS_API_KEY}`;
            
            console.log(`Searching for place near coordinates: ${lat}, ${lng} with keyword: ${activity.title}`);
            
            const nearbyResponse = await fetch(nearbySearchUrl);
            const nearbyData = await nearbyResponse.json();
            
            if (nearbyData.results && nearbyData.results.length > 0) {
              const place = nearbyData.results[0];
              if (place.photos && place.photos.length > 0) {
                const photoReference = place.photos[0].photo_reference;
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
                console.log(`Found photo for ${activity.title} using coordinates`);
              }
            }
          }
          
          // If no photo found with coordinates, try text search
          if (!photoUrl) {
            const query = `${activity.title} Hong Kong`;
            const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
            
            console.log(`Text searching for: ${query}`);
            
            const textResponse = await fetch(textSearchUrl);
            const textData = await textResponse.json();
            
            if (textData.results && textData.results.length > 0) {
              const place = textData.results[0];
              if (place.photos && place.photos.length > 0) {
                const photoReference = place.photos[0].photo_reference;
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
                console.log(`Found photo for ${activity.title} using text search`);
              }
            }
          }
          
          return {
            ...activity,
            imageUrl: photoUrl
          };
          
        } catch (error) {
          console.error(`Error fetching image for ${activity.title}:`, error);
          return {
            ...activity,
            imageUrl: null
          };
        }
      })
    );

    console.log(`Successfully processed ${activitiesWithImages.length} activities`);
    
    return new Response(
      JSON.stringify({ success: true, activities: activitiesWithImages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-images function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch images', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});