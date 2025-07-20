/**
 * Data Manager Component - UI for enhanced storage features
 * Provides export/import, backup management, and encryption controls
 */

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  useDataManager, 
  useBackupManager, 
  useStorageEncryption 
} from '../hooks/useEnhancedStorage'

const DataManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('export')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef(null)

  const {
    loading: dataLoading,
    error: dataError,
    progress: dataProgress,
    exportData,
    importData,
    getStorageStats,
    clearAllData
  } = useDataManager()

  const {
    backups,
    loading: backupLoading,
    error: backupError,
    loadBackups,
    restoreFromBackup,
    deleteBackup
  } = useBackupManager()

  const {
    isSetup: encryptionSetup,
    loading: encryptionLoading,
    error: encryptionError,
    setupEncryption,
    changePassword,
    removeEncryption
  } = useStorageEncryption()

  const [stats, setStats] = useState(null)
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    createBackup: true,
    importBackups: false
  })

  // Load storage stats when component opens
  React.useEffect(() => {
    if (isOpen) {
      const storageStats = getStorageStats()
      setStats(storageStats)
      loadBackups()
    }
  }, [isOpen, getStorageStats, loadBackups])

  const handleExport = async (options = {}) => {
    const exportOptions = {
      encrypt: options.encrypt || false,
      password: options.encrypt ? password : undefined,
      includeBackups: options.includeBackups || false
    }

    const success = await exportData(exportOptions)
    if (success) {
      setPassword('')
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const options = {
      ...importOptions,
      password: password || undefined
    }

    const results = await importData(file, options)
    if (results) {
      setPassword('')
      // Refresh stats
      const newStats = getStorageStats()
      setStats(newStats)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSetupEncryption = async () => {
    if (password !== confirmPassword) {
      return
    }

    const sensitiveKeys = [
      'spotify_tokens',
      'personal_notes', 
      'private_links',
      'api_keys'
    ]

    await setupEncryption(password, sensitiveKeys)
    setPassword('')
    setConfirmPassword('')
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Data Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'export', label: 'Export/Import', icon: '📤' },
            { id: 'backups', label: 'Backups', icon: '💾' },
            { id: 'encryption', label: 'Encryption', icon: '🔒' },
            { id: 'stats', label: 'Statistics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Export/Import Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Export Data</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 bg-gray-700 text-orange-500"
                      />
                      Include backups
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600 bg-gray-700 text-orange-500"
                      />
                      Encrypt export
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (optional for encryption)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 py-2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleExport({ 
                      encrypt: password.length > 0,
                      includeBackups: false 
                    })}
                    disabled={dataLoading}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {dataLoading ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">Import Data</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={importOptions.overwrite}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          overwrite: e.target.checked
                        }))}
                        className="rounded border-gray-600 bg-gray-700 text-orange-500"
                      />
                      Overwrite existing
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={importOptions.createBackup}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          createBackup: e.target.checked
                        }))}
                        className="rounded border-gray-600 bg-gray-700 text-orange-500"
                      />
                      Create backup
                    </label>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (if data is encrypted)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                  />
                </div>
              </div>

              {/* Progress/Error Display */}
              {(dataProgress || dataError) && (
                <div className={`p-4 rounded-lg ${
                  dataError ? 'bg-red-900/50 text-red-200' : 'bg-blue-900/50 text-blue-200'
                }`}>
                  {dataError || dataProgress}
                </div>
              )}
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Data Backups</h3>
                <button
                  onClick={() => loadBackups()}
                  disabled={backupLoading}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Refresh
                </button>
              </div>

              {backupLoading ? (
                <div className="text-center py-8 text-gray-400">Loading backups...</div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No backups found</div>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{backup.originalKey || 'Unknown'}</div>
                        <div className="text-sm text-gray-400">
                          {formatDate(backup.backupTimestamp)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreFromBackup(backup.originalKey, password)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.originalKey)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {backupError && (
                <div className="p-4 bg-red-900/50 text-red-200 rounded-lg">
                  {backupError}
                </div>
              )}
            </div>
          )}

          {/* Encryption Tab */}
          {activeTab === 'encryption' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4">
                  Encryption Status: {encryptionSetup ? '🔒 Enabled' : '🔓 Disabled'}
                </h3>

                {!encryptionSetup ? (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Enable encryption to protect sensitive data like API keys, personal notes, and private links.
                    </p>
                    
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="Enter encryption password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      />
                      
                      <button
                        onClick={handleSetupEncryption}
                        disabled={!password || password !== confirmPassword || encryptionLoading}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        {encryptionLoading ? 'Setting up...' : 'Enable Encryption'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-300 text-sm">
                      Encryption is enabled. Sensitive data is automatically encrypted.
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {/* Handle password change */}}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => {/* Handle disable encryption */}}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      >
                        Disable Encryption
                      </button>
                    </div>
                  </div>
                )}

                {encryptionError && (
                  <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
                    {encryptionError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Storage Statistics</h3>
              
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">{stats.totalKeys}</div>
                    <div className="text-sm text-gray-400">Total Keys</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.encryptedKeys}</div>
                    <div className="text-sm text-gray-400">Encrypted Keys</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{formatBytes(stats.totalSize)}</div>
                    <div className="text-sm text-gray-400">Total Size</div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.backupCount}</div>
                    <div className="text-sm text-gray-400">Backups</div>
                  </div>
                  
                  {stats.oldestBackup && (
                    <div className="bg-gray-800 rounded-lg p-4 col-span-2">
                      <div className="text-sm text-gray-400">Backup Range</div>
                      <div className="text-white">
                        {formatDate(stats.oldestBackup)} - {formatDate(stats.newestBackup)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">Loading statistics...</div>
              )}

              {/* Danger Zone */}
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mt-8">
                <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                <p className="text-red-200 text-sm mb-4">
                  This will permanently delete all stored data and cannot be undone.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                      clearAllData()
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DataManager