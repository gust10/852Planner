# Manual Environment Variable Setup

If you prefer to set the environment variables manually, run these commands one by one:

## 1. Set Service Account Key
```bash
supabase secrets set GCP_SERVICE_ACCOUNT_KEY_BASE64="YOUR_BASE64_SERVICE_ACCOUNT_KEY_HERE"
```

## 2. Set Project ID
```bash
supabase secrets set GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID_HERE"
```

## 3. Set Location (Optional)
```bash
supabase secrets set GCP_LOCATION="us-central1"
```

## Verify Your Settings
```bash
supabase secrets list
```

## Deploy the Function
After setting the environment variables, deploy your function:
```bash
supabase functions deploy ai
```
