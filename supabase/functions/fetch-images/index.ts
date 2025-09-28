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
          let correctCoordinates = null;
          
          // Always use text search to find the most accurate location by name
          // This ensures we get coordinates from Google Places API rather than using any existing coordinates
          const query = `${activity.title} Hong Kong`;
          const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
          
          console.log(`Text searching for: ${query}`);
          
          const textResponse = await fetch(textSearchUrl);
          const textData = await textResponse.json();
          
          if (textData.results && textData.results.length > 0) {
            const place = textData.results[0];
            // Get coordinates from Google Places
            if (place.geometry && place.geometry.location) {
              correctCoordinates = {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              };
              console.log(`Found coordinates for ${activity.title}: ${correctCoordinates.lat}, ${correctCoordinates.lng}`);
            }
            if (place.photos && place.photos.length > 0) {
              const photoReference = place.photos[0].photo_reference;
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
              console.log(`Found photo for ${activity.title}`);
            }
          }
          
          return {
            ...activity,
            imageUrl: photoUrl,
            coordinates: correctCoordinates // Include the coordinates from Google Places API
          };
          
        } catch (error) {
          console.error(`Error fetching image for ${activity.title}:`, error);
          return {
            ...activity,
            imageUrl: null,
            coordinates: null
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