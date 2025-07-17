import { motion } from 'framer-motion'
import MaskTextReveal from '../components/MaskTextReveal'
import Calculator from '../components/Calculator'
import CurrencyConverter from '../components/CurrencyConverter'
import Notes from '../components/tools/Notes'

const Tools = () => {
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
          A collection of useful utilities for everyday tasks. Simple, clean, and functional.
        </motion.p>

        {/* Notes Tool - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
        >
          <div className="mb-6 sm:mb-8">
            <h2 className="font-heading text-xl sm:text-2xl text-white mb-2 text-center">Notes</h2>
            <p className="text-gray-400 text-sm text-center">
              Quick note-taking with markdown support and auto-save functionality.
            </p>
          </div>
          <Notes />
        </motion.div>

        {/* Calculator and Currency Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="font-heading text-xl sm:text-2xl text-white mb-2 text-center">Calculator</h2>
              <p className="text-gray-400 text-sm text-center">
                A clean, functional calculator for basic arithmetic operations.
              </p>
            </div>
            <Calculator />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="font-heading text-xl sm:text-2xl text-white mb-2 text-center">Currency Converter</h2>
              <p className="text-gray-400 text-sm text-center">
                Convert Hong Kong Dollar to major currencies with real-time rates.
              </p>
            </div>
            <CurrencyConverter />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Tools 