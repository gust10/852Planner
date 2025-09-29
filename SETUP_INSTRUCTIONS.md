# Environment Variables Setup for 852Planner

## Required Environment Variables

Your edge functions need the following environment variables to be set in Supabase:

### 1. Google Cloud Platform Service Account (for AI generation)
- **Variable Name:** `GCP_SERVICE_ACCOUNT_KEY_BASE64`
- **Purpose:** Authenticates with Google Vertex AI for itinerary generation

### 2. Google Maps API Key
- **Variable Name:** `GOOGLE_MAPS_API_KEY`  
- **Purpose:** Fetches location images and provides map functionality

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **852Planner**
3. Navigate to **Settings** → **Edge Functions**
4. Add the following secrets:

```bash
# For Google Maps API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# For GCP Service Account (base64 encoded)
GCP_SERVICE_ACCOUNT_KEY_BASE64=your-base64-encoded-service-account-json
```

### Option 2: Using Supabase CLI

```bash
# Set Google Maps API Key
npx supabase secrets set GOOGLE_MAPS_API_KEY="your-google-maps-api-key-here" --project-ref ktmnbpighqfinfpbyizu

# Set GCP Service Account (base64 encoded)
npx supabase secrets set GCP_SERVICE_ACCOUNT_KEY_BASE64="your-base64-encoded-service-account-json" --project-ref ktmnbpighqfinfpbyizu
```

## Getting the Required Keys

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to **APIs & Services** → **Credentials**
5. Create an API Key
6. (Optional) Restrict the key to specific APIs and domains

### GCP Service Account for Vertex AI

1. In [Google Cloud Console](https://console.cloud.google.com)
2. Go to **IAM & Admin** → **Service Accounts**
3. Create a new service account with these roles:
   - Vertex AI User
   - Vertex AI Service Agent
4. Create and download a JSON key
5. Base64 encode it:

```bash
# On macOS/Linux
base64 -i path/to/your-service-account-key.json | tr -d '\n'

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path/to/your-service-account-key.json"))
```

## Temporary Solution (For Testing)

If you don't have these API keys yet, you can temporarily modify the edge functions to return mock data:

1. The AI function can return a static itinerary
2. The fetch-images function can skip image fetching
3. The google-maps-key function can return a placeholder

## Verify Setup

After setting the environment variables:

1. Wait 1-2 minutes for changes to propagate
2. Test by creating a new itinerary in your app
3. Check edge function logs in Supabase dashboard if issues persist

## Need Help?

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
