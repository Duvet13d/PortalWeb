import { motion } from 'framer-motion'

const PageTransition = ({ children }) => {
  return (
    <>
      {/* Curtain wipe effect - enters from right, exits to left */}
      <motion.div
        className="fixed inset-0 z-50 bg-accent-1"
        initial={{ x: '100%' }}
        animate={{ x: '100%' }}
        exit={{ x: 0 }}
        transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
      />
      
      <motion.div
        className="fixed inset-0 z-50 bg-accent-1"
        initial={{ x: 0 }}
        animate={{ x: '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.2, ease: [0.76, 0, 0.24, 1] }}
      />
      
      {/* Page content with smooth fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2}}//, delay: 0.4 }}
      >
        {children}
      </motion.div>
    </>
  )
}

export default PageTransition 