import { motion } from 'framer-motion'

/**
 * Placeholder widget component for testing the widget system
 */
const PlaceholderWidget = ({ 
  title = "Widget", 
  icon, 
  description = "Widget description",
  size = "medium",
  className = ""
}) => {
  const sizeClasses = {
    small: "h-32",
    medium: "h-48",
    large: "h-64"
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`
        bg-gray-900/50 
        border border-gray-700 
        rounded-xl 
        p-6 
        backdrop-blur-sm
        hover:border-accent-1/50
        hover:bg-gray-900/70
        transition-all 
        duration-300
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Widget Header */}
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="w-8 h-8 text-accent-1 flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-white truncate">
            {title}
          </h3>
        </div>

        {/* Widget Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-3 mx-auto">
              <div className="w-8 h-8 bg-accent-1/20 rounded-full animate-pulse" />
            </div>
            <p className="text-gray-400 text-sm">
              {description}
            </p>
          </div>
        </div>

        {/* Widget Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Ready</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PlaceholderWidget