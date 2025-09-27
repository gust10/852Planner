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
    const { selectedLandmarks, surveyData } = await req.json();

    if (!selectedLandmarks || selectedLandmarks.length === 0) {
      throw new Error('No landmarks selected');
    }

    // Create a detailed prompt for AI itinerary generation
    const landmarkNames = selectedLandmarks.map((l: any) => l.name).join(', ');
    const travelStyle = surveyData?.travelStyle || 'balanced';
    const companions = surveyData?.companions || 'solo';
    
    // Calculate days from date range
    let days = 3; // default fallback
    if (surveyData?.startDate && surveyData?.endDate) {
      const startDate = new Date(surveyData.startDate);
      const endDate = new Date(surveyData.endDate);
      days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    } else if (surveyData?.dateRange?.from && surveyData?.dateRange?.to) {
      const startDate = new Date(surveyData.dateRange.from);
      const endDate = new Date(surveyData.dateRange.to);
      days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    }
    
    const startTime = surveyData?.startTime || 9;
    const dailyHours = surveyData?.dailyHours || 8;

    const prompt = `Create a ${days}-day Hong Kong itinerary for ${companions} travelers with a ${travelStyle} travel style. 

MUST-VISIT ATTRACTIONS: ${landmarkNames}

REQUIREMENTS:
- Exactly ${days} days total
- Start daily activities at ${startTime}:00 AM  
- Plan for ${dailyHours} hours of activities per day
- Keep descriptions brief and focused
- Include practical timing and transportation
- IMPORTANT: Use Google Maps integration to get exact longitude and latitude coordinates for each activity location

Format as JSON:
{
  "days": [
    {
      "day": 1,
      "theme": "Brief day theme (max 4 words)",
      "activities": [
        {
          "time": "9:00 AM",
          "duration": "2 hours", 
          "title": "Activity Name",
          "description": "Brief description (max 20 words)",
          "transportation": "MTR/Taxi/Walk",
          "cost": "HK$50-200",
          "coordinates": {
            "lat": 22.3193,
            "lng": 114.1694
          }
        }
      ]
    }
  ],
  "overallTips": ["Brief practical tips (max 10 words each)"]
}

CRITICAL: Every activity MUST include accurate GPS coordinates using Google Maps data. Use your Google Maps integration to get precise latitude and longitude for each location in Hong Kong.`;

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
    }

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`Gemini API error: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    let itineraryContent = aiData.candidates[0].content.parts[0].text;

    // Try to parse as JSON, fallback to text if needed
    let parsedItinerary;
    try {
      // Clean up the response to extract JSON
      const jsonStart = itineraryContent.indexOf('{');
      const jsonEnd = itineraryContent.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = itineraryContent.slice(jsonStart, jsonEnd);
        parsedItinerary = JSON.parse(jsonString);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback structure');
      // Fallback: create structured data from text
      parsedItinerary = {
        days: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          theme: `Day ${i + 1} Adventures`,
          activities: selectedLandmarks.slice(i * Math.ceil(selectedLandmarks.length / days), (i + 1) * Math.ceil(selectedLandmarks.length / days)).map((landmark: any, j: number) => ({
            time: `${startTime + (j * 3)}:00 ${startTime + (j * 3) < 12 ? 'AM' : 'PM'}`,
            duration: landmark.duration || '2-3 hours',
            title: landmark.name,
            location: landmark.name,
            description: landmark.description,
            transportation: j === 0 ? 'Start here' : 'MTR or taxi (15-20 mins)',
            tips: `Best visited during ${travelStyle === 'relaxed' ? 'off-peak hours' : 'peak experience times'}`,
            cost: 'HK$100-300'
          }))
        })),
        overallTips: [
          'Book tickets online in advance for popular attractions',
          'Get an Octopus Card for easy transportation',
          'Try local dim sum for authentic Hong Kong experience'
        ],
        bestRoutes: [
          'Use MTR (subway) for fastest city travel',
          'Take Star Ferry for scenic harbor crossing',
          'Taxis are convenient but can be expensive during peak hours'
        ],
        rawContent: itineraryContent
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        itinerary: parsedItinerary 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('AI function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate itinerary' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});