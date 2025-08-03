import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProvidersNoRouter, mockLocalStorage, createMockSettings } from '@test/utils.jsx'
import App from '../../App'

describe('Application Integration', () => {
  beforeEach(() => {
    // Mock all localStorage data
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify(createMockSettings()),
      'widget-layout': JSON.stringify({
        columns: 3,
        gap: 16,
        widgets: []
      }),
      'notes-data': JSON.stringify([])
    })

    // Mock APIs
    global.fetch = vi.fn()
    
    // Mock geolocation
    navigator.geolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: { latitude: 40.7128, longitude: -74.0060 }
        })
      })
    }
  })

  it('loads application successfully', async () => {
    renderWithProvidersNoRouter(<App />)
    
    // Should show main navigation
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/tools/i)).toBeInTheDocument()
    
    // Should show default widgets (weather is enabled by default now)
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })

  it('navigates between pages correctly', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Navigate to Tools page
    await user.click(screen.getByText(/tools/i))
    await waitFor(() => {
      expect(screen.getByText(/notes/i)).toBeInTheDocument()
    })
    
    // Check that links section is visible on home page
    await waitFor(() => {
      expect(screen.getByText(/links/i)).toBeInTheDocument()
    })
    
    // Navigate back to Home
    await user.click(screen.getByText(/home/i))
    await waitFor(() => {
      expect(screen.getByText(/weather/i)).toBeInTheDocument()
    })
  })

  it('handles full user workflow', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // 1. User navigates to tools
    await user.click(screen.getByText(/tools/i))
    
    // 2. User can see notes tool
    expect(screen.getByText(/notes/i)).toBeInTheDocument()
    
    // 3. User scrolls to links section
    // Links are now on the home page
    
    // 6. User searches links
    const searchInput = screen.getByPlaceholderText(/search links/i)
    await user.type(searchInput, 'design')
    
    // Should filter links
    await waitFor(() => {
      expect(screen.getByText(/design/i)).toBeInTheDocument()
    })
  })

  it('persists user preferences across sessions', async () => {
    const user = userEvent.setup()
    
    // First session - user changes settings
    const { unmount } = renderWithProvidersNoRouter(<App />)
    
    // Navigate to home and check weather widget is visible
    await waitFor(() => {
      expect(screen.getByText(/weather/i)).toBeInTheDocument()
    })
    
    // Unmount component
    unmount()
    
    // Second session - settings should be preserved
    renderWithProvidersNoRouter(<App />)
    
    // Weather widget should still be visible
    await waitFor(() => {
      expect(screen.getByText(/weather/i)).toBeInTheDocument()
    })
  })

  it('handles errors gracefully throughout the application', async () => {
    // Mock API errors
    global.fetch.mockRejectedValue(new Error('Network error'))
    
    renderWithProvidersNoRouter(<App />)
    
    // Should show error state instead of crashing
    await waitFor(() => {
      expect(screen.getByText(/weather/i)).toBeInTheDocument()
    })
    
    // Rest of the app should still work
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/tools/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation throughout the app', async () => {
    const user = userEvent.setup()
    renderWithProvidersNoRouter(<App />)
    
    // Tab through navigation
    await user.tab()
    expect(screen.getByText(/home/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByText(/tools/i)).toHaveFocus()
    
    // Links navigation removed, skip this test
    
    // Navigate with Enter
    await user.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.getByText(/curated links/i)).toBeInTheDocument()
    })
  })

  it('handles offline mode correctly', async () => {
    const user = userEvent.setup()
    
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    renderWithProvidersNoRouter(<App />)
    
    // Local features should still work
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
    
    // Notes should work offline
    await user.click(screen.getByText(/tools/i))
    expect(screen.getByText(/notes/i)).toBeInTheDocument()
  })

  it('handles data migration correctly', async () => {
    // Mock old version data
    mockLocalStorage({
      'personal-portal-settings-v1': JSON.stringify({
        widgets: { weather: true }
      })
    })
    
    renderWithProvidersNoRouter(<App />)
    
    // Should migrate old data to new format
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'personal-portal-settings',
        expect.stringContaining('"version":"1.0.0"')
      )
    })
  })

  it('supports responsive design changes', async () => {
    renderWithProvidersNoRouter(<App />)
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
    
    await waitFor(() => {
      // Navigation should still be visible
      expect(screen.getByText(/home/i)).toBeInTheDocument()
    })
  })

  it('handles service worker registration', async () => {
    // Mock service worker
    const mockServiceWorker = {
      register: vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: { state: 'activated' }
      })
    }
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker
    })
    
    renderWithProvidersNoRouter(<App />)
    
    await waitFor(() => {
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
    })
  })

  it('handles update notifications', async () => {
    const user = userEvent.setup()
    
    // Mock update available
    mockLocalStorage({
      'personal-portal-update-available': JSON.stringify({
        available: true,
        latestVersion: '1.1.0',
        currentVersion: '1.0.0',
        releaseUrl: 'https://github.com/test/repo/releases/tag/v1.1.0'
      })
    })
    
    renderWithProvidersNoRouter(<App />)
    
    // Should show update notification
    await waitFor(() => {
      expect(screen.getByText(/update available/i)).toBeInTheDocument()
    })
    
    // User can dismiss notification
    const dismissButton = screen.getByLabelText(/dismiss/i)
    await user.click(dismissButton)
    
    expect(screen.queryByText(/update available/i)).not.toBeInTheDocument()
  })

  it('maintains performance with many widgets enabled', async () => {
    // Enable all widgets
    const allWidgetsSettings = createMockSettings()
    Object.keys(allWidgetsSettings.widgets).forEach(key => {
      allWidgetsSettings.widgets[key].visible = true
    })
    
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify(allWidgetsSettings)
    })
    
    const startTime = performance.now()
    renderWithProvidersNoRouter(<App />)
    const renderTime = performance.now() - startTime
    
    // Should render in reasonable time even with all widgets
    expect(renderTime).toBeLessThan(1000)
    
    // Available widgets should be present
    expect(screen.getByText(/weather/i)).toBeInTheDocument()
  })
})