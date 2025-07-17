import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWidgets, WIDGET_SIZES } from '../../contexts/WidgetContext'

/**
 * Draggable Widget Container with layout customization
 */
const DraggableWidgetContainer = ({ 
  widgets = [], 
  className = '',
  gap = 6,
  staggerDelay = 150,
  isLayoutMode = false,
  onToggleLayoutMode
}) => {
  const { updateWidgetLayout, reorderWidgets, getWidgetLayout } = useWidgets()
  const [draggedWidget, setDraggedWidget] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const containerRef = useRef(null)

  // Get widget size classes
  const getSizeClasses = (size) => {
    switch (size) {
      case WIDGET_SIZES.SMALL:
        return 'col-span-1'
      case WIDGET_SIZES.LARGE:
        return 'col-span-2 md:col-span-2'
      default: // MEDIUM
        return 'col-span-1 md:col-span-1'
    }
  }

  // Handle drag start
  const handleDragStart = useCallback((e, widget, index) => {
    if (!isLayoutMode) return
    
    setDraggedWidget({ widget, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }, [isLayoutMode])

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1'
    setDraggedWidget(null)
    setDragOverIndex(null)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e, index) => {
    if (!isLayoutMode || !draggedWidget) return
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [isLayoutMode, draggedWidget])

  // Handle drop
  const handleDrop = useCallback((e, dropIndex) => {
    if (!isLayoutMode || !draggedWidget) return
    
    e.preventDefault()
    
    const dragIndex = draggedWidget.index
    if (dragIndex === dropIndex) return

    // Reorder widgets
    const newWidgets = [...widgets]
    const [draggedItem] = newWidgets.splice(dragIndex, 1)
    newWidgets.splice(dropIndex, 0, draggedItem)

    // Update layout order
    const newLayout = {}
    newWidgets.forEach((widget, index) => {
      const currentLayout = getWidgetLayout(widget.type)
      newLayout[widget.type] = {
        ...currentLayout,
        order: index
      }
    })

    reorderWidgets(newLayout)
    setDragOverIndex(null)
  }, [isLayoutMode, draggedWidget, widgets, getWidgetLayout, reorderWidgets])

  // Handle widget size change
  const handleSizeChange = useCallback((widgetType, newSize) => {
    const currentLayout = getWidgetLayout(widgetType)
    updateWidgetLayout(widgetType, {
      ...currentLayout,
      size: newSize
    })
  }, [getWidgetLayout, updateWidgetLayout])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: staggerDelay / 1000
      }
    }
  }

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
    <div className="relative">
      {/* Layout Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-white">Widgets</h3>
          {isLayoutMode && (
            <span className="px-2 py-1 bg-accent-1/20 text-accent-1 text-xs rounded-full">
              Layout Mode
            </span>
          )}
        </div>
        <button
          onClick={onToggleLayoutMode}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isLayoutMode 
              ? 'bg-accent-1 text-white hover:bg-accent-2' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isLayoutMode ? 'Done' : 'Customize Layout'}
        </button>
      </div>

      {/* Widget Grid */}
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-${gap} ${className}`}
      >
        <AnimatePresence>
          {widgets.map((widget, index) => {
            const layout = getWidgetLayout(widget.type)
            const isDraggedOver = dragOverIndex === index
            const isDragged = draggedWidget?.index === index

            return (
              <motion.div
                key={widget.id}
                variants={widgetVariants}
                layout
                className={`
                  ${getSizeClasses(layout.size)}
                  ${isLayoutMode ? 'cursor-move' : ''}
                  ${isDraggedOver ? 'ring-2 ring-accent-1 ring-opacity-50' : ''}
                  ${isDragged ? 'opacity-50' : ''}
                  relative group
                `}
                draggable={isLayoutMode}
                onDragStart={(e) => handleDragStart(e, widget, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Layout Controls */}
                {isLayoutMode && (
                  <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1">
                    {/* Size Controls */}
                    <div className="flex bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
                      {Object.values(WIDGET_SIZES).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeChange(widget.type, size)}
                          className={`px-2 py-1 text-xs transition-colors ${
                            layout.size === size
                              ? 'bg-accent-1 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                          title={`${size.charAt(0).toUpperCase() + size.slice(1)} size`}
                        >
                          {size.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                    
                    {/* Drag Handle */}
                    <div className="bg-gray-900 border border-gray-600 rounded p-1 cursor-move">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Widget Content */}
                <div className={`h-full ${isLayoutMode ? 'pointer-events-none' : ''}`}>
                  {widget.component || widget}
                </div>

                {/* Drop Indicator */}
                {isDraggedOver && draggedWidget && (
                  <div className="absolute inset-0 border-2 border-dashed border-accent-1 rounded-lg bg-accent-1/10 pointer-events-none" />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Layout Mode Instructions */}
      {isLayoutMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
        >
          <h4 className="text-white font-medium mb-2">Layout Customization</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Drag widgets to reorder them</li>
            <li>• Use size buttons (S/M/L) to change widget sizes</li>
            <li>• Small widgets take 1 column, Large widgets take 2 columns</li>
            <li>• Changes are saved automatically</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default DraggableWidgetContainer