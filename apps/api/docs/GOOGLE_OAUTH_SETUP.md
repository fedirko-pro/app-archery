# Google OAuth Setup

## Overview
This guide explains how to set up Google OAuth authentication for the Archery App.

## Prerequisites
- Google Cloud Console account
- Domain or localhost for development

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Archery App"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Add test users (your email addresses)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following URLs:

### Authorized JavaScript origins:
```
http://localhost:3001
http://localhost:3000
```

### Authorized redirect URIs:
```
http://localhost:3000/auth/google/callback
```

5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Environment Configuration

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_AUTH_URL=http://localhost:3000/auth/google
VITE_PORT=3001
```

## Step 5: Testing

1. Start the backend server: `npm run start:dev`
2. Start the frontend server: `npm run dev`
3. Go to `http://localhost:3001/signin`
4. Click "Sign in with Google"
5. Complete the OAuth flow

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Check that the redirect URI in Google Cloud Console matches exactly
   - Ensure no trailing slashes or extra characters

2. **"invalid_client" error**
   - Verify Client ID and Client Secret are correct
   - Check that the credentials are for a "Web application"

3. **"access_denied" error**
   - Make sure your email is added as a test user
   - Check that the OAuth consent screen is properly configured

4. **CORS errors**
   - Ensure CORS is properly configured in the backend
   - Check that frontend URL is in the allowed origins

### Debug Steps:

1. Check browser console for errors
2. Check backend logs for authentication flow
3. Verify environment variables are loaded correctly
4. Test the callback URL directly in browser

## Production Setup

For production, update the URLs:

### Google Cloud Console:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/auth/google/callback`

### Environment Variables:
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

## Security Notes

- Never commit Client Secret to version control
- Use environment variables for all sensitive data
- Regularly rotate Client Secret
- Monitor OAuth usage in Google Cloud Console 