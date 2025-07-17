import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import ThemeCustomizer from './theme/ThemeCustomizer'

const navLinks = [
  { name: 'Home', path: './' },
  { name: 'Tools', path: './tools' },
  { name: 'Links', path: './links' },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleThemeCustomizer = () => {
    setIsThemeCustomizerOpen(!isThemeCustomizerOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 flex justify-between items-center backdrop-blur-sm bg-black bg-opacity-20">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <nav className="flex space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `font-heading text-base lg:text-lg transition-colors duration-300 ${
                    isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Theme Customizer Button */}
          <button
            onClick={toggleThemeCustomizer}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Customize Theme"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 z-50"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black bg-opacity-95 flex flex-col justify-center items-center space-y-8"
          >
            <ul className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `font-heading text-3xl transition-colors duration-300 ${
                        isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
              
              {/* Mobile Theme Button */}
              <li>
                <button
                  onClick={() => {
                    toggleThemeCustomizer()
                    closeMenu()
                  }}
                  className="font-heading text-3xl text-white hover:text-accent-2 transition-colors duration-300 flex items-center gap-3"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  Theme
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Customizer */}
      <ThemeCustomizer 
        isOpen={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />
    </>
  )
}

export default Header 