import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Search Widget - Universal search with smart suggestions and engine selection
 */
const SearchWidget = ({ 
  title = "Search", 
  description = "Universal search with smart suggestions",
  size = "large",
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showEngineSelector, setShowEngineSelector] = useState(false)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Default settings
  const defaultEngine = settings.defaultEngine || 'google'
  const showSuggestionsEnabled = settings.showSuggestions !== false

  // Search engines configuration
  const searchEngines = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      suggestionsUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&q=',
      icon: '🔍',
      color: 'text-blue-400'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=',
      suggestionsUrl: 'https://duckduckgo.com/ac/?q=',
      icon: '🦆',
      color: 'text-orange-400'
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search?q=',
      suggestionsUrl: 'https://www.bing.com/AS/Suggestions?pt=page.home&mkt=en-us&qry=',
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
    if (!searchQuery.trim() || !showSuggestionsEnabled) {
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
      // For demo purposes, we'll create mock suggestions
      // In a real implementation, you'd call the search engine's suggestion API
      const mockSuggestions = generateMockSuggestions(searchQuery)
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [showSuggestionsEnabled])

  // Generate mock suggestions (replace with real API calls in production)
  const generateMockSuggestions = (query) => {
    const commonSuggestions = [
      `${query} tutorial`,
      `${query} examples`,
      `${query} documentation`,
      `${query} vs`,
      `${query} how to`
    ]
    
    return commonSuggestions.slice(0, 5).map((suggestion, index) => ({
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

    // Use specified engine or default
    const engine = searchEngines[forceEngine || defaultEngine]
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
    onSettingsChange?.({ ...settings, defaultEngine: engineKey })
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

  const currentEngine = searchEngines[defaultEngine]

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
          <div className="w-8 h-8 text-accent-1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        
        {/* Engine Selector */}
        <div className="relative engine-selector">
          <button
            onClick={() => setShowEngineSelector(!showEngineSelector)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors ${currentEngine.color}`}
            title={`Search with ${currentEngine.name}`}
          >
            <span className="text-lg">{currentEngine.icon}</span>
            <span className="text-sm font-medium text-white">{currentEngine.name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {showEngineSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[150px]"
              >
                {Object.entries(searchEngines).map(([key, engine]) => (
                  <button
                    key={key}
                    onClick={() => handleEngineChange(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      key === defaultEngine ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span className="text-lg">{engine.icon}</span>
                    <span className={`font-medium ${engine.color}`}>{engine.name}</span>
                    {key === defaultEngine && (
                      <svg className="w-4 h-4 text-accent-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search the web or enter a URL..."
          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all duration-300"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin" />
          )}
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-40 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedSuggestion === index ? 'bg-gray-700' : ''
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Shortcuts Help */}
      <div className="mt-4 text-xs text-gray-500">
        <details className="cursor-pointer">
          <summary className="hover:text-gray-400 transition-colors">Search shortcuts</summary>
          <div className="mt-2 grid grid-cols-2 gap-1 text-gray-400">
            {Object.entries(searchShortcuts).map(([shortcut, config]) => (
              <div key={shortcut} className="flex items-center gap-2">
                <code className="bg-gray-800 px-1 rounded text-accent-1">{shortcut}</code>
                <span>{config.name}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </motion.div>
  )
}

export default SearchWidget