import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Clock Widget - Displays current time and date with customizable format and timezone
 */
const ClockWidget = ({ 
  title = "Clock",
  description = "Current time and date display",
  size = "medium",
  settings = {},
  onSettingsChange,
  className = ""
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)

  // Default settings
  const defaultSettings = {
    format: '12h',
    showSeconds: false,
    timezone: 'local',
    showDate: true,
    dateFormat: 'full' // full, short, numeric
  }

  const widgetSettings = { ...defaultSettings, ...settings }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time based on settings
  const formatTime = (date) => {
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: widgetSettings.format === '12h'
    }

    if (widgetSettings.showSeconds) {
      options.second = '2-digit'
    }

    if (widgetSettings.timezone !== 'local') {
      options.timeZone = widgetSettings.timezone
    }

    return date.toLocaleTimeString('en-US', options)
  }

  // Format date based on settings
  const formatDate = (date) => {
    if (!widgetSettings.showDate) return ''

    const options = {}
    
    if (widgetSettings.timezone !== 'local') {
      options.timeZone = widgetSettings.timezone
    }

    switch (widgetSettings.dateFormat) {
      case 'full':
        options.weekday = 'long'
        options.year = 'numeric'
        options.month = 'long'
        options.day = 'numeric'
        break
      case 'short':
        options.weekday = 'short'
        options.month = 'short'
        options.day = 'numeric'
        break
      case 'numeric':
        options.year = 'numeric'
        options.month = '2-digit'
        options.day = '2-digit'
        break
      default:
        options.weekday = 'long'
        options.year = 'numeric'
        options.month = 'long'
        options.day = 'numeric'
    }

    return date.toLocaleDateString('en-US', options)
  }

  const sizeClasses = {
    small: "h-32",
    medium: "h-48", 
    large: "h-64"
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...widgetSettings, [key]: value }
    onSettingsChange?.(newSettings)
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
        relative
      `}
    >
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 w-6 h-6 text-gray-400 hover:text-white transition-colors"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="flex flex-col h-full">
        {/* Widget Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 text-accent-1 flex-shrink-0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white truncate">
            {title}
          </h3>
        </div>

        {/* Clock Display */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">
            {formatTime(currentTime)}
          </div>
          {widgetSettings.showDate && (
            <div className="text-sm md:text-base text-gray-300">
              {formatDate(currentTime)}
            </div>
          )}
        </div>

        {/* Widget Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Live</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 z-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Clock Settings</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Time Format */}
            <div>
              <label className="block text-gray-300 mb-2">Time Format</label>
              <select
                value={widgetSettings.format}
                onChange={(e) => handleSettingChange('format', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>

            {/* Show Seconds */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Show Seconds</label>
              <input
                type="checkbox"
                checked={widgetSettings.showSeconds}
                onChange={(e) => handleSettingChange('showSeconds', e.target.checked)}
                className="rounded"
              />
            </div>

            {/* Show Date */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Show Date</label>
              <input
                type="checkbox"
                checked={widgetSettings.showDate}
                onChange={(e) => handleSettingChange('showDate', e.target.checked)}
                className="rounded"
              />
            </div>

            {/* Date Format */}
            {widgetSettings.showDate && (
              <div>
                <label className="block text-gray-300 mb-2">Date Format</label>
                <select
                  value={widgetSettings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="full">Full (Monday, January 1, 2024)</option>
                  <option value="short">Short (Mon, Jan 1)</option>
                  <option value="numeric">Numeric (01/01/2024)</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ClockWidget