// Simple test utilities
import React from 'react'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <HashRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </HashRouter>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'