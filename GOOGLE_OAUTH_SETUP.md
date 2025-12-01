# Google OAuth Setup Guide

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000` (optional)
   - Click "Create"

5. Copy your credentials:
   - Client ID
   - Client Secret

## Step 2: Update .env.local

Replace the values in `.env.local`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
NEXTAUTH_SECRET=generate-random-string-here
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Test Google Login

1. Start the server:
```bash
npm run dev
```

2. Visit http://localhost:3000/login

3. Click "Continue with Google"

4. Sign in with your Google account

5. You'll be redirected to `/dashboard`

## Current Setup

✅ Google OAuth configured
✅ User tab shows "Continue with Google" button
✅ Government tab still uses ID/password
✅ Auto-creates user in MongoDB on first login
✅ Session management with NextAuth

## Troubleshooting

**Error: redirect_uri_mismatch**
- Make sure you added `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs in Google Console

**Error: invalid_client**
- Check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local

**Session not persisting**
- Make sure NEXTAUTH_SECRET is set in .env.local

## Production Setup

For production, add your production URL to Google Console:
- `https://yourdomain.com/api/auth/callback/google`

And update .env.production:
```env
NEXTAUTH_URL=https://yourdomain.com
```
