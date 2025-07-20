/**
 * React hooks for enhanced storage functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { enhancedStorage } from '../utils/enhancedStorage'

/**
 * Hook for using enhanced storage with encryption support
 */
export const useEnhancedStorage = (key, defaultValue = null, options = {}) => {
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [encrypted, setEncrypted] = useState(false)
  const passwordRef = useRef(options.password)

  // Update password ref when options change
  useEffect(() => {
    passwordRef.current = options.password
  }, [options.password])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await enhancedStorage.get(key, {
          password: passwordRef.current,
          fallbackToBackup: options.fallbackToBackup !== false
        })
        
        if (result !== null) {
          setData(result)
          setEncrypted(enhancedStorage.isSensitive(key))
        } else {
          setData(defaultValue)
        }
      } catch (err) {
        setError(err.message)
        setData(defaultValue)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, defaultValue, options.fallbackToBackup])

  // Save data function
  const saveData = useCallback(async (newData, saveOptions = {}) => {
    try {
      setError(null)
      
      await enhancedStorage.set(key, newData, {
        password: passwordRef.current || saveOptions.password,
        encrypt: saveOptions.encrypt || enhancedStorage.isSensitive(key),
        backup: saveOptions.backup !== false
      })
      
      setData(newData)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [key])

  // Remove data function
  const removeData = useCallback(async () => {
    try {
      setError(null)
      enhancedStorage.remove(key)
      setData(defaultValue)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [key, defaultValue])

  return {
    data,
    loading,
    error,
    encrypted,
    saveData,
    removeData,
    reload: () => {
      setLoading(true)
      // Trigger reload by changing a dependency
    }
  }
}

/**
 * Hook for managing data export/import
 */
export const useDataManager = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)

  const exportData = useCallback(async (options = {}) => {
    try {
      setLoading(true)
      setError(null)
      setProgress('Preparing export...')

      const exportData = await enhancedStorage.exportData({
        encrypt: options.encrypt,
        password: options.password,
        includeBackups: options.includeBackups
      })

      setProgress('Creating download...')

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `homepage-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setProgress('Export complete!')
      setTimeout(() => setProgress(null), 2000)

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const importData = useCallback(async (file, options = {}) => {
    try {
      setLoading(true)
      setError(null)
      setProgress('Reading file...')

      const text = await file.text()
      const importData = JSON.parse(text)

      setProgress('Importing data...')

      const results = await enhancedStorage.importData(importData, {
        password: options.password,
        overwrite: options.overwrite,
        force: options.force,
        createBackup: options.createBackup !== false,
        importBackups: options.importBackups
      })

      setProgress(`Import complete! Success: ${results.success.length}, Failed: ${results.failed.length}, Skipped: ${results.skipped.length}`)
      setTimeout(() => setProgress(null), 3000)

      return results
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getStorageStats = useCallback(() => {
    try {
      return enhancedStorage.getStorageStats()
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  const clearAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setProgress('Clearing all data...')

      enhancedStorage.clear()

      setProgress('Data cleared!')
      setTimeout(() => setProgress(null), 2000)

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    progress,
    exportData,
    importData,
    getStorageStats,
    clearAllData
  }
}

/**
 * Hook for managing backups
 */
export const useBackupManager = () => {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadBackups = useCallback(async (key = null) => {
    try {
      setLoading(true)
      setError(null)

      if (key) {
        // Get backups for specific key
        const keyBackups = enhancedStorage.getKeyBackups(key)
        setBackups(keyBackups)
      } else {
        // Get all backups
        const allBackups = await enhancedStorage.exportBackups()
        setBackups(Object.entries(allBackups).map(([backupKey, backup]) => ({
          key: backupKey,
          ...backup
        })))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreFromBackup = useCallback(async (key, password = null) => {
    try {
      setLoading(true)
      setError(null)

      const restored = await enhancedStorage.restoreFromBackup(key, { password })
      
      if (restored) {
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('storage:restored', {
          detail: { key, data: restored }
        }))
        return true
      }
      
      return false
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteBackup = useCallback((key) => {
    try {
      enhancedStorage.removeBackups(key)
      loadBackups() // Reload backups
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [loadBackups])

  return {
    backups,
    loading,
    error,
    loadBackups,
    restoreFromBackup,
    deleteBackup
  }
}

/**
 * Hook for storage encryption management
 */
export const useStorageEncryption = () => {
  const [isSetup, setIsSetup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if encryption is already set up
    const checkEncryption = () => {
      try {
        const hasEncryptedData = Object.keys(localStorage)
          .some(key => {
            if (key.startsWith('homepage_enhanced_')) {
              try {
                const item = JSON.parse(localStorage.getItem(key))
                return item.metadata?.encrypted
              } catch {
                return false
              }
            }
            return false
          })
        setIsSetup(hasEncryptedData)
      } catch (err) {
        setError(err.message)
      }
    }

    checkEncryption()
  }, [])

  const setupEncryption = useCallback(async (password, keysToEncrypt = []) => {
    try {
      setLoading(true)
      setError(null)

      // Encrypt specified keys
      for (const key of keysToEncrypt) {
        const data = await enhancedStorage.get(key, { fallbackToBackup: false })
        if (data) {
          await enhancedStorage.set(key, data, { 
            password, 
            encrypt: true,
            backup: true 
          })
        }
      }

      setIsSetup(true)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword, affectedKeys = []) => {
    try {
      setLoading(true)
      setError(null)

      // Re-encrypt all affected keys with new password
      for (const key of affectedKeys) {
        const data = await enhancedStorage.get(key, { password: oldPassword })
        if (data) {
          await enhancedStorage.set(key, data, { 
            password: newPassword, 
            encrypt: true,
            backup: true 
          })
        }
      }

      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const removeEncryption = useCallback(async (password, keysToDecrypt = []) => {
    try {
      setLoading(true)
      setError(null)

      // Decrypt specified keys
      for (const key of keysToDecrypt) {
        const data = await enhancedStorage.get(key, { password })
        if (data) {
          await enhancedStorage.set(key, data, { 
            encrypt: false,
            backup: true 
          })
        }
      }

      setIsSetup(false)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    isSetup,
    loading,
    error,
    setupEncryption,
    changePassword,
    removeEncryption
  }
}

export default {
  useEnhancedStorage,
  useDataManager,
  useBackupManager,
  useStorageEncryption
}