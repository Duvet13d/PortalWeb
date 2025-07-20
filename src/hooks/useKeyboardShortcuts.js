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

    // Handle Escape key for closing modals
    if (event.key === 'Escape') {
      const closeButtons = document.querySelectorAll('[data-close-modal]')
      if (closeButtons.length > 0) {
        closeButtons[closeButtons.length - 1].click() // Close the topmost modal
      }
      return
    }

    // No global typing functionality since search widget was removed
  }, [navigate, location.pathname])

  const showKeyboardHelp = () => {
    // Create and show keyboard shortcuts modal
    const existingModal = document.getElementById('keyboard-help-modal')
    if (existingModal) {
      existingModal.remove()
    }

    const modal = document.createElement('div')
    modal.id = 'keyboard-help-modal'
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-labelledby', 'keyboard-help-title')
    modal.setAttribute('aria-modal', 'true')

    modal.innerHTML = `
      <div class="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 id="keyboard-help-title" class="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button 
            data-close-modal 
            class="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close keyboard shortcuts help"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <h3 class="text-white font-medium mb-2">Navigation</h3>
            <div class="grid grid-cols-1 gap-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Navigate to Home</span>
                <kbd class="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Alt + H</kbd>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Navigate to Tools</span>
                <kbd class="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Alt + T</kbd>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Navigate to Links</span>
                <kbd class="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Alt + L</kbd>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-white font-medium mb-2">General</h3>
            <div class="grid grid-cols-1 gap-2">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Close Modal</span>
                <kbd class="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-700">
          <p class="text-xs text-gray-400">
            Use Tab to navigate between interactive elements.
          </p>
        </div>
      </div>
    `

    // Add click handler to close modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close-modal')) {
        modal.remove()
      }
    })

    // Add escape key handler
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove()
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)

    document.body.appendChild(modal)

    // Focus the close button for accessibility
    const closeButton = modal.querySelector('[data-close-modal]')
    if (closeButton) {
      closeButton.focus()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { showKeyboardHelp }
}

export default useKeyboardShortcuts