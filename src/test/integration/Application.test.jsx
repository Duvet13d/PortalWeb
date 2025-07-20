import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLocalStorage, createMockSettings } from '@test/utils.jsx'
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
      'notes-data': JSON.stringify([]),
      'calculator-history': JSON.stringify([])
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
    renderWithProviders(<App />)
    
    // Should show main navigation
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/tools/i)).toBeInTheDocument()
    expect(screen.getByText(/links/i)).toBeInTheDocument()
    
    // Should show default widgets
    expect(screen.getByTestId('search-widget')).toBeInTheDocument()
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
  })

  it('navigates between pages correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Navigate to Tools page
    await user.click(screen.getByText(/tools/i))
    await waitFor(() => {
      expect(screen.getByText(/calculator/i)).toBeInTheDocument()
    })
    
    // Navigate to Links page
    await user.click(screen.getByText(/links/i))
    await waitFor(() => {
      expect(screen.getByText(/curated links/i)).toBeInTheDocument()
    })
    
    // Navigate back to Home
    await user.click(screen.getByText(/home/i))
    await waitFor(() => {
      expect(screen.getByTestId('search-widget')).toBeInTheDocument()
    })
  })

  it('handles full user workflow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // 1. User opens settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // 2. User enables weather widget
    const weatherToggle = screen.getByLabelText(/weather widget/i)
    await user.click(weatherToggle)
    
    // 3. User saves settings
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // 4. Weather widget should appear
    await waitFor(() => {
      expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
    })
    
    // 5. User navigates to tools
    await user.click(screen.getByText(/tools/i))
    
    // 6. User opens calculator
    const calculatorButton = screen.getByText(/calculator/i)
    await user.click(calculatorButton)
    
    // 7. User performs calculation
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('='))
    
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    
    // 8. User closes calculator
    const closeButton = screen.getByLabelText(/close/i)
    await user.click(closeButton)
    
    // 9. User navigates to links
    await user.click(screen.getByText(/links/i))
    
    // 10. User searches links
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
    const { unmount } = renderWithProviders(<App />)
    
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // Change theme
    const themeTab = screen.getByText(/theme/i)
    await user.click(themeTab)
    
    const lightTheme = screen.getByLabelText(/light theme/i)
    await user.click(lightTheme)
    
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Unmount component
    unmount()
    
    // Second session - settings should be preserved
    renderWithProviders(<App />)
    
    // Theme should still be light
    expect(document.body).toHaveClass('theme-light')
  })

  it('handles errors gracefully throughout the application', async () => {
    const user = userEvent.setup()
    
    // Mock API errors
    global.fetch.mockRejectedValue(new Error('Network error'))
    
    renderWithProviders(<App />)
    
    // Enable weather widget (which will fail)
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    const weatherToggle = screen.getByLabelText(/weather widget/i)
    await user.click(weatherToggle)
    
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Should show error state instead of crashing
    await waitFor(() => {
      expect(screen.getByText(/failed to load weather/i)).toBeInTheDocument()
    })
    
    // Rest of the app should still work
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
    expect(screen.getByTestId('search-widget')).toBeInTheDocument()
  })

  it('supports keyboard navigation throughout the app', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Tab through navigation
    await user.tab()
    expect(screen.getByText(/home/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByText(/tools/i)).toHaveFocus()
    
    await user.tab()
    expect(screen.getByText(/links/i)).toHaveFocus()
    
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
    
    renderWithProviders(<App />)
    
    // Should show offline indicator
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
    
    // Local features should still work
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
    
    // Calculator should work offline
    await user.click(screen.getByText(/tools/i))
    const calculatorButton = screen.getByText(/calculator/i)
    await user.click(calculatorButton)
    
    expect(screen.getByTestId('calculator')).toBeInTheDocument()
  })

  it('handles data migration correctly', async () => {
    // Mock old version data
    mockLocalStorage({
      'personal-portal-settings-v1': JSON.stringify({
        widgets: { clock: true, search: true }
      })
    })
    
    renderWithProviders(<App />)
    
    // Should migrate old data to new format
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'personal-portal-settings',
        expect.stringContaining('"version":"1.0.0"')
      )
    })
  })

  it('supports responsive design changes', async () => {
    renderWithProviders(<App />)
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
    
    await waitFor(() => {
      // Mobile menu should be visible
      expect(screen.getByLabelText(/menu/i)).toBeInTheDocument()
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
    
    renderWithProviders(<App />)
    
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
    
    renderWithProviders(<App />)
    
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
    const user = userEvent.setup()
    
    // Enable all widgets
    const allWidgetsSettings = createMockSettings()
    Object.keys(allWidgetsSettings.widgets).forEach(key => {
      allWidgetsSettings.widgets[key].visible = true
    })
    
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify(allWidgetsSettings)
    })
    
    const startTime = performance.now()
    renderWithProviders(<App />)
    const renderTime = performance.now() - startTime
    
    // Should render in reasonable time even with all widgets
    expect(renderTime).toBeLessThan(1000)
    
    // All widgets should be present
    expect(screen.getByTestId('search-widget')).toBeInTheDocument()
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
    expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
    expect(screen.getByTestId('spotify-widget')).toBeInTheDocument()
    expect(screen.getByTestId('notes-widget')).toBeInTheDocument()
  })
})