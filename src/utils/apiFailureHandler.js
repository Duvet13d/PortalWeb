/**
 * Enhanced API failure handler with user notifications and graceful fallbacks
 */

import { retry, RETRY_CONFIGS } from './retry'
import { offlineStorage } from './offline'

/**
 * API Error types for better categorization
 */
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  SERVER_ERROR: 'server_error',
  RATE_LIMITED: 'rate_limited',
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: 'not_found',
  OFFLINE: 'offline'
}

/**
 * Global API failure handler
 */
export class GlobalAPIHandler {
  constructor() {
    this.errorCounts = new Map()
    this.lastErrors = new Map()
    this.circuitBreakers = new Map()
  }

  /**
   * Handle API call with comprehensive error handling
   */
  async handleAPICall(apiCall, options = {}) {
    const {
      cacheKey,
      fallbackData,
      retryConfig = RETRY_CONFIGS.STANDARD,
      enableCircuitBreaker = true,
      notifyUser = true
    } = options

    try {
      // Check circuit breaker
      if (enableCircuitBreaker && this.isCircuitOpen(cacheKey)) {
        throw new Error('Circuit breaker is open')
      }

      // Execute API call with retry
      const response = await retry(apiCall, retryConfig)
      
      // Reset error count on success
      this.resetErrorCount(cacheKey)
      
      return response
    } catch (error) {
      // Track error
      this.trackError(cacheKey, error)
      
      // Try to get cached data
      if (cacheKey) {
        const cachedData = offlineStorage.get(cacheKey)
        if (cachedData) {
          console.log(`Using cached data for ${cacheKey}`)
          return this.createCachedResponse(cachedData)
        }
      }

      // Use fallback data if available
      if (fallbackData) {
        console.log(`Using fallback data for ${cacheKey}`)
        return this.createFallbackResponse(fallbackData)
      }

      // Notify user if enabled
      if (notifyUser) {
        this.notifyUser(error, cacheKey)
      }

      throw error
    }
  }

  /**
   * Track API errors for circuit breaker pattern
   */
  trackError(key, error) {
    if (!key) return

    const count = this.errorCounts.get(key) || 0
    this.errorCounts.set(key, count + 1)
    this.lastErrors.set(key, {
      error,
      timestamp: Date.now(),
      type: this.categorizeError(error)
    })

    // Open circuit breaker after 5 consecutive failures
    if (count >= 4) {
      this.circuitBreakers.set(key, {
        isOpen: true,
        openedAt: Date.now(),
        resetTimeout: 60000 // 1 minute
      })
    }
  }

  /**
   * Reset error count on successful API call
   */
  resetErrorCount(key) {
    if (!key) return
    
    this.errorCounts.delete(key)
    this.circuitBreakers.delete(key)
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitOpen(key) {
    if (!key) return false

    const breaker = this.circuitBreakers.get(key)
    if (!breaker || !breaker.isOpen) return false

    // Check if reset timeout has passed
    if (Date.now() - breaker.openedAt > breaker.resetTimeout) {
      this.circuitBreakers.delete(key)
      return false
    }

    return true
  }

  /**
   * Categorize error for better handling
   */
  categorizeError(error) {
    if (!navigator.onLine) return API_ERROR_TYPES.OFFLINE
    if (error.name === 'AbortError') return API_ERROR_TYPES.TIMEOUT
    if (error.message?.includes('timeout')) return API_ERROR_TYPES.TIMEOUT
    
    const status = error.status || error.response?.status
    if (status >= 500) return API_ERROR_TYPES.SERVER_ERROR
    if (status === 429) return API_ERROR_TYPES.RATE_LIMITED
    if (status === 401 || status === 403) return API_ERROR_TYPES.UNAUTHORIZED
    if (status === 404) return API_ERROR_TYPES.NOT_FOUND
    
    return API_ERROR_TYPES.NETWORK_ERROR
  }

  /**
   * Create cached response with appropriate headers
   */
  createCachedResponse(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK (Cached)',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Cached-Response': 'true',
        'X-Cache-Source': 'offline-storage'
      })
    })
  }

  /**
   * Create fallback response
   */
  createFallbackResponse(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK (Fallback)',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Fallback-Response': 'true'
      })
    })
  }

  /**
   * Notify user about API failures
   */
  notifyUser(error, apiName) {
    const errorType = this.categorizeError(error)
    const message = this.getErrorMessage(errorType, apiName)
    
    // Use browser notification if available and user has granted permission
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('API Error', {
        body: message,
        icon: '/favi.svg',
        tag: `api-error-${apiName}`,
        silent: true
      })
    }

    // Also dispatch custom event for in-app notifications
    window.dispatchEvent(new CustomEvent('api:error', {
      detail: { error, apiName, errorType, message }
    }))
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(errorType, apiName = 'Service') {
    const messages = {
      [API_ERROR_TYPES.OFFLINE]: `${apiName} is unavailable while offline. Using cached data.`,
      [API_ERROR_TYPES.TIMEOUT]: `${apiName} is taking too long to respond. Please try again.`,
      [API_ERROR_TYPES.SERVER_ERROR]: `${apiName} is experiencing issues. Using cached data.`,
      [API_ERROR_TYPES.RATE_LIMITED]: `${apiName} rate limit exceeded. Please wait before trying again.`,
      [API_ERROR_TYPES.UNAUTHORIZED]: `${apiName} access denied. Please check your credentials.`,
      [API_ERROR_TYPES.NOT_FOUND]: `${apiName} endpoint not found.`,
      [API_ERROR_TYPES.NETWORK_ERROR]: `Network error accessing ${apiName}. Using cached data.`
    }

    return messages[errorType] || `${apiName} is currently unavailable.`
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats() {
    const stats = {}
    
    for (const [key, count] of this.errorCounts.entries()) {
      const lastError = this.lastErrors.get(key)
      const breaker = this.circuitBreakers.get(key)
      
      stats[key] = {
        errorCount: count,
        lastError: lastError ? {
          type: lastError.type,
          message: lastError.error.message,
          timestamp: lastError.timestamp
        } : null,
        circuitBreakerOpen: breaker?.isOpen || false
      }
    }
    
    return stats
  }
}

// Global instance
export const globalAPIHandler = new GlobalAPIHandler()

/**
 * Specific handlers for different APIs
 */

// Weather API handler
export const handleWeatherAPI = async (apiCall, cacheKey) => {
  return globalAPIHandler.handleAPICall(apiCall, {
    cacheKey: `weather_${cacheKey}`,
    fallbackData: {
      main: { temp: 20, feels_like: 22, humidity: 65, pressure: 1013 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      name: 'Demo Location',
      wind: { speed: 3.5 },
      visibility: 10000
    },
    retryConfig: RETRY_CONFIGS.STANDARD,
    notifyUser: true
  })
}

// Currency API handler
export const handleCurrencyAPI = async (apiCall, cacheKey) => {
  // Determine fallback data based on base currency
  let fallbackData;
  
  if (cacheKey === 'HKD') {
    // HKD-based rates (realistic as of 2024)
    fallbackData = {
      rates: {
        JPY: 18.5,    // 1 HKD = ~18.5 JPY
        USD: 0.128,   // 1 HKD = ~0.128 USD
        CNY: 0.92,    // 1 HKD = ~0.92 CNY
        EUR: 0.118,   // 1 HKD = ~0.118 EUR
        GBP: 0.101,   // 1 HKD = ~0.101 GBP
        CAD: 0.174,   // 1 HKD = ~0.174 CAD
        AUD: 0.193    // 1 HKD = ~0.193 AUD
      },
      base: 'HKD',
      timestamp: Date.now()
    };
  } else {
    // USD-based rates (fallback)
    fallbackData = {
      rates: {
        HKD: 7.8,     // 1 USD = ~7.8 HKD
        EUR: 0.85,    // 1 USD = ~0.85 EUR
        GBP: 0.73,    // 1 USD = ~0.73 GBP
        JPY: 145,     // 1 USD = ~145 JPY
        CAD: 1.36,    // 1 USD = ~1.36 CAD
        AUD: 1.51,    // 1 USD = ~1.51 AUD
        CNY: 7.2      // 1 USD = ~7.2 CNY
      },
      base: 'USD',
      timestamp: Date.now()
    };
  }

  return globalAPIHandler.handleAPICall(apiCall, {
    cacheKey: `currency_${cacheKey}`,
    fallbackData,
    retryConfig: RETRY_CONFIGS.STANDARD,
    notifyUser: true
  })
}

// Spotify API handler
export const handleSpotifyAPI = async (apiCall, cacheKey) => {
  return globalAPIHandler.handleAPICall(apiCall, {
    cacheKey: `spotify_${cacheKey}`,
    fallbackData: {
      currentTrack: {
        title: "Offline Mode",
        artist: "No Connection",
        album: "Cached Data",
        image: "/favi.svg",
        isPlaying: false
      },
      recentTracks: []
    },
    retryConfig: RETRY_CONFIGS.PERSISTENT,
    notifyUser: false // Spotify errors are less critical
  })
}

/**
 * API Error Notification System
 */
export class APIErrorNotifier {
  constructor() {
    this.notifications = new Map()
    this.maxNotifications = 5
    this.notificationTimeout = 5000 // 5 seconds
  }

  /**
   * Show error notification to user
   */
  notify(apiName, errorType, message) {
    const id = `${apiName}-${errorType}-${Date.now()}`
    
    // Don't show duplicate notifications
    const existingKey = `${apiName}-${errorType}`
    if (this.notifications.has(existingKey)) {
      return
    }

    const notification = {
      id,
      apiName,
      errorType,
      message,
      timestamp: Date.now()
    }

    this.notifications.set(existingKey, notification)

    // Dispatch event for UI components to handle
    window.dispatchEvent(new CustomEvent('api:notification', {
      detail: notification
    }))

    // Auto-remove notification after timeout
    setTimeout(() => {
      this.notifications.delete(existingKey)
      window.dispatchEvent(new CustomEvent('api:notification:remove', {
        detail: { id }
      }))
    }, this.notificationTimeout)

    // Limit number of notifications
    if (this.notifications.size > this.maxNotifications) {
      const oldestKey = this.notifications.keys().next().value
      this.notifications.delete(oldestKey)
    }
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.clear()
    window.dispatchEvent(new CustomEvent('api:notifications:clear'))
  }

  /**
   * Get current notifications
   */
  getNotifications() {
    return Array.from(this.notifications.values())
  }
}

// Global notifier instance
export const apiErrorNotifier = new APIErrorNotifier()

/**
 * Request notification permission on app start
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission()
      console.log('Notification permission:', permission)
      return permission === 'granted'
    } catch (error) {
      console.warn('Failed to request notification permission:', error)
      return false
    }
  }
  return Notification.permission === 'granted'
}