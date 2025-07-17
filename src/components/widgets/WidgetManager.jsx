import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useWidgets, WIDGET_TYPES } from '../../contexts/WidgetContext'
import widgetRegistry from '../../systems/WidgetRegistry'
import WidgetFactory from '../../systems/WidgetFactory'
import DraggableWidgetContainer from '../homepage/DraggableWidgetContainer'


/**
 * Widget Manager - Handles the display and management of all widgets
 */
const WidgetManager = ({ 
  className = '',
  gridCols = { sm: 1, md: 2, lg: 3, xl: 3 },
  gap = 6,
  staggerDelay = 150,
  showEmptyState = true
}) => {
  const { getOrderedWidgets, isLoaded } = useWidgets()
  const [isLayoutMode, setIsLayoutMode] = useState(false)

  // Initialize widget registry
  React.useEffect(() => {
    widgetRegistry.initialize()
  }, [])

  // Create widget instances for visible widgets
  const widgetInstances = useMemo(() => {
    if (!isLoaded) return []

    const orderedWidgetTypes = getOrderedWidgets()
    
    return orderedWidgetTypes.map(widgetType => {
      // Find widget definition in registry by type
      const widgets = widgetRegistry.getByType(widgetType)
      const widgetDef = widgets[0] // Take first widget of this type
      
      if (!widgetDef) {
        console.warn(`No widget found for type: ${widgetType}`)
        return null
      }

      // Create widget component using factory
      const WidgetComponent = WidgetFactory.create(widgetDef.id)
      
      return {
        id: widgetDef.id,
        type: widgetType,
        component: (
          <WidgetComponent
            key={widgetDef.id}
            title={widgetDef.metadata.name}
            description={widgetDef.metadata.description}
            size={widgetDef.defaultSize}
            icon={getWidgetIcon(widgetDef.metadata.icon)}
          />
        )
      }
    }).filter(Boolean)
  }, [isLoaded, getOrderedWidgets])

  // Show loading state while context is loading
  if (!isLoaded) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin" />
          <span>Loading widgets...</span>
        </div>
      </div>
    )
  }

  // Show empty state if no widgets are visible
  if (widgetInstances.length === 0 && showEmptyState) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-16"
      >
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl text-white mb-2">No Widgets Enabled</h3>
          <p className="text-gray-400">
            Enable widgets in settings to see them here.
          </p>
        </div>
      </motion.div>
    )
  }

  // Render widgets using DraggableWidgetContainer
  return (
    <DraggableWidgetContainer
      widgets={widgetInstances}
      gap={gap}
      staggerDelay={staggerDelay}
      className={className}
      isLayoutMode={isLayoutMode}
      onToggleLayoutMode={() => setIsLayoutMode(!isLayoutMode)}
    />
  )
}

/**
 * Get SVG icon for widget type
 * @param {string} iconType - Icon type identifier
 * @returns {React.Element} SVG icon element
 */
const getWidgetIcon = (iconType) => {
  const icons = {
    search: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    clock: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cloud: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    music: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    link: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    edit: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  }

  return icons[iconType] || icons.search
}

/**
 * Widget Settings Panel - For managing widget visibility and settings
 */
export const WidgetSettingsPanel = ({ isOpen, onClose }) => {
  const { visibility, toggleWidget, resetWidgets } = useWidgets()

  if (!isOpen) return null

  const allWidgetTypes = Object.values(WIDGET_TYPES)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Widget Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {allWidgetTypes.map(widgetType => {
            const widgets = widgetRegistry.getByType(widgetType)
            const widget = widgets[0]
            
            if (!widget) return null

            return (
              <div key={widgetType} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 text-accent-1">
                    {getWidgetIcon(widget.metadata.icon)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{widget.metadata.name}</h3>
                    <p className="text-gray-400 text-sm">{widget.metadata.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibility[widgetType] || false}
                    onChange={() => toggleWidget(widgetType)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-1"></div>
                </label>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={resetWidgets}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WidgetManager