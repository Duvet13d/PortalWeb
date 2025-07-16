import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getTracksForTicker } from '../utils/spotify'

const SpotifyTicker = ({ className = '' }) => {
  const [isPaused, setIsPaused] = useState(false)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data as fallback
  const mockTracks = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 3, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 5, title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 6, title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 7, title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", album: "MONTERO", image: "/api/placeholder/80/80", isCurrent: false },
    { id: 8, title: "Shivers", artist: "Ed Sheeran", album: "= (Equals)", image: "/api/placeholder/80/80", isCurrent: false },
  ]

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        const spotifyTracks = await getTracksForTicker()
        
        if (spotifyTracks.length > 0) {
          setTracks(spotifyTracks)
        } else {
          setTracks(mockTracks)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching Spotify tracks:', err)
        setTracks(mockTracks)
        setError('Failed to load Spotify data')
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
    
    // Refresh tracks every 30 seconds
    const interval = setInterval(fetchTracks, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Duplicate the tracks for seamless loop
  const duplicatedTracks = [...tracks, ...tracks]

  if (loading) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-white/60">Loading Spotify data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {error && (
        <div className="text-center text-yellow-400 text-sm mb-4">
          {error} - Showing sample tracks
        </div>
      )}
      
      <motion.div
        className="flex gap-8"
        animate={{ x: isPaused ? 0 : '-50%' }}
        transition={{
          duration: 30,
          ease: 'linear',
          repeat: isPaused ? 0 : Infinity,
        }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
      >
        {duplicatedTracks.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className={`flex-shrink-0 flex items-center gap-4 rounded-lg p-4 min-w-[320px] backdrop-blur-sm transition-all duration-300 ${
              track.isCurrent 
                ? 'bg-accent-1/20 border border-accent-1/30' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="w-16 h-16 bg-accent-1/20 rounded-md flex items-center justify-center overflow-hidden">
              {track.image !== '/api/placeholder/80/80' ? (
                <img 
                  src={track.image} 
                  alt={track.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-white/60"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm truncate">
                  {track.title}
                </h3>
                {track.isCurrent && (
                  <span className="text-accent-1 text-xs">● NOW PLAYING</span>
                )}
              </div>
              
              <p className="text-gray-400 text-xs truncate">
                {track.artist}
              </p>
              
              <p className="text-gray-500 text-xs truncate">
                {track.album}
              </p>
            </div>
            
            {track.url && (
              <a 
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-1 hover:text-accent-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </a>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default SpotifyTicker 