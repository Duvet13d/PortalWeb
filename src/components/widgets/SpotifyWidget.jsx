import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentlyPlaying, getRecentlyPlayed, isSpotifyConfigured } from '../../utils/spotify'

/**
 * Spotify Widget - Compact now-playing widget with playback controls and recently played
 */
const SpotifyWidget = ({ 
  title = "Spotify", 
  description = "Now playing and music controls",
  size = "medium",
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [recentTracks, setRecentTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showingDemo, setShowingDemo] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Settings
  const showControls = settings.showControls !== false
  const showAlbumArt = settings.showAlbumArt !== false

  // Demo data for fallback
  const demoCurrentTrack = {
    id: 'demo-1',
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    image: "/api/placeholder/80/80",
    isPlaying: true,
    progress: 120000,
    duration: 200000,
    url: null
  }

  const demoRecentTracks = [
    { id: 'demo-2', title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", image: "/api/placeholder/80/80" },
    { id: 'demo-3', title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", image: "/api/placeholder/80/80" },
    { id: 'demo-4', title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", image: "/api/placeholder/80/80" },
    { id: 'demo-5', title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3", image: "/api/placeholder/80/80" },
    { id: 'demo-6', title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", image: "/api/placeholder/80/80" }
  ]

  // Fetch Spotify data
  const fetchSpotifyData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSpotifyConfigured()) {
        setCurrentTrack(demoCurrentTrack)
        setRecentTracks(demoRecentTracks)
        setShowingDemo(true)
        setError('Spotify not configured')
        return
      }

      const [current, recent] = await Promise.all([
        getCurrentlyPlaying(),
        getRecentlyPlayed()
      ])

      if (current || recent.length > 0) {
        setCurrentTrack(current)
        setRecentTracks(recent.slice(0, 5))
        setShowingDemo(false)
        setError(null)
      } else {
        // No data available, use demo
        setCurrentTrack(demoCurrentTrack)
        setRecentTracks(demoRecentTracks)
        setShowingDemo(true)
        setError('No Spotify data available')
      }
    } catch (err) {
      console.error('Error fetching Spotify data:', err)
      setCurrentTrack(demoCurrentTrack)
      setRecentTracks(demoRecentTracks)
      setShowingDemo(true)
      setError('Failed to load Spotify data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount and set up polling
  useEffect(() => {
    fetchSpotifyData()

    // Set up polling for live data
    const interval = setInterval(fetchSpotifyData, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [fetchSpotifyData])

  // Format time duration
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentTrack || !currentTrack.duration) return 0
    return (currentTrack.progress / currentTrack.duration) * 100
  }

  // Handle settings change
  const handleSettingsChange = (newSettings) => {
    onSettingsChange?.({ ...settings, ...newSettings })
  }

  // Open Spotify link
  const openSpotifyLink = (url) => {
    if (url && !showingDemo) {
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin" />
            <span>Loading music...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-green-400">
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">
              {showingDemo ? 'Demo Mode' : 'Live Data'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSpotifyData}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {error && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm">
            {showingDemo ? 'Showing demo tracks. Configure Spotify for live data.' : error}
          </p>
        </div>
      )}

      {/* Currently Playing */}
      {currentTrack && (
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-3">
            {showAlbumArt && (
              <div 
                className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openSpotifyLink(currentTrack.url)}
              >
                {currentTrack.image !== '/api/placeholder/80/80' ? (
                  <img 
                    src={currentTrack.image} 
                    alt={currentTrack.album}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 
                  className="text-white font-medium truncate cursor-pointer hover:text-green-400 transition-colors"
                  onClick={() => openSpotifyLink(currentTrack.url)}
                >
                  {currentTrack.title}
                </h4>
                {currentTrack.isPlaying && (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">PLAYING</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
              <p className="text-gray-500 text-xs truncate">{currentTrack.album}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentTrack.duration && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{formatTime(currentTrack.progress || 0)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-400 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {showControls && (
            <div className="flex items-center justify-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors" disabled={showingDemo}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>
              <button className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors" disabled={showingDemo}>
                {currentTrack.isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors" disabled={showingDemo}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recently Played Toggle */}
      {recentTracks.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center justify-between w-full text-left text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">Recently Played</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showRecent ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showRecent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {recentTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => openSpotifyLink(track.url)}
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded overflow-hidden">
                      {track.image !== '/api/placeholder/80/80' ? (
                        <img 
                          src={track.image} 
                          alt={track.album}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{track.title}</p>
                      <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Show playback controls</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showControls}
                    onChange={(e) => handleSettingsChange({ showControls: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Show album artwork</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAlbumArt}
                    onChange={(e) => handleSettingsChange({ showAlbumArt: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify Setup Notice */}
      {!isSpotifyConfigured() && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
          <p className="text-green-400 text-xs">
            Configure Spotify credentials in your .env file for live music data.
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default SpotifyWidget