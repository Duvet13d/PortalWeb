import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-triggered rendering with lazy loading
 * @param {Object} options - Configuration options
 * @param {string} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.once - Whether to trigger only once
 * @param {number} options.delay - Delay before triggering (ms)
 * @returns {Object} - { ref, isVisible, hasTriggered }
 */
export const useScrollTrigger = ({
  threshold = 0.1,
  rootMargin = '-50px',
  once = true,
  delay = 0
} = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasTriggered)) {
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
              setIsVisible(true)
              setHasTriggered(true)
            }, delay)
          } else {
            setIsVisible(true)
            setHasTriggered(true)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [threshold, rootMargin, once, delay, hasTriggered])

  return { ref, isVisible, hasTriggered }
}

/**
 * Hook for staggered animations of multiple elements
 * @param {number} itemCount - Number of items to animate
 * @param {number} staggerDelay - Delay between each item animation (ms)
 * @returns {Object} - { containerRef, isVisible, getItemDelay }
 */
export const useStaggeredAnimation = (itemCount, staggerDelay = 100) => {
  const { ref: containerRef, isVisible } = useScrollTrigger({
    threshold: 0.1,
    rootMargin: '-100px'
  })

  const getItemDelay = (index) => {
    return isVisible ? index * staggerDelay : 0
  }

  return { containerRef, isVisible, getItemDelay }
}

/**
 * Hook for lazy loading content with progressive rendering
 * @param {Array} items - Array of items to render
 * @param {number} batchSize - Number of items to render per batch
 * @param {number} batchDelay - Delay between batches (ms)
 * @returns {Object} - { ref, visibleItems, isLoading }
 */
export const useLazyRender = (items = [], batchSize = 3, batchDelay = 200) => {
  const [visibleItems, setVisibleItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { ref, isVisible } = useScrollTrigger()
  const batchTimeoutRef = useRef(null)

  useEffect(() => {
    if (!isVisible || items.length === 0) return

    setIsLoading(true)
    let currentBatch = 0
    const totalBatches = Math.ceil(items.length / batchSize)

    const renderNextBatch = () => {
      if (currentBatch < totalBatches) {
        const startIndex = currentBatch * batchSize
        const endIndex = Math.min(startIndex + batchSize, items.length)
        const newItems = items.slice(0, endIndex)
        
        setVisibleItems(newItems)
        currentBatch++

        if (currentBatch < totalBatches) {
          batchTimeoutRef.current = setTimeout(renderNextBatch, batchDelay)
        } else {
          setIsLoading(false)
        }
      }
    }

    renderNextBatch()

    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
    }
  }, [isVisible, items, batchSize, batchDelay])

  return { ref, visibleItems, isLoading }
}