import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLocalStorage, mockApiResponses } from '@test/utils.jsx'
import WeatherWidget from '../WeatherWidget'

describe('WeatherWidget', () => {
  beforeEach(() => {
    mockLocalStorage({
      'widget-settings-weather': JSON.stringify({
        location: 'auto',
        units: 'metric',
        showForecast: true
      })
    })
    
    // Mock geolocation
    navigator.geolocation.getCurrentPosition = vi.fn((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      })
    })
    
    // Mock weather API
    global.fetch = vi.fn()
  })

  it('renders weather widget', () => {
    renderWithProviders(<WeatherWidget />)
    
    expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
  })

  it('displays current weather data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.weather.current)
    })
    
    renderWithProviders(<WeatherWidget />)
    
    await waitFor(() => {
      expect(screen.getByText('22°C')).toBeInTheDocument()
      expect(screen.getByText('Clear sky')).toBeInTheDocument()
      expect(screen.getByText(/feels like 24°C/i)).toBeInTheDocument()
    })
  })

  it('displays weather forecast when enabled', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.weather.current)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ list: mockApiResponses.weather.forecast })
      })
    
    renderWithProviders(<WeatherWidget />)
    
    await waitFor(() => {
      expect(screen.getByText('25°C')).toBeInTheDocument()
      expect(screen.getByText('Sunny')).toBeInTheDocument()
    })
  })

  it('handles geolocation permission denied', async () => {
    navigator.geolocation.getCurrentPosition = vi.fn((success, error) => {
      error({ code: 1, message: 'Permission denied' })
    })
    
    renderWithProviders(<WeatherWidget />)
    
    await waitFor(() => {
      expect(screen.getByText(/location access denied/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'))
    
    renderWithProviders(<WeatherWidget />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load weather/i)).toBeInTheDocument()
    })
  })

  it('switches between metric and imperial units', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.weather.current)
    })
    
    renderWithProviders(<WeatherWidget />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('22°C')).toBeInTheDocument()
    })
    
    // Open settings
    const settingsButton = screen.getByLabelText(/weather settings/i)
    await user.click(settingsButton)
    
    // Change to imperial
    const unitsSelect = screen.getByLabelText(/units/i)
    await user.selectOptions(unitsSelect, 'imperial')
    
    // Save settings
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'widget-settings-weather',
      expect.stringContaining('"units":"imperial"')
    )
  })

  it('allows manual location entry', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WeatherWidget />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/weather settings/i)
    await user.click(settingsButton)
    
    // Change to manual location
    const locationSelect = screen.getByLabelText(/location/i)
    await user.selectOptions(locationSelect, 'manual')
    
    // Enter city name
    const cityInput = screen.getByLabelText(/city name/i)
    await user.type(cityInput, 'New York')
    
    // Save settings
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'widget-settings-weather',
      expect.stringContaining('"location":"New York"')
    )
  })

  it('refreshes weather data', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.weather.current)
    })
    
    renderWithProviders(<WeatherWidget />)
    
    await waitFor(() => {
      expect(screen.getByText('22°C')).toBeInTheDocument()
    })
    
    // Click refresh button
    const refreshButton = screen.getByLabelText(/refresh weather/i)
    await user.click(refreshButton)
    
    // Should make another API call
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('shows loading state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders(<WeatherWidget />)
    
    expect(screen.getByText(/loading weather/i)).toBeInTheDocument()
  })

  it('toggles forecast display', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WeatherWidget />)
    
    // Open settings
    const settingsButton = screen.getByLabelText(/weather settings/i)
    await user.click(settingsButton)
    
    // Toggle forecast off
    const forecastToggle = screen.getByLabelText(/show forecast/i)
    await user.click(forecastToggle)
    
    // Save settings
    const saveButton = screen.getByText(/save/i)
    await user.click(saveButton)
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'widget-settings-weather',
      expect.stringContaining('"showForecast":false')
    )
  })

  it('is accessible', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponses.weather.current)
    })
    
    renderWithProviders(<WeatherWidget />)
    
    const widget = screen.getByTestId('weather-widget')
    expect(widget).toHaveAttribute('role', 'region')
    expect(widget).toHaveAttribute('aria-label', 'Weather information')
    
    await waitFor(() => {
      const temperature = screen.getByText('22°C')
      expect(temperature).toHaveAttribute('aria-label', 'Current temperature 22 degrees Celsius')
    })
  })

  it('handles network offline state', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    renderWithProviders(<WeatherWidget />)
    
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })
})