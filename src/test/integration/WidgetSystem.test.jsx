import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLocalStorage, createMockSettings } from '@test/utils'
import App from '../../App'

describe('Widget System Integration', () => {
  beforeEach(() => {
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify(createMockSettings()),
      'widget-layout': JSON.stringify({
        columns: 3,
        gap: 16,
        widgets: [
          { id: 'search', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
          { id: 'clock', position: { x: 2, y: 0 }, size: { w: 1, h: 1 } }
        ]
      })
    })
  })

  it('loads and displays enabled widgets', async () => {
    renderWithProviders(<App />)
    
    // Navigate to home page
    expect(screen.getByTestId('search-widget')).toBeInTheDocument()
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
  })

  it('opens and closes settings panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    expect(screen.getByText(/widget settings/i)).toBeInTheDocument()
    
    // Close settings
    const closeButton = screen.getByLabelText(/close settings/i)
    await user.click(closeButton)
    
    expect(screen.queryByText(/widget settings/i)).not.toBeInTheDocument()
  })

  it('toggles widget visibility', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // Toggle weather widget on
    const weatherToggle = screen.getByLabelText(/weather widget/i)
    await user.click(weatherToggle)
    
    // Save settings
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Weather widget should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
    })
  })

  it('persists widget settings across sessions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open settings and change something
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    const notesToggle = screen.getByLabelText(/notes widget/i)
    await user.click(notesToggle)
    
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'personal-portal-settings',
      expect.stringContaining('"notes":{"visible":true')
    )
  })

  it('handles widget errors gracefully', async () => {
    // Mock a widget that throws an error
    vi.mock('../../components/widgets/WeatherWidget', () => ({
      default: () => {
        throw new Error('Widget error')
      }
    }))
    
    mockLocalStorage({
      'personal-portal-settings': JSON.stringify({
        ...createMockSettings(),
        widgets: {
          ...createMockSettings().widgets,
          weather: { visible: true }
        }
      })
    })
    
    renderWithProviders(<App />)
    
    // Should show error boundary instead of crashing
    expect(screen.getByText(/widget error/i)).toBeInTheDocument()
  })

  it('resets settings to defaults', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // Click reset button
    const resetButton = screen.getByText(/reset to defaults/i)
    await user.click(resetButton)
    
    // Confirm reset
    const confirmButton = screen.getByText(/confirm/i)
    await user.click(confirmButton)
    
    // Should reset to default settings
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'personal-portal-settings',
      expect.stringContaining('"search":{"visible":true')
    )
  })

  it('exports and imports settings', async () => {
    const user = userEvent.setup()
    
    // Mock URL.createObjectURL for export
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockClick = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL })
    
    const mockElement = { click: mockClick, href: '', download: '' }
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement)
    
    renderWithProviders(<App />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // Export settings
    const exportButton = screen.getByText(/export settings/i)
    await user.click(exportButton)
    
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })

  it('handles drag and drop widget reordering', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Enable edit mode
    const editButton = screen.getByLabelText(/edit layout/i)
    await user.click(editButton)
    
    // Widgets should now be draggable
    const clockWidget = screen.getByTestId('clock-widget')
    expect(clockWidget).toHaveAttribute('draggable', 'true')
    
    // Simulate drag and drop (simplified)
    const searchWidget = screen.getByTestId('search-widget')
    
    // This is a simplified test - real drag and drop testing would be more complex
    await user.pointer([
      { keys: '[MouseLeft>]', target: clockWidget },
      { coords: { x: 100, y: 100 } },
      { keys: '[/MouseLeft]' }
    ])
    
    // Layout should be updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'widget-layout',
      expect.stringContaining('position')
    )
  })

  it('responds to keyboard shortcuts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Ctrl+, should open settings
    await user.keyboard('{Control>},{/Control}')
    expect(screen.getByText(/widget settings/i)).toBeInTheDocument()
    
    // Escape should close settings
    await user.keyboard('{Escape}')
    expect(screen.queryByText(/widget settings/i)).not.toBeInTheDocument()
  })

  it('handles offline mode', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    renderWithProviders(<App />)
    
    // Should show offline indicator
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
    
    // Widgets should still work with cached data
    expect(screen.getByTestId('clock-widget')).toBeInTheDocument()
  })

  it('updates widgets when settings change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open clock settings
    const clockWidget = screen.getByTestId('clock-widget')
    const clockSettings = clockWidget.querySelector('[aria-label*="settings"]')
    await user.click(clockSettings)
    
    // Change time format
    const formatToggle = screen.getByLabelText(/12-hour format/i)
    await user.click(formatToggle)
    
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Clock should update to show new format
    await waitFor(() => {
      expect(screen.getByText(/AM|PM/)).toBeInTheDocument()
    })
  })

  it('handles theme changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/open settings/i)
    await user.click(settingsButton)
    
    // Go to theme tab
    const themeTab = screen.getByText(/theme/i)
    await user.click(themeTab)
    
    // Change accent color
    const colorPicker = screen.getByLabelText(/accent color/i)
    await user.click(colorPicker)
    
    // Select a color (simplified)
    const redColor = screen.getByLabelText(/red/i)
    await user.click(redColor)
    
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    // Theme should be applied
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'personal-portal-settings',
      expect.stringContaining('"accentColor":"#ff0000"')
    )
  })
})