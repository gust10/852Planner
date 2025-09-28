import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Helper function to convert PEM to DER format
function pemToDer(pem: string): Uint8Array {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  
  // Convert base64 to binary
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to get access token from service account
async function getAccessToken(serviceAccountKey: string): Promise<string> {
  const serviceAccount = JSON.parse(atob(serviceAccountKey));
  
  // Create JWT for Google OAuth
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: serviceAccount.private_key_id
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  
  // Process the private key - replace escaped newlines and convert to proper format
  let privateKeyPem = serviceAccount.private_key.replace(/\\n/g, '\n');
  
  // Ensure proper PEM format
  if (!privateKeyPem.includes("-----BEGIN PRIVATE KEY-----")) {
    privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyPem}\n-----END PRIVATE KEY-----`;
  }
  
  // Convert PEM to DER format
  const privateKeyDer = pemToDer(privateKeyPem);
  
  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  
  // Create JWT
  const headerB64 = btoa(JSON.stringify(header)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
  
  const jwt = `${signatureInput}.${signatureB64}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  
  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  
  return tokenData.access_token;
}

// Helper function to repair common JSON issues
function repairJSON(jsonString: string): string {
  let repaired = jsonString.trim();
  
  // Remove any trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Try to find and fix unterminated strings
  const lines = repaired.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count quotes in the line (excluding escaped quotes)
    let quoteCount = 0;
    let escaped = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      if (line[j] === '"' && !escaped) {
        quoteCount++;
      }
      escaped = false;
    }
    
    // If odd number of quotes, the string is unterminated
    if (quoteCount % 2 === 1) {
      // Try to close the string at the end of the line
      lines[i] = line + '"';
    }
  }
  
  repaired = lines.join('\n');
  
  // Ensure proper closing of the main object
  if (!repaired.trim().endsWith('}')) {
    // Find the last opening brace and try to close properly
    let braceCount = 0;
    let lastValidPos = -1;
    
    for (let i = 0; i < repaired.length; i++) {
      if (repaired[i] === '{') {
        braceCount++;
      } else if (repaired[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastValidPos = i;
        }
      }
    }
    
    if (lastValidPos > 0) {
      repaired = repaired.substring(0, lastValidPos + 1);
    } else {
      // Add missing closing braces
      while (braceCount > 0) {
        repaired += '}';
        braceCount--;
      }
    }
  }
  
  return repaired;
}

// Aggressive JSON repair for severely malformed JSON
function aggressiveJSONRepair(jsonString: string): string {
  let content = jsonString.trim();
  
  // Remove markdown code blocks
  content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  
  // Find the main JSON object boundaries
  const startIndex = content.indexOf('{');
  if (startIndex === -1) {
    throw new Error('No JSON object found');
  }
  
  // Find the last complete JSON structure
  let braceCount = 0;
  let lastValidIndex = -1;
  let inString = false;
  let escaped = false;
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastValidIndex = i;
          break; // Found complete object
        }
      }
    }
  }
  
  if (lastValidIndex > startIndex) {
    return content.substring(startIndex, lastValidIndex + 1);
  }
  
  // If no complete object found, try to construct one from available data
  throw new Error('Could not repair JSON structure');
}

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // --- Get Service Account Key from Environment ---
    const serviceAccountKey = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY_BASE64');
    const projectId = Deno.env.get('GCP_PROJECT_ID');
    const location = Deno.env.get('GCP_LOCATION') || 'us-central1';
    
    if (!serviceAccountKey || !projectId) {
      throw new Error('Missing required environment variables: GCP_SERVICE_ACCOUNT_KEY_BASE64 and GCP_PROJECT_ID');
    }
    
    // --- Get Access Token ---
    const accessToken = await getAccessToken(serviceAccountKey);
    
    // --- Get user input ---
    const { selectedLandmarks, surveyData } = await req.json();
    if (!selectedLandmarks || selectedLandmarks.length === 0) {
      throw new Error('No landmarks selected');
    }
    
    // --- Create a detailed prompt for AI itinerary generation ---
    
    // Define all available landmarks with full details
    const allLandmarks = [
      {
        id: "disneyland",
        name: "Hong Kong Disneyland",
        category: "Family",
        rating: 4.5,
        duration: "Full Day",
        description: "Magical kingdom with thrilling rides and Disney characters",
        tags: ["family", "entertainment"]
      },
      {
        id: "victoria-peak",
        name: "Victoria Peak",
        category: "Views",
        rating: 4.8,
        duration: "3-4 hours",
        description: "Stunning panoramic views of Hong Kong skyline",
        tags: ["city", "nature", "views"]
      },
      {
        id: "victoria-harbour",
        name: "Victoria Harbour",
        category: "Waterfront",
        rating: 4.7,
        duration: "2-3 hours",
        description: "Iconic harbour with Symphony of Lights show",
        tags: ["city", "cultural", "nightlife"]
      },
      {
        id: "ocean-park",
        name: "Ocean Park",
        category: "Theme Park",
        rating: 4.4,
        duration: "Full Day",
        description: "Marine life theme park with exciting rides",
        tags: ["family", "nature", "entertainment"]
      },
      {
        id: "avenue-of-stars",
        name: "Avenue of Stars",
        category: "Cultural",
        rating: 4.2,
        duration: "1-2 hours",
        description: "Waterfront promenade celebrating Hong Kong cinema",
        tags: ["cultural", "city", "views"]
      },
      {
        id: "dragons-back",
        name: "Dragon's Back Trail",
        category: "Hiking",
        rating: 4.6,
        duration: "4-5 hours",
        description: "Spectacular hiking trail with coastal views",
        tags: ["hiking", "nature", "adventure"]
      },
      {
        id: "m-plus-museum",
        name: "M+ Museum",
        category: "Museum",
        rating: 4.3,
        duration: "2-3 hours",
        description: "Contemporary visual culture museum",
        tags: ["museums", "cultural", "art"]
      },
      {
        id: "temple-street-night-market",
        name: "Temple Street Night Market",
        category: "Shopping",
        rating: 4.1,
        duration: "2-3 hours",
        description: "Bustling night market for food and shopping",
        tags: ["shopping", "foodie", "nightlife"]
      }
    ];
    
    // Map selected landmark IDs to full landmark objects
    const selectedLandmarkObjects = selectedLandmarks
      .map((landmarkId: string) => allLandmarks.find(landmark => landmark.id === landmarkId))
      .filter(Boolean); // Remove any undefined results
    
    const landmarkNames = selectedLandmarkObjects.map((l: any) => l.name).join(', ');
    
    // Create detailed landmark information for the AI
    const landmarkDetails = selectedLandmarkObjects.map((landmark: any) => {
      return `${landmark.name} (${landmark.category}, ${landmark.duration}, Rating: ${landmark.rating}/5) - ${landmark.description}`;
    }).join('\n          ');
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
    
    // Extract budget and cuisine preferences
    const totalBudget = surveyData?.totalBudget || 0;
    const dailyBudget = totalBudget > 0 ? Math.round(totalBudget / days) : 0;
    const cuisinePreferences = surveyData?.foodPreferences?.cuisinePreferences || [];
    const styles = surveyData?.styles || [];
    
    const systemInstruction = `Generate a Hong Kong itinerary in valid JSON format. Include lunch and dinner for each day. Keep descriptions concise.

IMPORTANT REQUIREMENTS:
- MUST include ALL selected landmarks in the itinerary - these are the user's top priorities
- Respect the user's budget constraints if provided
- Match cuisine preferences for restaurant recommendations
- Include specific restaurant names WITH EXACT BRANCH LOCATIONS (e.g., "Tim Ho Wan - Central Station", "Maxim's Palace - City Hall", "Kam Wah Cafe - Mong Kok Branch")
- Always specify the district/area for restaurants (e.g., Central, Tsim Sha Tsui, Causeway Bay, Mong Kok)
- For chain restaurants, MUST include the specific branch name or location identifier
- Provide realistic cost estimates in HK$ and USD
- Consider travel interests when planning activities
- Use the provided landmark details (duration, category, description) to plan realistic timing

REQUIRED JSON FORMAT:
{
  "days": [
    {
      "day": 1,
      "theme": "Brief theme",
      "activities": [
        {
          "time": "9:00 AM",
          "duration": "2 hours",
          "title": "Activity Name",
          "description": "Brief description",
          "transportation": "MTR/Taxi/Walk",
          "cost": "HK$50-200 ($7-26 USD)"
        },
        {
          "time": "12:00 PM",
          "duration": "1 hour",
          "title": "Tim Ho Wan - Central Station Branch",
          "description": "Michelin-starred dim sum at the Central Station location",
          "transportation": "MTR",
          "cost": "HK$80-150 ($10-19 USD)"
        }
      ]
    }
  ],
  "overallTips": ["Tip 1", "Tip 2", "Tip 3"]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;
    
    const userPrompt = `
          Duration: ${days} days
          Travel Style: ${travelStyle}
          Companions: ${companions}
          Daily Time Frame: ${startTime}:00 AM to ${startTime + dailyHours}:00 PM
          
          SELECTED LANDMARKS (MUST ALL BE INCLUDED):
          ${landmarkDetails}
          
          ${totalBudget > 0 ? `Total Budget: $${totalBudget} USD (Daily Budget: $${dailyBudget} USD)` : 'Budget: Flexible'}
          ${cuisinePreferences.length > 0 ? `Cuisine Preferences: ${cuisinePreferences.join(', ')}` : ''}
          ${styles.length > 0 ? `Travel Interests: ${styles.join(', ')}` : ''}
          
          CRITICAL: Every single landmark listed above MUST appear in the itinerary. Use their provided durations and descriptions to plan realistic schedules.
          Dining preferences: Include specific restaurants for lunch and dinner${cuisinePreferences.length > 0 ? ` that match the cuisine preferences` : ''}.
          ${dailyBudget > 0 ? `Keep all activities and dining within the daily budget of $${dailyBudget} USD.` : ''}
        `;
    
    // --- Call Vertex AI API using REST ---
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.5-pro:generateContent`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemInstruction}\n\nUser Request: ${userPrompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const itineraryContent = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    console.log('Raw AI response length:', itineraryContent.length);
    console.log('Raw AI response preview:', itineraryContent.substring(0, 500));
    
    // --- Try to parse as JSON with advanced error handling ---
    let parsedItinerary;
    try {
      // First, try to clean up common JSON issues
      let cleanedContent = itineraryContent.trim();
      
      // Remove any markdown code block markers if present
      cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Advanced JSON repair for unterminated strings and truncated content
      cleanedContent = repairJSON(cleanedContent);
      
      parsedItinerary = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (!parsedItinerary.days || !Array.isArray(parsedItinerary.days)) {
        throw new Error('Invalid itinerary structure: missing or invalid days array');
      }
      
    } catch (parseError) {
      console.log('Failed to parse JSON from AI response:', parseError.message);
      console.log('Problematic content around error position:', 
        itineraryContent.substring(Math.max(0, 7643 - 200), 7643 + 200));
      
      // Try one more aggressive repair attempt
      try {
        const repairedContent = aggressiveJSONRepair(itineraryContent);
        parsedItinerary = JSON.parse(repairedContent);
        console.log('Successfully repaired JSON with aggressive method');
      } catch (secondError) {
        console.log('Aggressive repair also failed, using fallback structure');
        
        // Create a fallback structure
        parsedItinerary = {
          days: [
            {
              day: 1,
              theme: "Hong Kong Highlights",
              activities: [
                {
                  time: "9:00 AM",
                  duration: "2 hours",
                  title: "Victoria Peak",
                  description: "Iconic Hong Kong skyline views",
                  transportation: "Peak Tram",
                  cost: "HK$65",
                  coordinates: { lat: 22.2708, lng: 114.1501 }
                },
                {
                  time: "2:00 PM", 
                  duration: "2 hours",
                  title: "Tsim Sha Tsui Promenade",
                  description: "Waterfront views and shopping",
                  transportation: "MTR",
                  cost: "Free",
                  coordinates: { lat: 22.2944, lng: 114.1722 }
                }
              ]
            }
          ],
          overallTips: [
            "Use Octopus Card for transportation",
            "Try local dim sum restaurants",
            "Check weather before outdoor activities"
          ]
        };
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      itinerary: parsedItinerary
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('AI function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
