import axios from 'axios'

const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const refresh_token = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=10'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

// Check if Spotify credentials are available
const hasSpotifyCredentials = () => {
  return client_id && client_secret && refresh_token
}

// Function to get access token using refresh token
const getAccessToken = async () => {
  if (!hasSpotifyCredentials()) {
    throw new Error('Spotify credentials not configured')
  }

  const basic = btoa(`${client_id}:${client_secret}`)
  
  try {
    const response = await axios.post(TOKEN_ENDPOINT, 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }), {
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    
    return response.data.access_token
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('Invalid Spotify credentials or refresh token expired')
    }
    throw error
  }
}

// Function to get currently playing track
export const getCurrentlyPlaying = async () => {
  if (!hasSpotifyCredentials()) {
    console.info('Spotify credentials not configured, using fallback')
    return null
  }

  try {
    const access_token = await getAccessToken()
    
    const response = await axios.get(NOW_PLAYING_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    
    if (response.status === 204 || !response.data) {
      return null
    }
    
    const { item, is_playing, progress_ms } = response.data
    
    return {
      id: item.id,
      title: item.name,
      artist: item.artists.map(artist => artist.name).join(', '),
      album: item.album.name,
      image: item.album.images[0]?.url || '/api/placeholder/80/80',
      isPlaying: is_playing,
      progress: progress_ms,
      duration: item.duration_ms,
      url: item.external_urls.spotify
    }
  } catch (error) {
    console.error('Error fetching currently playing:', error)
    return null
  }
}

// Function to get recently played tracks
export const getRecentlyPlayed = async () => {
  if (!hasSpotifyCredentials()) {
    console.info('Spotify credentials not configured, using fallback')
    return []
  }

  try {
    const access_token = await getAccessToken()
    
    const response = await axios.get(RECENTLY_PLAYED_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    
    return response.data.items.map(item => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(', '),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || '/api/placeholder/80/80',
      playedAt: item.played_at,
      url: item.track.external_urls.spotify
    }))
  } catch (error) {
    console.error('Error fetching recently played:', error)
    return []
  }
}

// Function to get tracks for ticker (combines current and recent)
export const getTracksForTicker = async () => {
  if (!hasSpotifyCredentials()) {
    console.info('Spotify credentials not configured, using mock data')
    return []
  }

  try {
    const currentTrack = await getCurrentlyPlaying()
    const recentTracks = await getRecentlyPlayed()
    
    let tracks = []
    
    if (currentTrack) {
      tracks.push({
        ...currentTrack,
        isCurrent: true
      })
    }
    
    // Add recent tracks, filtering out the current track if it's in the recent list
    const filteredRecent = recentTracks.filter(track => 
      !currentTrack || track.id !== currentTrack.id
    )
    
    tracks.push(...filteredRecent.slice(0, 7).map(track => ({
      ...track,
      isCurrent: false
    })))
    
    return tracks
  } catch (error) {
    console.error('Error fetching tracks for ticker:', error)
    return []
  }
}

// Export function to check if Spotify is configured
export const isSpotifyConfigured = hasSpotifyCredentials 