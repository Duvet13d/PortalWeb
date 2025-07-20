/**
 * Retry mechanism utilities for handling failed requests and operations
 */

/**
 * Retry configuration options
 */
export const RETRY_CONFIGS = {
  // Quick retry for user-initiated actions
  IMMEDIATE: {
    attempts: 2,
    delay: 500,
    backoff: 1.5
  },
  // Standard retry for API calls
  STANDARD: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  },
  // Aggressive retry for critical operations
  PERSISTENT: {
    attempts: 5,
    delay: 2000,
    backoff: 2
  },
  // Background retry for non-critical operations
  BACKGROUND: {
    attempts: 3,
    delay: 5000,
    backoff: 1.5
  }
}

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, config = RETRY_CONFIGS.STANDARD) => {
  const { attempts, delay, backoff } = config
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn(attempt)
      return result
    } catch (error) {
      lastError = error
      
      // Don't retry on certain error types
      if (isNonRetryableError(error)) {
        throw error
      }

      // Don't delay on the last attempt
      if (attempt < attempts) {
        const delayTime = delay * Math.pow(backoff, attempt - 1)
        await sleep(delayTime)
      }
    }
  }

  throw lastError
}

/**
 * Retry with custom condition
 */
export const retryWithCondition = async (fn, shouldRetry, config = RETRY_CONFIGS.STANDARD) => {
  const { attempts, delay, backoff } = config
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn(attempt)
      return result
    } catch (error) {
      lastError = error
      
      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        throw error
      }

      // Don't delay on the last attempt
      if (attempt < attempts) {
        const delayTime = delay * Math.pow(backoff, attempt - 1)
        await sleep(delayTime)
      }
    }
  }

  throw lastError
}

/**
 * Retry hook for React components
 */
export const useRetry = (config = RETRY_CONFIGS.STANDARD) => {
  const retryOperation = async (operation) => {
    return retry(operation, config)
  }

  const retryWithCondition = async (operation, shouldRetry) => {
    return retryWithCondition(operation, shouldRetry, config)
  }

  return { retry: retryOperation, retryWithCondition }
}

/**
 * Queue for managing retry operations
 */
export class RetryQueue {
  constructor(options = {}) {
    this.queue = []
    this.processing = false
    this.maxConcurrent = options.maxConcurrent || 3
    this.defaultConfig = options.defaultConfig || RETRY_CONFIGS.STANDARD
  }

  add(operation, config = this.defaultConfig) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        config,
        resolve,
        reject,
        id: Date.now() + Math.random()
      })

      this.process()
    })
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const concurrent = []

    while (this.queue.length > 0 && concurrent.length < this.maxConcurrent) {
      const item = this.queue.shift()
      concurrent.push(this.processItem(item))
    }

    await Promise.allSettled(concurrent)
    this.processing = false

    // Process remaining items
    if (this.queue.length > 0) {
      this.process()
    }
  }

  async processItem(item) {
    try {
      const result = await retry(item.operation, item.config)
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    }
  }

  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'))
    })
    this.queue = []
  }

  size() {
    return this.queue.length
  }
}

/**
 * Global retry queue instance
 */
export const globalRetryQueue = new RetryQueue()

/**
 * Utility functions
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const isNonRetryableError = (error) => {
  // Don't retry on these error types
  const nonRetryableErrors = [
    'AbortError',
    'TypeError', // Usually indicates a programming error
    'SyntaxError',
    'ReferenceError'
  ]

  if (nonRetryableErrors.includes(error.name)) {
    return true
  }

  // Don't retry on 4xx HTTP errors (except 408, 429)
  if (error.status >= 400 && error.status < 500) {
    return ![408, 429].includes(error.status)
  }

  return false
}

/**
 * Specific retry functions for common operations
 */

// Retry API calls
export const retryAPICall = async (apiCall, config = RETRY_CONFIGS.STANDARD) => {
  return retry(async (attempt) => {
    try {
      const response = await apiCall()
      
      // Check if response is ok
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.status = response.status
        error.response = response
        throw error
      }

      return response
    } catch (error) {
      // Add attempt info to error
      error.attempt = attempt
      throw error
    }
  }, config)
}

// Retry with exponential backoff and jitter
export const retryWithJitter = async (fn, config = RETRY_CONFIGS.STANDARD) => {
  const { attempts, delay, backoff } = config
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await fn(attempt)
      return result
    } catch (error) {
      lastError = error
      
      if (isNonRetryableError(error) || attempt === attempts) {
        throw error
      }

      // Add jitter to prevent thundering herd
      const baseDelay = delay * Math.pow(backoff, attempt - 1)
      const jitter = Math.random() * 0.1 * baseDelay
      const delayTime = baseDelay + jitter

      await sleep(delayTime)
    }
  }

  throw lastError
}

// Retry with circuit breaker pattern
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.resetTimeout = options.resetTimeout || 60000
    this.monitoringPeriod = options.monitoringPeriod || 10000
    
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN'
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failureCount = 0
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= 3) {
        this.state = 'CLOSED'
      }
    }
  }

  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState() {
    return this.state
  }

  reset() {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0
  }
}