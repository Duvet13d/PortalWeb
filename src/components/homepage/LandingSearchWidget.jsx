import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Landing Search Widget - Minimal search widget optimized for the landing page hero section
 */
const LandingSearchWidget = ({ className = "" }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showEngineSelector, setShowEngineSelector] = useState(false)
  const [currentEngine, setCurrentEngine] = useState('google')
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Search engines configuration
  const searchEngines = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      icon: '🔍',
      color: 'text-blue-400'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=',
      icon: '🦆',
      color: 'text-orange-400'
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search?q=',
      icon: '🔎',
      color: 'text-green-400'
    }
  }

  // Search shortcuts configuration
  const searchShortcuts = {
    'g:': { engine: 'google', name: 'Google' },
    'dd:': { engine: 'duckduckgo', name: 'DuckDuckGo' },
    'b:': { engine: 'bing', name: 'Bing' },
    'w:': { engine: 'custom', url: 'https://en.wikipedia.org/wiki/Special:Search?search=', name: 'Wikipedia' },
    'gh:': { engine: 'custom', url: 'https://github.com/search?q=', name: 'GitHub' },
    'yt:': { engine: 'custom', url: 'https://www.youtube.com/results?search_query=', name: 'YouTube' },
    'tw:': { engine: 'custom', url: 'https://twitter.com/search?q=', name: 'Twitter' },
    'r:': { engine: 'custom', url: 'https://www.reddit.com/search/?q=', name: 'Reddit' }
  }

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    // Check for shortcuts
    const shortcutMatch = Object.keys(searchShortcuts).find(shortcut => 
      searchQuery.toLowerCase().startsWith(shortcut)
    )
    
    if (shortcutMatch) {
      const shortcutQuery = searchQuery.slice(shortcutMatch.length).trim()
      if (shortcutQuery) {
        setSuggestions([
          {
            text: `${searchShortcuts[shortcutMatch].name}: ${shortcutQuery}`,
            query: searchQuery,
            isShortcut: true,
            shortcut: shortcutMatch
          }
        ])
      } else {
        setSuggestions([])
      }
      return
    }

    setIsLoading(true)
    
    try {
      // Generate mock suggestions for demo
      const mockSuggestions = generateMockSuggestions(searchQuery)
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Generate mock suggestions
  const generateMockSuggestions = (query) => {
    const commonSuggestions = [
      `${query} tutorial`,
      `${query} examples`,
      `${query} documentation`,
      `${query} vs`,
      `${query} how to`
    ]
    
    return commonSuggestions.slice(0, 4).map((suggestion, index) => ({
      text: suggestion,
      query: suggestion,
      isShortcut: false
    }))
  }

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchSuggestions])

  // Handle search execution
  const executeSearch = (searchQuery, forceEngine = null) => {
    if (!searchQuery.trim()) return

    // Check for shortcuts
    const shortcutMatch = Object.keys(searchShortcuts).find(shortcut => 
      searchQuery.toLowerCase().startsWith(shortcut)
    )

    if (shortcutMatch) {
      const shortcutConfig = searchShortcuts[shortcutMatch]
      const actualQuery = searchQuery.slice(shortcutMatch.length).trim()
      
      if (shortcutConfig.engine === 'custom') {
        window.open(shortcutConfig.url + encodeURIComponent(actualQuery), '_blank')
      } else {
        const engine = searchEngines[shortcutConfig.engine]
        window.open(engine.url + encodeURIComponent(actualQuery), '_blank')
      }
      return
    }

    // Check if it's a URL
    if (isUrl(searchQuery)) {
      const url = searchQuery.startsWith('http') ? searchQuery : `https://${searchQuery}`
      window.open(url, '_blank')
      return
    }

    // Use specified engine or current
    const engine = searchEngines[forceEngine || currentEngine]
    window.open(engine.url + encodeURIComponent(searchQuery), '_blank')
  }

  // URL detection helper
  const isUrl = (text) => {
    return text.includes('.') && !text.includes(' ') && 
           (text.includes('.com') || text.includes('.org') || text.includes('.net') || 
            text.includes('.edu') || text.includes('.gov') || text.includes('.io'))
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setSelectedSuggestion(-1)
    setShowSuggestions(value.trim().length > 0)
  }

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        const suggestion = suggestions[selectedSuggestion]
        executeSearch(suggestion.query)
        setQuery('')
        setShowSuggestions(false)
        inputRef.current?.blur()
      } else {
        executeSearch(query)
        setQuery('')
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestion(prev => prev > -1 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestion(-1)
      inputRef.current?.blur()
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    executeSearch(suggestion.query)
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // Handle engine change
  const handleEngineChange = (engineKey) => {
    setCurrentEngine(engineKey)
    setShowEngineSelector(false)
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedSuggestion(-1)
      }
      if (showEngineSelector && !event.target.closest('.engine-selector')) {
        setShowEngineSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEngineSelector])

  const engine = searchEngines[currentEngine]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`w-full max-w-2xl relative ${className}`}
    >
      {/* Main Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search the web or enter a URL..."
          className="w-full px-6 py-4 pr-20 text-lg bg-gray-900/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all duration-300 backdrop-blur-sm"
        />
        
        {/* Engine Selector and Search Icon */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Engine Selector */}
          <div className="relative engine-selector">
            <button
              onClick={() => setShowEngineSelector(!showEngineSelector)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800/50 transition-colors ${engine.color}`}
              title={`Search with ${engine.name}`}
            >
              <span className="text-sm">{engine.icon}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <AnimatePresence>
              {showEngineSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 bg-gray-900/95 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[120px] backdrop-blur-sm"
                >
                  {Object.entries(searchEngines).map(([key, searchEngine]) => (
                    <button
                      key={key}
                      onClick={() => handleEngineChange(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        key === currentEngine ? 'bg-gray-700/50' : ''
                      }`}
                    >
                      <span className="text-sm">{searchEngine.icon}</span>
                      <span className={`text-sm font-medium ${searchEngine.color}`}>{searchEngine.name}</span>
                      {key === currentEngine && (
                        <svg className="w-3 h-3 text-accent-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Icon */}
          <div className="flex items-center">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin mr-2" />
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 border border-gray-600 rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto backdrop-blur-sm"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedSuggestion === index ? 'bg-gray-700/50' : ''
                }`}
              >
                {suggestion.isShortcut ? (
                  <>
                    <div className="w-5 h-5 text-accent-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-white">{suggestion.text}</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-white">{suggestion.text}</span>
                  </>
                )}
              </button>
            ))}
            
            {/* Search Shortcuts Hint */}
            <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/30">
              <p className="text-xs text-gray-400">
                Try shortcuts: <code className="bg-gray-700 px-1 rounded text-accent-1">r:</code> Reddit, 
                <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">w:</code> Wikipedia, 
                <code className="bg-gray-700 px-1 rounded text-accent-1 ml-1">gh:</code> GitHub
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default LandingSearchWidget