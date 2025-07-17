import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import MaskTextReveal from '../MaskTextReveal'
import DynamicText from '../DynamicText'
import LandingSearchWidget from './LandingSearchWidget'

const LandingSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16">
      {/* Hero Content */}
      <div className="text-center max-w-6xl mx-auto mb-12">
        <MaskTextReveal 
          className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-white mb-6 sm:mb-8"
          splitByWords={true}
        >
          WELCOME TO
        </MaskTextReveal>
        
        <DynamicText 
          className="font-heading text-xl sm:text-2xl md:text-4xl lg:text-6xl text-accent-1 min-h-[60px] sm:min-h-[80px] flex items-center justify-center px-2"
          texts={[
            "YOUR HOMEPAGE",
            "PERSONAL PORTAL",
            "DIGITAL HUB",
            "BROWSER HOME"
          ]}
          interval={4000}
        />
      </div>

      {/* Search Bar */}
      <LandingSearchWidget className="mb-12" />

      {/* Navigation Links */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex gap-6 mb-16"
      >
        <Link
          to="/tools"
          className="group flex items-center gap-3 px-8 py-4 bg-gray-900/30 border border-gray-700 rounded-full text-white hover:border-accent-1 hover:bg-accent-1/10 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-accent-1 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Tools</span>
        </Link>
        
        <Link
          to="/links"
          className="group flex items-center gap-3 px-8 py-4 bg-gray-900/30 border border-gray-700 rounded-full text-white hover:border-accent-2 hover:bg-accent-2/10 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-accent-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="font-medium">Links</span>
        </Link>
      </motion.div>



      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-gray-400"
        >
          <span className="text-sm mb-2">Scroll for widgets</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default LandingSection