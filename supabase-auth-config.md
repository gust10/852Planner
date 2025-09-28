# Disable Email Confirmation in Supabase

## Dashboard Method (Easiest)

1. Go to https://app.supabase.com
2. Select project: WonderPlan HK
3. Go to Authentication → Settings
4. Under "Email" section:
   - Turn OFF "Enable email confirmations"
   - Keep "Enable signups" ON
5. Save changes

## CLI Method (Alternative)

```bash
# If you have supabase CLI configured
npx supabase projects api-keys --project-ref ktmnbpighqfinfpbyizu

# Then update auth settings via API or dashboard
```

## Verification

After disabling email confirmation:
1. Users can sign up immediately
2. No email verification required
3. Account is active right after signup
4. Users can start saving itineraries immediately

## Current Frontend Changes Made

✅ Updated AuthContext.tsx:
- Changed signup success message
- Removed email verification reference
- Added profile update with delay for new users
- Better error handling for immediate signup
