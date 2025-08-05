import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
// Removed complex theme customizer and settings panel

const navLinks = [
  { name: 'Home', path: './' },
  { name: 'Tools', path: './tools' },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Simplified header without complex settings

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Removed complex toggle functions

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
                    isActive ? 'text-accent-1' : 'text-text-primary hover:text-accent-2'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Simplified header - removed complex settings */}
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
          <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
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
                          isActive ? 'text-accent-1' : 'text-text-primary hover:text-accent-2'
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
                
                {/* Simplified mobile menu */}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified header - removed complex panels */}
    </>
  )
}

export default Header 