# Spotify Widget Setup

The Spotify widget displays your currently playing music and recently played tracks. Follow these steps to set up your Spotify integration:

## Getting Spotify API Credentials

1. Go to [Spotify for Developers](https://developer.spotify.com/) and log in with your Spotify account
2. Click "Create an App" and fill in the required information:
   - App name: "Personal Homepage" (or any name you prefer)
   - App description: "Personal browser homepage with music integration"
   - Website: Your homepage URL (optional)
   - Redirect URI: `http://localhost:3000` (for development)
3. After creating the app, you'll get a **Client ID** and **Client Secret**
4. You'll also need to generate a **Refresh Token** (see below)

## Getting a Refresh Token

To get a refresh token, you'll need to go through Spotify's OAuth flow:

1. Replace `YOUR_CLIENT_ID` in this URL with your actual Client ID:
   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000&scope=user-read-currently-playing%20user-read-recently-played
   ```

2. Visit the URL in your browser and authorize the application
3. You'll be redirected to `http://localhost:3000/?code=AUTHORIZATION_CODE`
4. Copy the authorization code from the URL
5. Use a tool like Postman or curl to exchange the code for a refresh token:

   ```bash
   curl -H "Authorization: Basic BASE64_ENCODED_CLIENT_ID_AND_SECRET" \
        -d grant_type=authorization_code \
        -d code=AUTHORIZATION_CODE \
        -d redirect_uri=http://localhost:3000 \
        https://accounts.spotify.com/api/token
   ```

   Where `BASE64_ENCODED_CLIENT_ID_AND_SECRET` is the base64 encoding of `client_id:client_secret`

6. The response will include a `refresh_token` - save this value

## Setting Up Your Environment Variables

1. Create a `.env` file in the root directory of the project (if it doesn't exist)
2. Add your Spotify credentials to the `.env` file:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REFRESH_TOKEN=your_refresh_token_here
```

3. Replace the placeholder values with your actual Spotify credentials
4. Restart the development server for the changes to take effect

## Using the Spotify Widget

The Spotify widget has the following features:

- **Currently Playing**: Shows the track you're currently listening to with album art, progress bar, and track info
- **Playback Controls**: Play/pause and skip controls (visual only - actual playback control requires additional API permissions)
- **Recently Played**: Expandable list of your recently played tracks
- **Settings**: Toggle album artwork and playback controls visibility
- **Auto-refresh**: Updates every 30 seconds to show current status

## Demo Mode

If no Spotify credentials are provided, the widget will run in demo mode with simulated music data. This is useful for development and testing purposes.

## Troubleshooting

- **"Spotify not configured" message**: Make sure all three environment variables are set correctly
- **"No Spotify data available"**: Check that you're currently playing music or have recently played tracks
- **API errors**: Ensure your refresh token is still valid (they can expire)
- **Development server issues**: Make sure to restart the dev server after adding environment variables

## Privacy Notes

- Your Spotify credentials are stored locally in your `.env` file
- The widget only accesses your currently playing and recently played tracks
- No personal data is transmitted to external servers (except Spotify's API)
- You can revoke access anytime from your Spotify account settings

## Required Spotify Scopes

The widget requires these Spotify API scopes:
- `user-read-currently-playing`: To show what you're currently listening to
- `user-read-recently-played`: To show your recently played tracks