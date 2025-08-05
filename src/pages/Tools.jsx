import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import MaskTextReveal from '../components/MaskTextReveal'
import Notes from '../components/tools/Notes'
import ThemeCustomizer from '../components/tools/ThemeCustomizer'
import { ToolErrorBoundary } from '../components/ErrorBoundary'

const Tools = () => {
  const notesRef = useRef(null)
  const themeRef = useRef(null)

  // Keyboard shortcuts for quick tool access
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts when not typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      // Alt + key combinations for tool shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault()
            notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Focus the notes textarea if available
            setTimeout(() => {
              const notesTextarea = document.querySelector('#notes-tool textarea')
              notesTextarea?.focus()
            }, 500)
            break
          case 't':
            e.preventDefault()
            themeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            break
          default:
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <MaskTextReveal 
          className="font-heading text-3xl sm:text-4xl md:text-6xl text-white text-center mb-4"
          delay={0.1}
        >
          TOOLS
        </MaskTextReveal>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="text-gray-300 text-base sm:text-lg text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-2"
        >
          Useful utilities for everyday tasks. Simple, clean, and functional.
        </motion.p>

        {/* Theme Customizer Tool */}
        <motion.div
          ref={themeRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
          id="theme-tool"
        >
          <div className="mb-6 sm:mb-8">
            <h2 className="font-heading text-xl sm:text-2xl text-white mb-2 text-center">Theme Customizer</h2>
            <p className="text-gray-400 text-sm text-center">
              Customize your portal's appearance with themes and colors.
            </p>
          </div>
          <ToolErrorBoundary toolName="Theme Customizer">
            <ThemeCustomizer />
          </ToolErrorBoundary>
        </motion.div>

        {/* Notes Tool - Full Width */}
        <motion.div
          ref={notesRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-12"
          id="notes-tool"
        >
          <div className="mb-6 sm:mb-8">
            <h2 className="font-heading text-xl sm:text-2xl text-white mb-2 text-center">Notes</h2>
            <p className="text-gray-400 text-sm text-center">
              Quick note-taking with markdown support and auto-save functionality.
            </p>
          </div>
          <ToolErrorBoundary toolName="Notes">
            <Notes />
          </ToolErrorBoundary>
        </motion.div>

        {/* Keyboard Shortcuts Help */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-16 p-6 bg-gray-900/30 border border-gray-700 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Keyboard Shortcuts</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Alt</kbd>
              <span className="text-gray-400">+</span>
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">T</kbd>
              <span className="text-gray-300 ml-2">Theme Customizer</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">Alt</kbd>
              <span className="text-gray-400">+</span>
              <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-accent-1 font-mono">N</kbd>
              <span className="text-gray-300 ml-2">Focus Notes</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Tools 