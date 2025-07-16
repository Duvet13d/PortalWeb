import { motion } from 'framer-motion'
import { useState } from 'react'

const SpotifyTicker = ({ className = '' }) => {
  const [isPaused, setIsPaused] = useState(false)

  // Mock Spotify data - in a real implementation, this would come from the Spotify API
  const mockTracks = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", image: "/api/placeholder/80/80" },
    { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", image: "/api/placeholder/80/80" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", image: "/api/placeholder/80/80" },
    { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", image: "/api/placeholder/80/80" },
    { id: 5, title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3", image: "/api/placeholder/80/80" },
    { id: 6, title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", image: "/api/placeholder/80/80" },
    { id: 7, title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", album: "MONTERO", image: "/api/placeholder/80/80" },
    { id: 8, title: "Shivers", artist: "Ed Sheeran", album: "= (Equals)", image: "/api/placeholder/80/80" },
  ]

  // Duplicate the tracks for seamless loop
  const duplicatedTracks = [...mockTracks, ...mockTracks]

  return (
    <div className={`overflow-hidden ${className}`}>
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
            className="flex-shrink-0 flex items-center gap-4 bg-white bg-opacity-5 rounded-lg p-4 min-w-[300px] backdrop-blur-sm"
          >
            <div className="w-16 h-16 bg-accent-1 rounded-md flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm truncate">
                {track.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {track.artist}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {track.album}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default SpotifyTicker 