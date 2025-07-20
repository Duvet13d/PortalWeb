import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import { WidgetProvider } from '../contexts/WidgetContext'

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialEntries = ['/'],
    withRouter = true,
    ...renderOptions
  } = options

  function Wrapper({ children }) {
    const content = (
      <ThemeProvider>
        <WidgetProvider>
          {children}
        </WidgetProvider>
      </ThemeProvider>
    )

    if (withRouter) {
      return <HashRouter>{content}</HashRouter>
    }
    
    return content
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Render function for components that already have a router (like App)
export function renderWithProvidersNoRouter(ui, options = {}) {
  return renderWithProviders(ui, { ...options, withRouter: false })
}

// Mock widget data
export const mockWidgetData = {
  clock: {
    id: 'clock',
    name: 'Clock',
    visible: true,
    settings: {
      format: '24h',
      timezone: 'local',
      showDate: true,
      showSeconds: false
    }
  },
  weather: {
    id: 'weather',
    name: 'Weather',
    visible: false,
    settings: {
      location: 'auto',
      units: 'metric',
      showForecast: true
    }
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    visible: false,
    settings: {
      showControls: true,
      showRecentlyPlayed: true
    }
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    visible: false,
    settings: {
      autoSave: true,
      markdown: true
    }
  },
  search: {
    id: 'search',
    name: 'Search',
    visible: true,
    settings: {
      defaultEngine: 'google',
      suggestions: true,
      shortcuts: true
    }
  }
}

// Mock API responses
export const mockApiResponses = {
  weather: {
    current: {
      temp: 22,
      feels_like: 24,
      humidity: 65,
      description: 'Clear sky',
      icon: '01d',
      wind_speed: 3.2
    },
    forecast: [
      { date: '2024-01-01', temp_max: 25, temp_min: 18, description: 'Sunny', icon: '01d' },
      { date: '2024-01-02', temp_max: 23, temp_min: 16, description: 'Cloudy', icon: '02d' },
      { date: '2024-01-03', temp_max: 20, temp_min: 14, description: 'Rain', icon: '10d' }
    ]
  },
  spotify: {
    currentlyPlaying: {
      is_playing: true,
      item: {
        name: 'Test Song',
        artists: [{ name: 'Test Artist' }],
        album: { name: 'Test Album', images: [{ url: 'test-image.jpg' }] },
        duration_ms: 180000,
        progress_ms: 90000
      }
    },
    recentlyPlayed: {
      items: [
        {
          track: {
            name: 'Recent Song 1',
            artists: [{ name: 'Artist 1' }],
            album: { name: 'Album 1' }
          },
          played_at: '2024-01-01T12:00:00Z'
        },
        {
          track: {
            name: 'Recent Song 2',
            artists: [{ name: 'Artist 2' }],
            album: { name: 'Album 2' }
          },
          played_at: '2024-01-01T11:30:00Z'
        }
      ]
    }
  },
  currency: {
    rates: {
      USD: 0.13,
      JPY: 18.5,
      CNY: 0.9
    }
  }
}

// Test data generators
export function createMockWidget(overrides = {}) {
  return {
    id: 'test-widget',
    name: 'Test Widget',
    visible: true,
    settings: {},
    ...overrides
  }
}

export function createMockSettings(overrides = {}) {
  return {
    widgets: mockWidgetData,
    theme: {
      name: 'dark',
      accentColor: '#dd0000',
      background: 'solid'
    },
    layout: {
      columns: 3,
      gap: 16
    },
    ...overrides
  }
}

// Wait utilities
export function waitForNextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock fetch responses
export function mockFetch(response, options = {}) {
  const { status = 200, ok = true, delay = 0 } = options
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ok,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response))
      })
    }, delay)
  })
}

// Error simulation
export function simulateError(message = 'Test error') {
  throw new Error(message)
}

// Local storage helpers
export function mockLocalStorage(data = {}) {
  const storage = { ...data }
  
  localStorage.getItem.mockImplementation(key => storage[key] || null)
  localStorage.setItem.mockImplementation((key, value) => {
    storage[key] = value
  })
  localStorage.removeItem.mockImplementation(key => {
    delete storage[key]
  })
  localStorage.clear.mockImplementation(() => {
    Object.keys(storage).forEach(key => delete storage[key])
  })
  
  return storage
}

// Performance testing helpers
export function measureRenderTime(renderFn) {
  const start = performance.now()
  const result = renderFn()
  const end = performance.now()
  
  return {
    result,
    renderTime: end - start
  }
}

// Accessibility testing helpers
export function getAccessibilityViolations(container) {
  // This would integrate with axe-core in a real implementation
  const violations = []
  
  // Check for missing alt text
  const images = container.querySelectorAll('img:not([alt])')
  if (images.length > 0) {
    violations.push({
      rule: 'image-alt',
      description: 'Images must have alternative text',
      elements: Array.from(images)
    })
  }
  
  // Check for missing labels
  const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
  if (inputs.length > 0) {
    violations.push({
      rule: 'label',
      description: 'Form elements must have labels',
      elements: Array.from(inputs)
    })
  }
  
  return violations
}

export * from '@testing-library/react'