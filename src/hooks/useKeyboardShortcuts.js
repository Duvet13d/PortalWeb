import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Global keyboard shortcuts hook
 * Provides navigation shortcuts and global typing for search on Home page
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleKeyDown = useCallback((event) => {
    // Skip if user is typing in an input field
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true'
    ) {
      return
    }

    // Skip if any modifier keys except Alt are pressed (to avoid conflicts)
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }

    // Alt + key combinations for navigation only
    if (event.altKey) {
      switch (event.key.toLowerCase()) {
        case 'h':
          event.preventDefault()
          navigate('/')
          break
        case 't':
          event.preventDefault()
          navigate('/tools')
          break
        case 'l':
          event.preventDefault()
          navigate('/links')
          break
        default:
          break
      }
      return
    }

    // Global typing for search - only on Home page
    if (location.pathname === '/') {
      // Check if the key is a printable character (letters, numbers, symbols)
      if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        
        // Find the search input on the landing page
        const searchInput = document.querySelector('[data-search-input]')
        if (searchInput) {
          searchInput.focus()
          // Set the value to the typed character
          searchInput.value = event.key
          // Trigger input event to update React state
          const inputEvent = new Event('input', { bubbles: true })
          searchInput.dispatchEvent(inputEvent)
        }
      }
    }
  }, [navigate, location.pathname])



  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {}
}

export default useKeyboardShortcuts