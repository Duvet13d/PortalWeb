import { WIDGET_TYPES } from '../contexts/WidgetContext'
import ClockWidget from '../components/widgets/ClockWidget'
import SearchWidget from '../components/widgets/SearchWidget'
import WeatherWidget from '../components/widgets/WeatherWidget'
import SpotifyWidget from '../components/widgets/SpotifyWidget'

/**
 * Widget Registry - Central system for managing widget definitions and components
 */
class WidgetRegistry {
  constructor() {
    this.widgets = new Map()
    this.initialized = false
  }

  /**
   * Register a widget with the system
   * @param {Object} widgetDefinition - Widget definition object
   */
  register(widgetDefinition) {
    const { id, type, component, defaultSize, configurable, settings, metadata } = widgetDefinition

    if (!id || !type || !component) {
      throw new Error('Widget must have id, type, and component')
    }

    if (this.widgets.has(id)) {
      console.warn(`Widget with id "${id}" is already registered. Overwriting.`)
    }

    this.widgets.set(id, {
      id,
      type,
      component,
      defaultSize: defaultSize || 'medium',
      configurable: configurable !== false, // Default to true
      settings: settings || {},
      metadata: metadata || {},
      registered: new Date().toISOString()
    })
  }

  /**
   * Get a widget definition by ID
   * @param {string} id - Widget ID
   * @returns {Object|null} Widget definition or null if not found
   */
  get(id) {
    return this.widgets.get(id) || null
  }

  /**
   * Get all widgets of a specific type
   * @param {string} type - Widget type
   * @returns {Array} Array of widget definitions
   */
  getByType(type) {
    return Array.from(this.widgets.values()).filter(widget => widget.type === type)
  }

  /**
   * Get all registered widgets
   * @returns {Array} Array of all widget definitions
   */
  getAll() {
    return Array.from(this.widgets.values())
  }

  /**
   * Check if a widget is registered
   * @param {string} id - Widget ID
   * @returns {boolean} True if widget is registered
   */
  has(id) {
    return this.widgets.has(id)
  }

  /**
   * Unregister a widget
   * @param {string} id - Widget ID
   * @returns {boolean} True if widget was removed
   */
  unregister(id) {
    return this.widgets.delete(id)
  }

  /**
   * Get widget component by ID
   * @param {string} id - Widget ID
   * @returns {React.Component|null} Widget component or null
   */
  getComponent(id) {
    const widget = this.get(id)
    return widget ? widget.component : null
  }

  /**
   * Get widgets that are available for a specific context
   * @param {Object} context - Context object with filters
   * @returns {Array} Filtered array of widget definitions
   */
  getAvailableWidgets(context = {}) {
    const { size, configurable, types } = context
    
    return this.getAll().filter(widget => {
      // Filter by size if specified
      if (size && widget.defaultSize !== size) {
        return false
      }
      
      // Filter by configurable if specified
      if (configurable !== undefined && widget.configurable !== configurable) {
        return false
      }
      
      // Filter by types if specified
      if (types && Array.isArray(types) && !types.includes(widget.type)) {
        return false
      }
      
      return true
    })
  }

  /**
   * Initialize the registry with default widgets
   */
  initialize() {
    if (this.initialized) {
      return
    }

    // Register placeholder widgets - these will be replaced by actual implementations
    this.registerPlaceholderWidgets()
    this.initialized = true
  }

  /**
   * Register placeholder widgets for development
   * These will be replaced by actual widget implementations
   */
  registerPlaceholderWidgets() {
    // Import placeholder component dynamically to avoid circular dependencies
    const PlaceholderWidget = ({ title, description, icon, size }) => {
      return {
        id: `placeholder-${title.toLowerCase()}`,
        title,
        description,
        icon,
        size
      }
    }

    // Register default widget types with placeholders
    const defaultWidgets = [
      {
        id: 'search-widget',
        type: WIDGET_TYPES.SEARCH,
        component: SearchWidget,
        defaultSize: 'large',
        configurable: true,
        metadata: {
          name: 'Search',
          description: 'Universal search with smart suggestions',
          icon: 'search'
        }
      },
      {
        id: 'clock-widget',
        type: WIDGET_TYPES.CLOCK,
        component: ClockWidget,
        defaultSize: 'medium',
        configurable: true,
        metadata: {
          name: 'Clock',
          description: 'Current time and date display',
          icon: 'clock'
        }
      },
      {
        id: 'weather-widget',
        type: WIDGET_TYPES.WEATHER,
        component: WeatherWidget,
        defaultSize: 'large',
        configurable: true,
        metadata: {
          name: 'Weather',
          description: 'Current weather and forecast',
          icon: 'cloud'
        }
      },
      {
        id: 'spotify-widget',
        type: WIDGET_TYPES.SPOTIFY,
        component: SpotifyWidget,
        defaultSize: 'medium',
        configurable: true,
        metadata: {
          name: 'Spotify',
          description: 'Now playing and music controls',
          icon: 'music'
        }
      },
      {
        id: 'quicklinks-widget',
        type: WIDGET_TYPES.QUICK_LINKS,
        component: PlaceholderWidget,
        defaultSize: 'large',
        configurable: true,
        metadata: {
          name: 'Quick Links',
          description: 'Your favorite bookmarks',
          icon: 'link'
        }
      },

    ]

    defaultWidgets.forEach(widget => this.register(widget))
  }

  /**
   * Get registry statistics
   * @returns {Object} Statistics about registered widgets
   */
  getStats() {
    const widgets = this.getAll()
    const typeCount = {}
    
    widgets.forEach(widget => {
      typeCount[widget.type] = (typeCount[widget.type] || 0) + 1
    })

    return {
      total: widgets.length,
      byType: typeCount,
      configurable: widgets.filter(w => w.configurable).length,
      initialized: this.initialized
    }
  }
}

// Create singleton instance
const widgetRegistry = new WidgetRegistry()

export default widgetRegistry
export { WidgetRegistry }