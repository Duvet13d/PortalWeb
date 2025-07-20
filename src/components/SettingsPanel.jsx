import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { focusUtils } from '../utils/accessibility'
import { enhancedStorage } from '../utils/enhancedStorage'

const SettingsPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('shortcuts')
  const [exportData, setExportData] = useState('')
  const [importData, setImportData] = useState('')
  const [showImportTextarea, setShowImportTextarea] = useState(false)

  // Focus trap for modal
  React.useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('settings-panel')
      if (modal) {
        const cleanup = focusUtils.trapFocus(modal)
        return cleanup
      }
    }
  }, [isOpen])



  // Data Management Functions
  const handleExportData = async () => {
    try {
      const data = await enhancedStorage.exportData()
      setExportData(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleImportData = async () => {
    if (!importData.trim()) {
      alert('Please paste your data first.')
      return
    }

    try {
      const data = JSON.parse(importData)
      await enhancedStorage.importData(data)
      alert('Data imported successfully! Please refresh the page to see changes.')
      setImportData('')
      setShowImportTextarea(false)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import data. Please check the format and try again.')
    }
  }

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await enhancedStorage.clearAll()
        alert('All data cleared successfully! Please refresh the page.')
      } catch (error) {
        console.error('Clear failed:', error)
        alert('Failed to clear data. Please try again.')
      }
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy to clipboard. Please copy manually.')
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            id="settings-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-xl overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-panel-title"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 
                  id="settings-panel-title"
                  className="text-xl font-semibold text-white"
                >
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-1"
                  aria-label="Close settings"
                  data-close-modal
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('shortcuts')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'shortcuts'
                      ? 'bg-accent-1 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Shortcuts
                </button>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'data'
                      ? 'bg-accent-1 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Data
                </button>
              </div>

              {/* Keyboard Shortcuts Tab */}
              {activeTab === 'shortcuts' && (
                <div className="space-y-6">
                  {/* Keyboard Shortcuts Info */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex justify-between items-center">
                        <span>Navigate to Home</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + H</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Navigate to Tools</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + T</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Navigate to Links</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + L</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Focus Search</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">/</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Toggle Menu</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + M</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Close Modal</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Esc</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Show Shortcuts Help</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + ?</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Tools Page Shortcuts */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Tools Page Shortcuts
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex justify-between items-center">
                        <span>Focus Notes</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + N</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Focus Calculator</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + C</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Focus Currency Converter</span>
                        <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-accent-1 font-mono">Alt + X</kbd>
                      </div>
                    </div>
                  </div>

                  {/* General Info */}
                  <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">
                      Navigation Tips
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Use Tab to navigate between interactive elements</li>
                      <li>• Press Enter or Space to activate buttons</li>
                      <li>• Use arrow keys to navigate within lists</li>
                      <li>• Shortcuts work when not typing in input fields</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Data Management Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Export Section */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Export Data</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Export all your settings, notes, and preferences as a backup file.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Export Data
                    </button>
                    
                    {exportData && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-white">Exported Data:</label>
                          <button
                            onClick={() => copyToClipboard(exportData)}
                            className="text-xs text-accent-1 hover:text-accent-2 transition-colors"
                          >
                            Copy to Clipboard
                          </button>
                        </div>
                        <textarea
                          value={exportData}
                          readOnly
                          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-xs font-mono resize-none focus:outline-none focus:border-accent-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Import Section */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Import Data</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Import previously exported data to restore your settings and preferences.
                    </p>
                    
                    {!showImportTextarea ? (
                      <button
                        onClick={() => setShowImportTextarea(true)}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Import Data
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <textarea
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="Paste your exported data here..."
                          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm font-mono resize-none focus:outline-none focus:border-accent-1"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleImportData}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Import
                          </button>
                          <button
                            onClick={() => {
                              setShowImportTextarea(false)
                              setImportData('')
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Data Section */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Clear All Data</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Permanently delete all stored data including settings, notes, and preferences.
                    </p>
                    <button
                      onClick={handleClearAllData}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Clear All Data
                    </button>
                  </div>

                  {/* Storage Info */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-sm font-medium text-white mb-2">
                      Data Storage
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• All data is stored locally in your browser</li>
                      <li>• No data is sent to external servers</li>
                      <li>• Sensitive data is encrypted when possible</li>
                      <li>• Regular backups are recommended</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SettingsPanel