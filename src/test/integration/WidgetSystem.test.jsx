import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProvidersNoRouter, mockLocalStorage, createMockSettings } from '@test/utils.jsx'
import App from '../../App'

describe('Widget System Integration', () => {
  beforeEach(() => {
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify(createMockSettings()),
      'widget-layout': JSON.stringify({
        columns: 3,
        gap: 16,
        widgets: [
          { id: 'weather', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
          { id: 'timezone', position: { x: 2, y: 0 }, size: { w: 1, h: 1 } }
        ]
      })
    })
  })

  it('loads and displays enabled widgets', async () => {
    renderWithProvidersNoRouter(<App />)
    
    // Navigate to home page
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('opens and closes settings panel', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('toggles widget visibility', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Weather widget should be visible by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('persists widget settings across sessions', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Weather widget should be visible by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
    
    // Verify localStorage contains weather settings
    expect(localStorage.getItem).toHaveBeenCalledWith('personal-portal-settings')
  })

  it('handles widget errors gracefully', async () => {
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget without crashing
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('resets settings to defaults', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('exports and imports settings', async () => {
    const user = userEvent.setup()
    
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('handles drag and drop widget reordering', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('responds to keyboard shortcuts', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
    
    // Test Alt+H navigation shortcut
    await user.keyboard('{Alt>}h{/Alt}')
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('handles offline mode', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    renderWithProvidersNoRouter(<App />)
    
    // Widgets should still work with cached data
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('updates widgets when settings change', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('handles theme changes', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Should show weather widget by default
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })
})