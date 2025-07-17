import React from 'react'
import widgetRegistry from './WidgetRegistry'
import { useWidgets } from '../contexts/WidgetContext'
import PlaceholderWidget from '../components/widgets/PlaceholderWidget'

/**
 * Widget Factory - Creates widget instances with proper configuration and error handling
 */
export class WidgetFactory {
  /**
   * Create a widget component instance
   * @param {string} widgetId - Widget ID from registry
   * @param {Object} props - Additional props to pass to widget
   * @returns {React.Component} Widget component instance
   */
  static create(widgetId, props = {}) {
    const widgetDefinition = widgetRegistry.get(widgetId)
    
    if (!widgetDefinition) {
      console.warn(`Widget "${widgetId}" not found in registry`)
      return WidgetFactory.createFallback(widgetId, props)
    }

    const { component: WidgetComponent, metadata, defaultSize } = widgetDefinition

    // Create wrapper component that provides widget context
    const WidgetWrapper = (wrapperProps) => {
      const { getWidgetSettings, updateWidgetSettings } = useWidgets()
      const settings = getWidgetSettings(widgetDefinition.type)

      const widgetProps = {
        ...props,
        ...wrapperProps,
        widgetId,
        settings,
        metadata,
        size: props.size || defaultSize,
        onSettingsChange: (newSettings) => {
          updateWidgetSettings(widgetDefinition.type, newSettings)
        }
      }

      return (
        <ErrorBoundary widgetId={widgetId}>
          <WidgetComponent {...widgetProps} />
        </ErrorBoundary>
      )
    }

    WidgetWrapper.displayName = `Widget(${widgetId})`
    return WidgetWrapper
  }

  /**
   * Create a fallback widget when the requested widget is not available
   * @param {string} widgetId - Widget ID that failed to load
   * @param {Object} props - Props for fallback widget
   * @returns {React.Component} Fallback widget component
   */
  static createFallback(widgetId, props = {}) {
    return (fallbackProps) => (
      <PlaceholderWidget
        title="Widget Not Found"
        description={`Widget "${widgetId}" could not be loaded`}
        size={props.size || 'medium'}
        className="border-red-500/50 bg-red-900/20"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
        {...fallbackProps}
      />
    )
  }

  /**
   * Create multiple widgets from an array of widget configurations
   * @param {Array} widgetConfigs - Array of widget configurations
   * @returns {Array} Array of widget component instances
   */
  static createMultiple(widgetConfigs) {
    return widgetConfigs.map(config => {
      const { id, props = {} } = config
      return {
        id,
        component: WidgetFactory.create(id, props),
        ...config
      }
    })
  }

  /**
   * Create widgets based on visibility settings
   * @param {Object} options - Creation options
   * @returns {Array} Array of visible widget instances
   */
  static createVisible(options = {}) {
    const { size, additionalProps = {} } = options
    
    // This will be called within a component that has access to useWidgets
    const VisibleWidgetsCreator = () => {
      const { getVisibleWidgets } = useWidgets()
      const visibleWidgetTypes = getVisibleWidgets()
      
      return visibleWidgetTypes.map(widgetType => {
        // Find widget in registry by type
        const widgets = widgetRegistry.getByType(widgetType)
        const widget = widgets[0] // Take first widget of this type
        
        if (!widget) {
          return null
        }

        return {
          id: widget.id,
          type: widgetType,
          component: WidgetFactory.create(widget.id, {
            size,
            ...additionalProps
          })
        }
      }).filter(Boolean)
    }

    return VisibleWidgetsCreator
  }
}

/**
 * Error Boundary for individual widgets
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Widget "${this.props.widgetId}" crashed:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <PlaceholderWidget
          title="Widget Error"
          description={`Widget "${this.props.widgetId}" encountered an error`}
          size="medium"
          className="border-red-500/50 bg-red-900/20"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      )
    }

    return this.props.children
  }
}

/**
 * Hook to create widgets within React components
 * @param {Array|string} widgetIds - Widget ID(s) to create
 * @param {Object} props - Props to pass to widgets
 * @returns {Array|React.Component} Widget component(s)
 */
export const useWidgetFactory = (widgetIds, props = {}) => {
  const widgets = React.useMemo(() => {
    if (Array.isArray(widgetIds)) {
      return widgetIds.map(id => ({
        id,
        component: WidgetFactory.create(id, props)
      }))
    } else {
      return WidgetFactory.create(widgetIds, props)
    }
  }, [widgetIds, props])

  return widgets
}

export default WidgetFactory