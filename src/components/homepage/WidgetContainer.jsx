import { motion } from 'framer-motion'
import { useStaggeredAnimation } from '../../hooks/useScrollTrigger'

/**
 * Widget Container with responsive grid layout and staggered animations
 */
const WidgetContainer = ({ 
  widgets = [], 
  className = '',
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  staggerDelay = 150
}) => {
  const { containerRef, isVisible, getItemDelay } = useStaggeredAnimation(
    widgets.length, 
    staggerDelay
  )

  // Generate responsive grid classes
  const gridClasses = [
    'grid',
    `grid-cols-${gridCols.sm}`,
    `md:grid-cols-${gridCols.md}`,
    `lg:grid-cols-${gridCols.lg}`,
    `xl:grid-cols-${gridCols.xl}`,
    `gap-${gap}`,
    className
  ].join(' ')

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  // Animation variants for individual widgets
  const widgetVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={gridClasses}
    >
      {widgets.map((widget, index) => (
        <motion.div
          key={widget.id || index}
          variants={widgetVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{
            delay: getItemDelay(index) / 1000, // Convert ms to seconds
            duration: 0.6,
            ease: 'easeOut'
          }}
          className="widget-item"
        >
          {widget.component || widget}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default WidgetContainer