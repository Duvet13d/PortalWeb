import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import ThemeCustomizer from './theme/ThemeCustomizer'
import SettingsPanel from './SettingsPanel'

const navLinks = [
  { name: 'Home', path: './' },
  { name: 'Tools', path: './tools' },
  { name: 'Links', path: './links' },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleThemeCustomizer = () => {
    setIsThemeCustomizerOpen(!isThemeCustomizerOpen)
  }

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(!isSettingsPanelOpen)
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
            aria-label="Open theme customization panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </button>

          {/* Settings Panel Button */}
          <button
            onClick={toggleSettingsPanel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
            aria-label="Open settings panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 z-50"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          data-menu-toggle
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
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black bg-opacity-95 flex flex-col justify-center items-center space-y-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <nav aria-labelledby="mobile-menu-title">
              <h2 id="mobile-menu-title" className="sr-only">Main Navigation</h2>
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
                    aria-label="Open theme customization panel"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    Theme
                  </button>
                </li>

                {/* Mobile Settings Button */}
                <li>
                  <button
                    onClick={() => {
                      toggleSettingsPanel()
                      closeMenu()
                    }}
                    className="font-heading text-3xl text-white hover:text-accent-2 transition-colors duration-300 flex items-center gap-3"
                    aria-label="Open settings panel"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Customizer */}
      <ThemeCustomizer 
        isOpen={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsPanelOpen} 
        onClose={() => setIsSettingsPanelOpen(false)} 
      />
    </>
  )
}

export default Header 