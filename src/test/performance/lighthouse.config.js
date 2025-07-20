module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-valid-attr': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'warn',
        
        // SEO
        'meta-description': 'warn',
        'document-title': 'error',
        
        // PWA
        'service-worker': 'warn',
        'installable-manifest': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}