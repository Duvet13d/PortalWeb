import { motion } from 'framer-motion'
import { useState } from 'react'
import MaskTextReveal from '../MaskTextReveal'
import WidgetManager, { WidgetSettingsPanel } from '../widgets/WidgetManager'
import { useScrollTrigger } from '../../hooks/useScrollTrigger'

const WidgetSection = () => {
  const [showSettings, setShowSettings] = useState(false)
  
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollTrigger({
    threshold: 0.1,
    rootMargin: '-100px',
    once: true
  })

  return (
    <section ref={sectionRef} className="min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <MaskTextReveal 
            className="font-heading text-2xl sm:text-3xl md:text-4xl text-white mb-4"
            delay={0.2}
          >
            YOUR WIDGETS
          </MaskTextReveal>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Customize your homepage with useful widgets. Only enabled widgets are shown below.
          </p>
        </motion.div>

        {/* Widget Manager */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <WidgetManager
            gridCols={{ sm: 1, md: 2, lg: 3, xl: 3 }}
            gap={6}
            staggerDelay={200}
            className="mb-8"
          />
        </motion.div>

        {/* Settings Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={sectionVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900/50 border border-gray-700 rounded-full text-white hover:border-accent-1 hover:bg-accent-1/10 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Widget Settings</span>
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Core widget system is now active with local storage persistence.
          </p>
        </motion.div>

        {/* Widget Settings Panel */}
        <WidgetSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </section>
  )
}

export default WidgetSection