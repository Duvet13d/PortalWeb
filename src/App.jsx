import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import Header from './components/Header'
import PageTransition from './components/PageTransition'

import { ThemeProvider } from './contexts/ThemeContext'
import useScrollToTop from './hooks/useScrollToTop'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import { PageErrorBoundary } from './components/ErrorBoundary'
import OfflineMode from './components/OfflineMode'
import MigrationNotification from './components/MigrationNotification'
import UpdateNotification from './components/UpdateNotification'
import updateChecker from './utils/updateChecker'
import { skipLinkUtils } from './utils/accessibility'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Tools = lazy(() => import('./pages/Tools'))

// Component to handle scroll-to-top behavior
function ScrollToTop() {
  useScrollToTop();
  return null;
}

function AnimatedRoutes() {
  const location = useLocation()
  useKeyboardShortcuts()

  // Page loading fallback with accessibility
  const PageLoadingFallback = () => (
    <div 
      className="min-h-screen flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <div className="flex flex-col items-center space-y-4">
        <div 
          className="w-12 h-12 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin"
          aria-hidden="true"
        ></div>
        <span className="text-gray-300 text-lg">Loading page...</span>
      </div>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Suspense fallback={<PageLoadingFallback />}>
              <Home />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/tools" element={
          <PageTransition>
            <Suspense fallback={<PageLoadingFallback />}>
              <Tools />
            </Suspense>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  )
}

// Main app content that needs router context
function AppContent() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen text-white">
        <PageErrorBoundary pageName="Header">
          <Header />
        </PageErrorBoundary>
        <main id="main-content" tabIndex="-1">
          <PageErrorBoundary pageName="Routes">
            <AnimatedRoutes />
          </PageErrorBoundary>
        </main>
        <OfflineMode />
        <MigrationNotification />
        <UpdateNotification />
      </div>
    </>
  )
}

function App() {
  // Register service worker for offline functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  // Add skip links for accessibility
  useEffect(() => {
    skipLinkUtils.createSkipLink('main-content', 'Skip to main content')
  }, [])

  // Initialize update checker
  useEffect(() => {
    updateChecker.initAutoCheck()
  }, [])

  return (
    <PageErrorBoundary pageName="Application">
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
        </Router>
      </ThemeProvider>
    </PageErrorBoundary>
  )
}

export default App