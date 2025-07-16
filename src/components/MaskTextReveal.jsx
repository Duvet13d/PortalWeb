import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const MaskTextReveal = ({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.6,
  splitByWords = false 
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  if (splitByWords) {
    const words = children.split(' ')
    
    return (
      <div ref={ref} className={className}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{ y: 100, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
            transition={{
              duration: duration,
              delay: delay + index * 0.1,
              ease: 'easeOut'
            }}
            style={{ display: 'inline-block', marginRight: '0.5em' }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{
          duration: duration,
          delay: delay,
          ease: 'easeOut'
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default MaskTextReveal 