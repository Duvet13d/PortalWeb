import React from 'react'
import { motion } from 'framer-motion'

/**
 * Generic Error Boundary component for catching and handling React errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    
    // Log error for debugging
    console.error(`Error in ${this.props.name || 'component'}:`, error, errorInfo)
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback UI
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-lg border border-red-500/50 bg-red-900/20 ${this.props.className || ''}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5 text-red-400 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-400 font-medium text-sm">
                {this.props.title || 'Something went wrong'}
              </h3>
              <p className="text-gray-300 text-xs mt-1">
                {this.props.message || 'An unexpected error occurred. Please try again.'}
              </p>
              {this.props.showDetails && this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    Error details
                  </summary>
                  <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-20">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
          
          {this.props.showRetry !== false && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={this.handleRetry}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Try Again
              </button>
              {this.props.onReset && (
                <button
                  onClick={this.props.onReset}
                  className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </motion.div>
      )
    }

    return this.props.children
  }
}

/**
 * Widget-specific Error Boundary with enhanced fallback
 */
export const WidgetErrorBoundary = ({ 
  widgetId, 
  widgetName, 
  children, 
  onError, 
  fallbackData = null,
  enableOfflineMode = true 
}) => {
  const handleWidgetError = (error, errorInfo) => {
    // Log widget-specific error
    console.error(`Widget Error [${widgetName || widgetId}]:`, error, errorInfo)
    
    // Store error info for debugging
    if (typeof window !== 'undefined') {
      const errorLog = JSON.parse(localStorage.getItem('widget-errors') || '[]')
      errorLog.push({
        widgetId,
        widgetName,
        error: error.toString(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      })
      // Keep only last 10 errors
      localStorage.setItem('widget-errors', JSON.stringify(errorLog.slice(-10)))
    }
    
    onError?.(error, errorInfo)
  }

  const widgetFallback = (error, retry) => (
    <div className="min-h-[120px] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 mx-auto mb-3 text-red-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-red-400 font-medium text-sm mb-2">
          {widgetName || widgetId} Widget Error
        </h3>
        <p className="text-gray-400 text-xs mb-4">
          This widget encountered an error and couldn't load properly.
        </p>
        
        {/* Show fallback data if available */}
        {fallbackData && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-gray-300 text-xs mb-2">Showing cached data:</p>
            <div className="text-gray-400 text-xs">
              {typeof fallbackData === 'string' ? fallbackData : JSON.stringify(fallbackData, null, 2)}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={retry}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry Widget
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      name={`Widget: ${widgetName || widgetId}`}
      onError={handleWidgetError}
      fallback={widgetFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Tool-specific Error Boundary with enhanced error handling
 */
export const ToolErrorBoundary = ({ 
  toolName, 
  children, 
  onError, 
  onClose,
  enableReporting = true 
}) => {
  const handleToolError = (error, errorInfo) => {
    // Log tool-specific error
    console.error(`Tool Error [${toolName}]:`, error, errorInfo)
    
    // Store error info for debugging
    if (typeof window !== 'undefined' && enableReporting) {
      const errorLog = JSON.parse(localStorage.getItem('tool-errors') || '[]')
      errorLog.push({
        toolName,
        error: error.toString(),
        stack: error.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
      // Keep only last 20 errors
      localStorage.setItem('tool-errors', JSON.stringify(errorLog.slice(-20)))
    }
    
    onError?.(error, errorInfo)
  }

  const toolFallback = (error, retry) => (
    <div className="min-h-[300px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-red-400 font-semibold text-lg mb-2">
          {toolName} Tool Error
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          The {toolName} tool encountered an unexpected error and couldn't load properly. 
          This might be due to a temporary issue or corrupted data.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={retry}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry Tool
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close Tool
          </button>
        </div>
        
        <details className="mt-6 text-left">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
            Technical Details
          </summary>
          <div className="p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400">
            <div className="mb-2"><strong>Error:</strong> {error.toString()}</div>
            <div><strong>Time:</strong> {new Date().toLocaleString()}</div>
          </div>
        </details>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      name={`Tool: ${toolName}`}
      onError={handleToolError}
      fallback={toolFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Page-level Error Boundary
 */
export const PageErrorBoundary = ({ pageName, children, onError }) => (
  <ErrorBoundary
    name={`Page: ${pageName}`}
    title="Page Error"
    message="This page encountered an error and couldn't load properly"
    className="min-h-[50vh] flex items-center justify-center"
    onError={onError}
    showRetry={true}
    showDetails={true}
  >
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary