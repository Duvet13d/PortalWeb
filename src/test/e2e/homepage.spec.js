import { test, expect } from '@playwright/test'

test.describe('Personal Portal Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Personal Portal/)
    await expect(page.locator('h1')).toContainText('Personal Portal')
  })

  test('displays default widgets', async ({ page }) => {
    // Search widget should be visible
    await expect(page.getByTestId('search-widget')).toBeVisible()
    
    // Clock widget should be visible
    await expect(page.getByTestId('clock-widget')).toBeVisible()
    
    // Weather widget should be hidden by default
    await expect(page.getByTestId('weather-widget')).not.toBeVisible()
  })

  test('search functionality works', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('test query')
    
    // Mock window.open to prevent actual navigation
    await page.evaluate(() => {
      window.open = (url) => {
        window.lastOpenedUrl = url
      }
    })
    
    await searchInput.press('Enter')
    
    const openedUrl = await page.evaluate(() => window.lastOpenedUrl)
    expect(openedUrl).toContain('google.com/search?q=test+query')
  })

  test('clock displays current time', async ({ page }) => {
    const clockWidget = page.getByTestId('clock-widget')
    await expect(clockWidget).toBeVisible()
    
    // Should display time in HH:MM format
    await expect(clockWidget.locator('[data-testid="time-display"]')).toHaveText(/\d{1,2}:\d{2}/)
  })

  test('settings panel opens and closes', async ({ page }) => {
    // Open settings
    await page.getByLabel(/open settings/i).click()
    await expect(page.getByText(/widget settings/i)).toBeVisible()
    
    // Close settings
    await page.getByLabel(/close settings/i).click()
    await expect(page.getByText(/widget settings/i)).not.toBeVisible()
  })

  test('widget visibility can be toggled', async ({ page }) => {
    // Open settings
    await page.getByLabel(/open settings/i).click()
    
    // Enable weather widget
    await page.getByLabel(/weather widget/i).check()
    
    // Save settings
    await page.getByText(/save/i).click()
    
    // Weather widget should now be visible
    await expect(page.getByTestId('weather-widget')).toBeVisible()
  })

  test('navigation between pages works', async ({ page }) => {
    // Navigate to Tools page
    await page.getByText(/tools/i).click()
    await expect(page).toHaveURL(/.*#\/tools/)
    await expect(page.getByText(/notes/i)).toBeVisible()
    
    // Check that links section is visible on home page
    await expect(page.getByText(/links/i)).toBeVisible()
    
    // Navigate back to home
    await page.getByText(/home/i).click()
    await expect(page).toHaveURL(/.*#\//)
  })

  test('keyboard shortcuts work', async ({ page }) => {
    // Ctrl+, should open settings
    await page.keyboard.press('Control+Comma')
    await expect(page.getByText(/widget settings/i)).toBeVisible()
    
    // Escape should close settings
    await page.keyboard.press('Escape')
    await expect(page.getByText(/widget settings/i)).not.toBeVisible()
  })

  test('responsive design works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mobile menu should be visible
    await expect(page.getByLabel(/menu/i)).toBeVisible()
    
    // Widgets should stack vertically
    const widgets = page.locator('[data-testid*="widget"]')
    const count = await widgets.count()
    expect(count).toBeGreaterThan(0)
  })

  test('theme changes apply correctly', async ({ page }) => {
    // Open settings
    await page.getByLabel(/open settings/i).click()
    
    // Go to theme tab
    await page.getByText(/theme/i).click()
    
    // Change accent color
    await page.getByLabel(/accent color/i).click()
    await page.locator('[data-color="#00ff00"]').click()
    
    // Save settings
    await page.getByText(/save/i).click()
    
    // Check if theme was applied (look for green accent color)
    const accentElement = page.locator('.text-accent').first()
    await expect(accentElement).toHaveCSS('color', 'rgb(0, 255, 0)')
  })

  test('offline mode works', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true)
    
    // Reload page
    await page.reload()
    
    // Should show offline indicator
    await expect(page.getByText(/offline/i)).toBeVisible()
    
    // Basic functionality should still work
    await expect(page.getByTestId('clock-widget')).toBeVisible()
  })

  test('error boundaries catch widget errors', async ({ page }) => {
    // Inject an error into a widget
    await page.evaluate(() => {
      // Force an error in the weather widget
      window.localStorage.setItem('force-weather-error', 'true')
    })
    
    // Enable weather widget
    await page.getByLabel(/open settings/i).click()
    await page.getByLabel(/weather widget/i).check()
    await page.getByText(/save/i).click()
    
    // Should show error boundary instead of crashing
    await expect(page.getByText(/widget error/i)).toBeVisible()
  })

  test('data persistence works across sessions', async ({ page }) => {
    // Enable a widget
    await page.getByLabel(/open settings/i).click()
    await page.getByLabel(/notes widget/i).check()
    await page.getByText(/save/i).click()
    
    // Reload page
    await page.reload()
    
    // Widget should still be enabled
    await expect(page.getByTestId('notes-widget')).toBeVisible()
  })

  test('accessibility features work', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Test screen reader labels
    const searchWidget = page.getByTestId('search-widget')
    await expect(searchWidget).toHaveAttribute('aria-label')
    
    // Test color contrast (simplified check)
    const backgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    expect(backgroundColor).toBe('rgb(0, 0, 0)') // Black background
  })

  test('performance is acceptable', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load in under 3 seconds
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      }
    })
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000)
  })
})