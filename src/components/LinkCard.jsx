import { motion } from 'framer-motion'

const LinkCard = ({ title, url, description, category, index = 0 }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="block p-4 sm:p-6 bg-white bg-opacity-5 rounded-xl backdrop-blur-sm hover:bg-opacity-10 transition-all duration-300 group min-h-[120px] touch-manipulation"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-heading text-base sm:text-lg text-white group-hover:text-accent-1 transition-colors duration-300 leading-tight">
          {title}
        </h3>
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-accent-2 transition-colors duration-300 flex-shrink-0 ml-2 mt-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
      
      <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed line-clamp-2">
        {description}
      </p>
      
      {category && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="px-2 py-1 bg-accent-2 text-white text-xs font-medium rounded-md w-fit">
            {category}
          </span>
          <span className="text-gray-500 text-xs truncate">
            {new URL(url).hostname}
          </span>
        </div>
      )}
    </motion.a>
  )
}

export default LinkCard 