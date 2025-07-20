/**
 * Accessibility utilities for WCAG compliance and enhanced user experience
 */

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element
    if (firstElement) {
      firstElement.focus()
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  },

  /**
   * Save and restore focus for modal interactions
   */
  saveFocus: () => {
    return document.activeElement
  },

  restoreFocus: (element) => {
    if (element && element.focus) {
      element.focus()
    }
  },

  /**
   * Focus first error in a form
   */
  focusFirstError: (container) => {
    const errorElement = container.querySelector('[aria-invalid="true"], .error')
    if (errorElement) {
      errorElement.focus()
    }
  }
}

/**
 * ARIA utilities for screen readers
 */
export const ariaUtils = {
  /**
   * Announce message to screen readers
   */
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  /**
   * Set expanded state for collapsible elements
   */
  setExpanded: (element, isExpanded) => {
    element.setAttribute('aria-expanded', isExpanded.toString())
  },

  /**
   * Set pressed state for toggle buttons
   */
  setPressed: (element, isPressed) => {
    element.setAttribute('aria-pressed', isPressed.toString())
  },

  /**
   * Set selected state for selectable items
   */
  setSelected: (element, isSelected) => {
    element.setAttribute('aria-selected', isSelected.toString())
  },

  /**
   * Set invalid state for form fields
   */
  setInvalid: (element, isInvalid, errorMessage = '') => {
    element.setAttribute('aria-invalid', isInvalid.toString())
    if (isInvalid && errorMessage) {
      const errorId = `${element.id || 'field'}-error`
      let errorElement = document.getElementById(errorId)
      
      if (!errorElement) {
        errorElement = document.createElement('div')
        errorElement.id = errorId
        errorElement.className = 'sr-only'
        element.parentNode.appendChild(errorElement)
      }
      
      errorElement.textContent = errorMessage
      element.setAttribute('aria-describedby', errorId)
    } else {
      element.removeAttribute('aria-describedby')
      const errorElement = document.getElementById(`${element.id || 'field'}-error`)
      if (errorElement) {
        errorElement.remove()
      }
    }
  }
}

/**
 * Color contrast utilities for WCAG AA compliance
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1, color2) => {
    const l1 = contrastUtils.getLuminance(...color1)
    const l2 = contrastUtils.getLuminance(...color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (foreground, background, isLargeText = false) => {
    const ratio = contrastUtils.getContrastRatio(foreground, background)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  },

  /**
   * Check if color combination meets WCAG AAA standards
   */
  meetsWCAGAAA: (foreground, background, isLargeText = false) => {
    const ratio = contrastUtils.getContrastRatio(foreground, background)
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null
  }
}

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowNavigation: (event, items, currentIndex, onIndexChange) => {
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'ArrowUp':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    onIndexChange(newIndex)
    if (items[newIndex] && items[newIndex].focus) {
      items[newIndex].focus()
    }
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      callback()
    }
  }
}

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Create screen reader only text
   */
  createSROnlyText: (text) => {
    const span = document.createElement('span')
    span.className = 'sr-only'
    span.textContent = text
    return span
  },

  /**
   * Add screen reader description to element
   */
  addDescription: (element, description) => {
    const descId = `${element.id || 'element'}-desc-${Date.now()}`
    const descElement = document.createElement('span')
    descElement.id = descId
    descElement.className = 'sr-only'
    descElement.textContent = description
    
    element.parentNode.appendChild(descElement)
    element.setAttribute('aria-describedby', descId)
    
    return descId
  }
}

/**
 * Motion and animation utilities for accessibility
 */
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Apply animation only if user doesn't prefer reduced motion
   */
  conditionalAnimation: (element, animation, fallback = null) => {
    if (motionUtils.prefersReducedMotion()) {
      if (fallback) {
        fallback(element)
      }
    } else {
      animation(element)
    }
  }
}

/**
 * Form accessibility utilities
 */
export const formUtils = {
  /**
   * Associate label with form field
   */
  associateLabel: (field, labelText) => {
    const labelId = `${field.id || 'field'}-label-${Date.now()}`
    const label = document.createElement('label')
    label.id = labelId
    label.htmlFor = field.id
    label.textContent = labelText
    
    field.parentNode.insertBefore(label, field)
    return labelId
  },

  /**
   * Add required indicator to field
   */
  markRequired: (field, labelElement = null) => {
    field.setAttribute('aria-required', 'true')
    
    if (labelElement) {
      const requiredIndicator = document.createElement('span')
      requiredIndicator.textContent = ' *'
      requiredIndicator.setAttribute('aria-label', 'required')
      requiredIndicator.className = 'text-red-500'
      labelElement.appendChild(requiredIndicator)
    }
  },

  /**
   * Validate field and set appropriate ARIA attributes
   */
  validateField: (field, isValid, errorMessage = '') => {
    ariaUtils.setInvalid(field, !isValid, errorMessage)
    
    if (!isValid) {
      field.classList.add('border-red-500', 'focus:border-red-500')
      field.classList.remove('border-gray-600', 'focus:border-accent-1')
    } else {
      field.classList.remove('border-red-500', 'focus:border-red-500')
      field.classList.add('border-gray-600', 'focus:border-accent-1')
    }
  }
}

/**
 * Skip link utilities for keyboard navigation
 */
export const skipLinkUtils = {
  /**
   * Create skip link for main content
   */
  createSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-1 focus:text-white focus:rounded-lg focus:no-underline'
    
    document.body.insertBefore(skipLink, document.body.firstChild)
    return skipLink
  }
}

// Export all utilities as default
export default {
  focusUtils,
  ariaUtils,
  contrastUtils,
  keyboardUtils,
  screenReaderUtils,
  motionUtils,
  formUtils,
  skipLinkUtils
}