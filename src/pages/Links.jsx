import { motion } from 'framer-motion'
import MaskTextReveal from '../components/MaskTextReveal'
import LinkCard from '../components/LinkCard'
import { linksData } from '../data/links'

const Links = () => {
  return (
    <div className="min-h-screen py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <MaskTextReveal 
          className="font-heading text-3xl sm:text-4xl md:text-6xl text-white text-center mb-4"
          delay={0.1}
        >
          LINKS
        </MaskTextReveal>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-gray-300 text-base sm:text-lg text-center mb-12 sm:mb-16 max-w-2xl mx-auto px-2"
        >
          A curated collection of interesting websites, tools, and resources that I find valuable and inspiring.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {linksData.map((link, index) => (
            <LinkCard
              key={link.id}
              title={link.title}
              url={link.url}
              description={link.description}
              category={link.category}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-gray-400 text-sm">
            Links are regularly updated with new discoveries and recommendations.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Links 