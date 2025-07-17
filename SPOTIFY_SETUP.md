# Spotify Setup Guide

This guide will help you set up Spotify integration for your Personal Portal. **Note: This is completely optional** - the app works perfectly without Spotify and will show demo tracks instead.

## Why This Changed

Spotify no longer allows `localhost` redirect URIs for security reasons. You now need a deployed website with HTTPS to use Spotify integration.

## Prerequisites

- A Spotify account (Free or Premium)
- A deployed website with HTTPS (GitHub Pages, Netlify, Vercel, etc.)

## Step-by-Step Setup

### 1. Deploy Your Website First

Deploy your website to any HTTPS hosting service:
- **GitHub Pages**: `https://yourusername.github.io/personal-portal`
- **Netlify**: `https://your-app-name.netlify.app`
- **Vercel**: `https://your-app-name.vercel.app`

### 2. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Click "Create an App"
3. Fill in the app details:
   - **App Name**: Personal Portal
   - **App Description**: Personal music tracker
   - **Redirect URI**: Your deployed URL (e.g., `https://yourusername.github.io/personal-portal`)
4. Save and note your **Client ID** and **Client Secret**

### 3. Generate Refresh Token

1. **Create Authorization URL**
   
   Replace `YOUR_CLIENT_ID` and `YOUR_DEPLOYED_URL` in this URL:
   ```
   https://accounts.spotify.com/en/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_DEPLOYED_URL&scope=user-read-currently-playing+user-read-recently-played
   ```

2. **Get Authorization Code**
   - Visit the URL above in your browser
   - Log in and authorize the app
   - You'll be redirected to your deployed site with a code in the URL
   - Copy the code from the URL parameter

3. **Create Base64 Credentials**
   - Go to [base64encode.org](https://www.base64encode.org/)
   - Encode this string: `YOUR_CLIENT_ID:YOUR_CLIENT_SECRET`
   - Copy the base64 result

4. **Get Refresh Token**
   
   Run this curl command (replace all placeholders):
   ```bash
   curl -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS" \
   -d grant_type=authorization_code \
   -d code=YOUR_AUTHORIZATION_CODE \
   -d redirect_uri=YOUR_DEPLOYED_URL \
   https://accounts.spotify.com/api/token
   ```

5. **Save the Refresh Token**
   - Copy the `refresh_token` from the JSON response
   - This token doesn't expire and is what you'll use in your app

### 4. Set Environment Variables

Create a `.env` file in your project root:

```env
# Spotify API Configuration (OPTIONAL)
# The app works perfectly without these - it will show demo tracks instead

VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
```

### 5. Test Your Setup

1. Restart your development server: `npm run dev`
2. The Spotify ticker should now show your actual listening data
3. If you see "Spotify not configured" message, check your environment variables

## Alternative Methods

### Method 1: Using ngrok (Local Development)

For local development, you can use ngrok to create a temporary HTTPS tunnel:

1. Install ngrok: `npm install -g ngrok`
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the provided HTTPS URL as your redirect URI
5. Follow the same steps as above

### Method 2: Temporary Redirect Page

If you don't have a hosted site yet:

1. Create a simple HTML page and host it on GitHub Pages
2. Use that URL as your redirect URI
3. Follow the same authorization flow

## Troubleshooting

### Common Issues

**"Spotify not configured"**
- Check that all environment variables are set in your `.env` file
- Ensure variable names start with `VITE_`
- Restart your development server after adding variables

**"Failed to load Spotify data"**
- Check that your refresh token is valid
- Ensure your Spotify app has the correct scopes
- Verify your client ID and secret are correct

**"CORS errors"**
- Ensure your redirect URI in Spotify app settings matches exactly
- Make sure you're using HTTPS for your redirect URI

**"Invalid redirect URI"**
- Spotify no longer supports localhost redirect URIs
- Use a deployed HTTPS URL instead

### Testing Your Setup

You can test your environment variables by checking the browser console:
- If you see "Spotify credentials not configured", check your `.env` file
- If you see API errors, verify your refresh token is valid

## Status Messages

The app will show different messages based on your setup:

- **"Spotify not configured - Showing demo tracks"**: No environment variables set
- **"Showing demo tracks - Configure Spotify for live data"**: Credentials set but no data available
- **"Failed to load Spotify data - Showing demo tracks"**: API error occurred

## Security Notes

- Never commit your `.env` file to version control
- The refresh token doesn't expire but can be revoked
- Client credentials should be kept secure
- Consider using environment variables in your hosting platform for production

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your Spotify app has the correct redirect URI
4. Try regenerating your refresh token

Remember: **Spotify integration is completely optional**. The app works great without it and will show demo tracks instead! 