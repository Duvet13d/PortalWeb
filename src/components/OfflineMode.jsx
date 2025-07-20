import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOfflineStatus } from '../utils/offline'
import { globalAPIHandler, apiErrorNotifier } from '../utils/apiFailureHandler'

/**
 * Enhanced Offline Mode component with detailed status and notifications
 */
const OfflineMode = () => {
  const { isOnline, wasOffline } = useOfflineStatus()
  const [notifications, setNotifications] = useState([])
  const [showDetails, setShowDetails] = useState(false)
  const [errorStats, setErrorStats] = useState({})

  // Listen for API error notifications
  useEffect(() => {
    const handleNotification = (event) => {
      setNotifications(prev => [...prev, event.detail])
    }

    const handleNotificationRemove = (event) => {
      setNotifications(prev => prev.filter(n => n.id !== event.detail.id))
    }

    const handleNotificationsClear = () => {
      setNotifications([])
    }

    window.addEventListener('api:notification', handleNotification)
    window.addEventListener('api:notification:remove', handleNotificationRemove)
    window.addEventListener('api:notifications:clear', handleNotificationsClear)

    return () => {
      window.removeEventListener('api:notification', handleNotification)
      window.removeEventListener('api:notification:remove', handleNotificationRemove)
      window.removeEventListener('api:notifications:clear', handleNotificationsClear)
    }
  }, [])

  // Update error stats periodically
  useEffect(() => {
    const updateStats = () => {
      setErrorStats(globalAPIHandler.getErrorStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Don't show if online and never was offline and no notifications
  if (isOnline && !wasOffline && notifications.length === 0) {
    return null
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-600'
    if (wasOffline) return 'bg-green-600'
    if (notifications.length > 0) return 'bg-yellow-600'
    return 'bg-blue-600'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (wasOffline) return 'Back Online'
    if (notifications.length > 0) return 'Service Issues'
    return 'Online'
  }

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
        </svg>
      )
    }
    if (wasOffline) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (notifications.length > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {/* Main Status Indicator */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className={`${getStatusColor()} text-white px-4 py-2 rounded-lg shadow-lg mb-2 cursor-pointer`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          <div className={`${!isOnline ? 'animate-pulse' : ''}`}>
            {getStatusIcon()}
          </div>
          <span className="text-sm font-medium">{getStatusText()}</span>
          {notifications.length > 0 && (
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          )}
          <svg 
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </motion.div>

      {/* Detailed Status Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl"
          >
            <div className="space-y-3">
              {/* Connection Status */}
              <div>
                <h3 className="text-white font-medium text-sm mb-2">Connection Status</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} ${!isOnline ? 'animate-pulse' : ''}`} />
                  <span className="text-gray-300">
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* API Status */}
              {Object.keys(errorStats).length > 0 && (
                <div>
                  <h3 className="text-white font-medium text-sm mb-2">API Status</h3>
                  <div className="space-y-1">
                    {Object.entries(errorStats).map(([api, stats]) => (
                      <div key={api} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 capitalize">{api.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            stats.circuitBreakerOpen ? 'bg-red-400' : 
                            stats.errorCount > 0 ? 'bg-yellow-400' : 'bg-green-400'
                          }`} />
                          <span className="text-gray-300">
                            {stats.circuitBreakerOpen ? 'Blocked' : 
                             stats.errorCount > 0 ? `${stats.errorCount} errors` : 'OK'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Notifications */}
              {notifications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">Recent Issues</h3>
                    <button
                      onClick={() => {
                        apiErrorNotifier.clearAll()
                        setNotifications([])
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {notifications.slice(-3).map((notification) => (
                      <div key={notification.id} className="text-xs p-2 bg-gray-800/50 rounded">
                        <div className="text-yellow-400 font-medium">{notification.apiName}</div>
                        <div className="text-gray-300">{notification.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    // Clear all caches and reload
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => caches.delete(name))
                      }).then(() => window.location.reload())
                    } else {
                      window.location.reload()
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Notification Toasts */}
      <AnimatePresence>
        {notifications.slice(-2).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg mb-2 text-sm"
            style={{ marginTop: `${(index + 1) * 8}px` }}
          >
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <div className="font-medium">{notification.apiName}</div>
                <div className="text-xs opacity-90">{notification.message}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default OfflineMode