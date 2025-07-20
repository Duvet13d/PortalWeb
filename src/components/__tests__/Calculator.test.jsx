import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@test/utils.jsx'
import Calculator from '../Calculator'

describe('Calculator', () => {
  beforeEach(() => {
    // Mock localStorage for calculator history
    vi.spyOn(localStorage, 'getItem').mockReturnValue(null)
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {})
  })

  it('renders calculator interface', () => {
    renderWithProviders(<Calculator />)
    
    expect(screen.getByTestId('calculator')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0')).toBeInTheDocument()
    
    // Check for number buttons
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }
    
    // Check for operator buttons
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('×')).toBeInTheDocument()
    expect(screen.getByText('÷')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
  })

  it('performs basic arithmetic operations', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Test addition: 5 + 3 = 8
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('='))
    
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
  })

  it('handles decimal numbers', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Test: 2.5 + 1.5 = 4
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('.'))
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('.'))
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('='))
    
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
  })

  it('handles expression input mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Switch to expression mode
    const expressionToggle = screen.getByLabelText(/expression mode/i)
    await user.click(expressionToggle)
    
    // Type expression directly
    const expressionInput = screen.getByPlaceholderText(/enter expression/i)
    await user.type(expressionInput, '10 + 5 * 2')
    await user.keyboard('{Enter}')
    
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
  })

  it('clears display with C button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Enter some numbers
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('3'))
    
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
    
    // Clear
    await user.click(screen.getByText('C'))
    
    expect(screen.getByDisplayValue('0')).toBeInTheDocument()
  })

  it('handles backspace with CE button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Enter some numbers
    await user.click(screen.getByText('1'))
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('3'))
    
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
    
    // Backspace
    await user.click(screen.getByText('CE'))
    
    expect(screen.getByDisplayValue('12')).toBeInTheDocument()
  })

  it('handles division by zero', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Test: 5 ÷ 0
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('÷'))
    await user.click(screen.getByText('0'))
    await user.click(screen.getByText('='))
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('handles invalid expressions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Switch to expression mode
    const expressionToggle = screen.getByLabelText(/expression mode/i)
    await user.click(expressionToggle)
    
    // Type invalid expression
    const expressionInput = screen.getByPlaceholderText(/enter expression/i)
    await user.type(expressionInput, '5 + + 3')
    await user.keyboard('{Enter}')
    
    expect(screen.getByText(/invalid expression/i)).toBeInTheDocument()
  })

  it('saves and displays calculation history', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Perform calculation
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('='))
    
    // Open history
    const historyButton = screen.getByLabelText(/history/i)
    await user.click(historyButton)
    
    expect(screen.getByText('5 + 3 = 8')).toBeInTheDocument()
  })

  it('supports keyboard input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Focus the calculator
    const calculator = screen.getByTestId('calculator')
    await user.click(calculator)
    
    // Type with keyboard
    await user.keyboard('5+3=')
    
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
  })

  it('handles percentage calculations', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Test: 50% of 200 = 100
    await user.click(screen.getByText('2'))
    await user.click(screen.getByText('0'))
    await user.click(screen.getByText('0'))
    await user.click(screen.getByText('×'))
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('0'))
    await user.click(screen.getByText('%'))
    
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
  })

  it('handles memory functions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Calculate 5 + 3 = 8
    await user.click(screen.getByText('5'))
    await user.click(screen.getByText('+'))
    await user.click(screen.getByText('3'))
    await user.click(screen.getByText('='))
    
    // Store in memory
    await user.click(screen.getByText('MS'))
    
    // Clear display
    await user.click(screen.getByText('C'))
    
    // Recall from memory
    await user.click(screen.getByText('MR'))
    
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
  })

  it('is accessible', () => {
    renderWithProviders(<Calculator />)
    
    const calculator = screen.getByTestId('calculator')
    expect(calculator).toHaveAttribute('role', 'application')
    expect(calculator).toHaveAttribute('aria-label', 'Calculator')
    
    // Number buttons should have proper labels
    const button5 = screen.getByText('5')
    expect(button5).toHaveAttribute('aria-label', 'Five')
    
    // Display should be readable by screen readers
    const display = screen.getByDisplayValue('0')
    expect(display).toHaveAttribute('aria-live', 'polite')
    expect(display).toHaveAttribute('aria-label', 'Calculator display')
  })

  it('supports scientific mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Toggle scientific mode
    const scientificToggle = screen.getByLabelText(/scientific mode/i)
    await user.click(scientificToggle)
    
    // Should show additional scientific functions
    expect(screen.getByText('sin')).toBeInTheDocument()
    expect(screen.getByText('cos')).toBeInTheDocument()
    expect(screen.getByText('tan')).toBeInTheDocument()
    expect(screen.getByText('log')).toBeInTheDocument()
  })

  it('handles complex calculations', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Calculator />)
    
    // Switch to expression mode for complex calculation
    const expressionToggle = screen.getByLabelText(/expression mode/i)
    await user.click(expressionToggle)
    
    // Test: (5 + 3) * 2 - 4 / 2 = 14
    const expressionInput = screen.getByPlaceholderText(/enter expression/i)
    await user.type(expressionInput, '(5 + 3) * 2 - 4 / 2')
    await user.keyboard('{Enter}')
    
    expect(screen.getByDisplayValue('14')).toBeInTheDocument()
  })

  it('persists settings across sessions', async () => {
    const user = userEvent.setup()
    
    // Mock localStorage to return saved settings
    vi.spyOn(localStorage, 'getItem').mockReturnValue(
      JSON.stringify({
        mode: 'scientific',
        theme: 'dark',
        precision: 4
      })
    )
    
    renderWithProviders(<Calculator />)
    
    // Should load in scientific mode
    expect(screen.getByText('sin')).toBeInTheDocument()
  })
})