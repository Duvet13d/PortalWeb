import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 p-4 sm:p-6 flex justify-between items-center backdrop-blur-sm bg-black bg-opacity-20">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 lg:space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-heading text-base lg:text-lg transition-colors duration-300 ${
                isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
              }`
            }
          >
            HOME
          </NavLink>
          <NavLink
            to="/tools"
            className={({ isActive }) =>
              `font-heading text-base lg:text-lg transition-colors duration-300 ${
                isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
              }`
            }
          >
            TOOLS
          </NavLink>
          <NavLink
            to="/links"
            className={({ isActive }) =>
              `font-heading text-base lg:text-lg transition-colors duration-300 ${
                isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
              }`
            }
          >
            LINKS
          </NavLink>
        </nav>

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
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `font-heading text-3xl transition-colors duration-300 ${
                  isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
                }`
              }
            >
              HOME
            </NavLink>
            <NavLink
              to="/tools"
              onClick={closeMenu}
              className={({ isActive }) =>
                `font-heading text-3xl transition-colors duration-300 ${
                  isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
                }`
              }
            >
              TOOLS
            </NavLink>
            <NavLink
              to="/links"
              onClick={closeMenu}
              className={({ isActive }) =>
                `font-heading text-3xl transition-colors duration-300 ${
                  isActive ? 'text-accent-1' : 'text-white hover:text-accent-2'
                }`
              }
            >
              LINKS
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header 