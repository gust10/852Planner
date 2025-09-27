import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { VertexAI } from "npm:@google-cloud/aiplatform";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Get Service Account Credentials ---
    const serviceAccountJson = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY_BASE64');
    if (!serviceAccountJson) {
      throw new Error('GCP_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set');
    }
    const serviceAccount = JSON.parse(atob(serviceAccountJson));

    // --- Initialize Vertex AI ---
    const project = serviceAccount.project_id;
    const location = 'us-central1'; // Or your preferred GCP location
    const aiplatform = new VertexAI({
      project: project,
      location: location,
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      }
    });
    const generativeModel = aiplatform.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
    });

    // --- Get user input ---
    const { selectedLandmarks, surveyData } = await req.json();
    if (!selectedLandmarks || selectedLandmarks.length === 0) {
      throw new Error('No landmarks selected');
    }

    // --- Create a detailed prompt for AI itinerary generation ---
    const landmarkNames = selectedLandmarks.map((l: any) => l.name).join(', ');
    const travelStyle = surveyData?.travelStyle || 'balanced';
    const companions = surveyData?.companions || 'solo';
    
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

    const systemInstruction = {
      role: "system",
      parts: [{
        text: `You are an expert itinerary generator for Hong Kong tourism. 
        You will be given user preferences and must generate a detailed itinerary that meets those preferences. 
        Format the itinerary in valid JSON.
        Ensure all activities and dining options are suitable for the specified time frame. 
        For dining, include specific restaurant names, their addresses, and a brief description of the cuisine or specialty. 
        Provide accurate transportation methods (e.g., MTR, bus, taxi) with estimated travel times between locations. 
        All attractions and restaurants must be operational and accessible during the specified times. 
        Do not include returning to accommodation. 
        Must include lunch and dinner. Dessert is optional.
        Use your internal tools to find accurate longitude and latitude for each location.

        The JSON output format MUST be:
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
                  "coordinates": { "lat": 22.3193, "lng": 114.1694 }
                }
              ]
            }
          ],
          "overallTips": ["Brief practical tips (max 10 words each)"]
        }`
      }]
    };

    const userPrompt = {
      role: "user",
      parts: [{
        text: `
          Duration: ${days} days
          Travel Style: ${travelStyle}
          Companions: ${companions}
          Daily Time Frame: ${startTime}:00 AM to ${startTime + dailyHours}:00 PM
          Must-visit attractions: ${landmarkNames}
          Dining preferences: Include specific restaurants for lunch and dinner.
        `
      }]
    };

    // --- Call Vertex AI API ---
    const result = await generativeModel.generateContent({
      contents: [userPrompt],
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const itineraryContent = response.candidates[0].content.parts[0].text;

    // --- Try to parse as JSON, fallback to text if needed ---
    let parsedItinerary;
    try {
      parsedItinerary = JSON.parse(itineraryContent);
    } catch (parseError) {
      console.log('Failed to parse JSON from AI response, using fallback structure.', parseError);
      parsedItinerary = {
        // ... (fallback logic remains the same)
      };
    }

    return new Response(
      JSON.stringify({ success: true, itinerary: parsedItinerary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});