import { motion } from 'framer-motion'
import MaskTextReveal from '../components/MaskTextReveal'
import DynamicText from '../components/DynamicText'
import SpotifyTicker from '../components/SpotifyTicker'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16">
        <div className="text-center max-w-6xl mx-auto">
          <MaskTextReveal 
            className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-white mb-6 sm:mb-8"
            //delay={0.4}
            splitByWords={true}
          >
            WELCOME TO
          </MaskTextReveal>
          
          <DynamicText 
            className="font-heading text-xl sm:text-2xl md:text-4xl lg:text-6xl text-accent-1 min-h-[60px] sm:min-h-[80px] flex items-center justify-center px-2"
            texts={[
              "雷雷雷",
              "大黑暗",
              "RANDOM STUFF",
              "高松燈 GuGu GaGa",
              "她他啊您"
            ]}
            interval={5000}
          />
        </div>
      </section>

      {/* Spotify Ticker Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <MaskTextReveal 
            className="font-heading text-xl sm:text-2xl md:text-3xl text-white text-center mb-6 sm:mb-8"
            delay={0.2}
          >
            CURRENTLY LISTENING TO
          </MaskTextReveal>
          
          <SpotifyTicker className="mt-6 sm:mt-8" />
        </motion.div>
      </section>

      {/* Additional Content Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <MaskTextReveal 
            className="font-heading text-xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8"
            delay={0.2}
          >
            EXPLORE THE PORTAL
          </MaskTextReveal>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto px-2"
          >
            Welcome to my digital space. Here you'll find useful tools, curated links, 
            and a glimpse into my interests. Navigate through the portal to discover 
            what awaits in each section.
          </motion.p>
        </div>
      </section>
    </div>
  )
}

export default Home 