# Vertex AI Setup for Edge Function

## Required Environment Variables

To use the Vertex AI edge function, you need to set up the following environment variables in your Supabase project:

### 1. GCP_SERVICE_ACCOUNT_KEY_BASE64
This is your Google Cloud service account key encoded in base64.

**Steps to get this:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Create a new service account or use an existing one
4. Grant the following roles:
   - Vertex AI User
   - AI Platform Developer (if using legacy AI Platform)
5. Create a JSON key for the service account
6. Convert the JSON key to base64:
   ```bash
   base64 -i /path/to/your/service-account-key.json
   ```
7. Copy the base64 string and set it as the environment variable

### 2. GCP_PROJECT_ID
Your Google Cloud Project ID where Vertex AI is enabled.

**Example:** `my-project-123456`

### 3. GCP_LOCATION (Optional)
The Google Cloud region where you want to run Vertex AI.

**Default:** `us-central1`
**Other options:** `us-east1`, `europe-west1`, `asia-southeast1`, etc.

## Setting Environment Variables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Settings > Edge Functions
3. Add the environment variables:
   - `GCP_SERVICE_ACCOUNT_KEY_BASE64`: Your base64-encoded service account key
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_LOCATION`: Your preferred region (optional)

## Enable Vertex AI API

Make sure Vertex AI API is enabled in your Google Cloud project:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Library
3. Search for "Vertex AI API"
4. Click "Enable"

## Testing the Function

After setting up the environment variables, deploy your edge function and test it with a sample request:

```bash
supabase functions deploy ai
```

The function expects a POST request with the following structure:
```json
{
  "selectedLandmarks": [
    {"name": "Victoria Peak"},
    {"name": "Tsim Sha Tsui"}
  ],
  "surveyData": {
    "travelStyle": "balanced",
    "companions": "solo",
    "startDate": "2024-01-01",
    "endDate": "2024-01-03",
    "startTime": 9,
    "dailyHours": 8
  }
}
```

## Troubleshooting

### Common Issues:
1. **Authentication Error**: Make sure your service account has the correct permissions
2. **Project Not Found**: Verify your GCP_PROJECT_ID is correct
3. **Region Error**: Check if Vertex AI is available in your selected region
4. **Base64 Encoding**: Ensure the service account key is properly base64 encoded

### Checking Logs:
Use Supabase dashboard to check edge function logs for detailed error messages.
