import { useState, useEffect, useCallback } from 'react'

/**
 * Offline detection and management utilities
 */

// Offline status hook
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Trigger reconnection events
        window.dispatchEvent(new CustomEvent('app:reconnected'))
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      window.dispatchEvent(new CustomEvent('app:disconnected'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

/**
 * Offline-aware fetch with caching and retry logic
 */
export class OfflineAwareFetch {
  constructor(options = {}) {
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000
    this.cacheTimeout = options.cacheTimeout || 300000 // 5 minutes
    this.enableCache = options.enableCache !== false
  }

  async fetch(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options)
    
    // Try network first
    if (navigator.onLine) {
      try {
        const response = await this.fetchWithRetry(url, options)
        
        // Cache successful responses
        if (response.ok && this.enableCache) {
          await this.cacheResponse(cacheKey, response.clone())
        }
        
        return response
      } catch (error) {
        console.warn('Network request failed, trying cache:', error)
        // Fall back to cache if network fails
        return await this.getCachedResponse(cacheKey) || this.createOfflineResponse()
      }
    }

    // If offline, try cache first
    const cachedResponse = await this.getCachedResponse(cacheKey)
    if (cachedResponse) {
      return cachedResponse
    }

    // No cache available, return offline response
    return this.createOfflineResponse()
  }

  async fetchWithRetry(url, options, attempt = 1) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`Retry attempt ${attempt} for ${url}`)
        await this.delay(this.retryDelay * attempt) // Exponential backoff
        return this.fetchWithRetry(url, options, attempt + 1)
      }
      throw error
    }
  }

  getCacheKey(url, options) {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `fetch_cache_${method}_${url}_${btoa(body).slice(0, 10)}`
  }

  async cacheResponse(key, response) {
    try {
      const data = await response.text()
      const cacheData = {
        data,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText,
        timestamp: Date.now()
      }
      
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache response:', error)
    }
  }

  async getCachedResponse(key) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      
      // Check if cache is still fresh
      if (Date.now() - cacheData.timestamp > this.cacheTimeout) {
        localStorage.removeItem(key)
        return null
      }

      // Create a Response object from cached data
      return new Response(cacheData.data, {
        status: cacheData.status,
        statusText: cacheData.statusText,
        headers: new Headers(cacheData.headers)
      })
    } catch (error) {
      console.warn('Failed to get cached response:', error)
      return null
    }
  }

  createOfflineResponse() {
    return new Response(JSON.stringify({ 
      error: 'offline', 
      message: 'No network connection available' 
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'application/json' })
    })
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Global instance
export const offlineFetch = new OfflineAwareFetch()

/**
 * Hook for offline-aware API calls
 */
export const useOfflineAwareAPI = (options = {}) => {
  const { isOnline } = useOfflineStatus()
  const [fetcher] = useState(() => new OfflineAwareFetch(options))

  const fetchData = useCallback(async (url, fetchOptions = {}) => {
    return await fetcher.fetch(url, fetchOptions)
  }, [fetcher])

  return { fetchData, isOnline }
}

/**
 * Offline storage manager for critical data
 */
export class OfflineStorage {
  constructor(prefix = 'offline_') {
    this.prefix = prefix
  }

  set(key, data, ttl = 3600000) { // 1 hour default TTL
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
      return true
    } catch (error) {
      console.warn('Failed to store offline data:', error)
      return false
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      // Check if item has expired
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        this.remove(key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to get offline data:', error)
      return null
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.warn('Failed to remove offline data:', error)
      return false
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.warn('Failed to clear offline data:', error)
      return false
    }
  }

  getAll() {
    try {
      const items = {}
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
      
      keys.forEach(key => {
        const cleanKey = key.replace(this.prefix, '')
        const data = this.get(cleanKey)
        if (data !== null) {
          items[cleanKey] = data
        }
      })

      return items
    } catch (error) {
      console.warn('Failed to get all offline data:', error)
      return {}
    }
  }
}

// Global offline storage instance
export const offlineStorage = new OfflineStorage('homepage_offline_')

/**
 * Enhanced offline mode manager
 */
export class OfflineModeManager {
  constructor() {
    this.isOfflineMode = false
    this.offlineData = new Map()
    this.listeners = new Set()
    this.init()
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.setOfflineMode(false)
      this.notifyListeners('online')
    })

    window.addEventListener('offline', () => {
      this.setOfflineMode(true)
      this.notifyListeners('offline')
    })

    // Check initial state
    this.setOfflineMode(!navigator.onLine)
  }

  setOfflineMode(isOffline) {
    this.isOfflineMode = isOffline
    document.body.classList.toggle('offline-mode', isOffline)
  }

  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => callback(event, this.isOfflineMode))
  }

  // Store data for offline use
  storeOfflineData(key, data) {
    this.offlineData.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Get offline data
  getOfflineData(key) {
    return this.offlineData.get(key)?.data
  }

  // Clear old offline data
  clearExpiredData(maxAge = 3600000) { // 1 hour default
    const now = Date.now()
    for (const [key, value] of this.offlineData.entries()) {
      if (now - value.timestamp > maxAge) {
        this.offlineData.delete(key)
      }
    }
  }
}

// Global offline mode manager
export const offlineModeManager = new OfflineModeManager()

/**
 * Enhanced offline indicator component with more features
 */
export const OfflineIndicator = ({ className = '' }) => {
  const { isOnline, wasOffline } = useOfflineStatus()
  const [showDetails, setShowDetails] = useState(false)
  const [offlineStartTime, setOfflineStartTime] = useState(null)

  useEffect(() => {
    if (!isOnline && !offlineStartTime) {
      setOfflineStartTime(Date.now())
    } else if (isOnline) {
      setOfflineStartTime(null)
    }
  }, [isOnline, offlineStartTime])

  const getOfflineDuration = () => {
    if (!offlineStartTime) return ''
    const duration = Math.floor((Date.now() - offlineStartTime) / 1000)
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.floor(duration / 60)}m`
    return `${Math.floor(duration / 3600)}h`
  }

  if (isOnline && !wasOffline) return null

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div 
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
          isOnline 
            ? 'bg-green-600 text-white' 
            : 'bg-yellow-600 text-white'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-300' : 'bg-yellow-300 animate-pulse'
          }`} />
          <span>
            {isOnline ? 'Back online' : 'Offline mode'}
            {!isOnline && offlineStartTime && ` (${getOfflineDuration()})`}
          </span>
        </div>
        
        {showDetails && !isOnline && (
          <div className="mt-2 pt-2 border-t border-yellow-400/30 text-xs">
            <div>• Cached content available</div>
            <div>• Some features limited</div>
            <div>• Data will sync when online</div>
          </div>
        )}
      </div>
    </div>
  )
}