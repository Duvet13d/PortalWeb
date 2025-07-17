import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Home from './pages/Home'
import Tools from './pages/Tools'
import Links from './pages/Links'
import PageTransition from './components/PageTransition'
import { WidgetProvider } from './contexts/WidgetContext'
import { ThemeProvider } from './contexts/ThemeContext'
import useScrollToTop from './hooks/useScrollToTop'

function AnimatedRoutes() {
  const location = useLocation()
  useScrollToTop()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
        <Route path="/links" element={<PageTransition><Links /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ThemeProvider>
      <WidgetProvider>
        <Router>
          <div className="min-h-screen bg-black text-white">
            <Header />
            <AnimatedRoutes />
          </div>
        </Router>
      </WidgetProvider>
    </ThemeProvider>
  )
}

export default App 