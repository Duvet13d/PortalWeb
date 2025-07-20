/**
 * Enhanced Storage System with Encryption, Migration, Export/Import, and Backup
 * Implements requirements 3.2, 3.3, 9.1, 9.2 for secure data persistence
 */

// Simple encryption utilities using Web Crypto API
class StorageEncryption {
  constructor() {
    this.algorithm = 'AES-GCM'
    this.keyLength = 256
    this.ivLength = 12
  }

  // Generate a key from password using PBKDF2
  async deriveKey(password, salt) {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    )
  }

  // Generate random salt
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16))
  }

  // Generate random IV
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivLength))
  }

  // Encrypt data
  async encrypt(data, password) {
    try {
      const encoder = new TextEncoder()
      const salt = this.generateSalt()
      const iv = this.generateIV()
      const key = await this.deriveKey(password, salt)

      const encrypted = await crypto.subtle.encrypt(
        { name: this.algorithm, iv: iv },
        key,
        encoder.encode(JSON.stringify(data))
      )

      // Combine salt, iv, and encrypted data
      const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      result.set(salt, 0)
      result.set(iv, salt.length)
      result.set(new Uint8Array(encrypted), salt.length + iv.length)

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result))
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  // Decrypt data
  async decrypt(encryptedData, password) {
    try {
      // Convert from base64
      const data = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )

      // Extract salt, iv, and encrypted content
      const salt = data.slice(0, 16)
      const iv = data.slice(16, 16 + this.ivLength)
      const encrypted = data.slice(16 + this.ivLength)

      const key = await this.deriveKey(password, salt)

      const decrypted = await crypto.subtle.decrypt(
        { name: this.algorithm, iv: iv },
        key,
        encrypted
      )

      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(decrypted))
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data - invalid password or corrupted data')
    }
  }
}

// Enhanced Storage Manager
export class EnhancedStorageManager {
  constructor(options = {}) {
    this.prefix = options.prefix || 'homepage_'
    this.version = options.version || '1.0.0'
    this.encryption = new StorageEncryption()
    this.sensitiveKeys = new Set(options.sensitiveKeys || [
      'spotify-tokens',
      'api-keys',
      'personal-notes',
      'private-links'
    ])
    this.migrationHandlers = new Map()
    this.backupInterval = options.backupInterval || 24 * 60 * 60 * 1000 // 24 hours
    this.maxBackups = options.maxBackups || 5
    
    this.init()
  }

  async init() {
    await this.runMigrations()
    this.setupAutoBackup()
    this.cleanupOldBackups()
  }

  // Check if a key contains sensitive data
  isSensitive(key) {
    return this.sensitiveKeys.has(key) || key.includes('password') || key.includes('token')
  }

  // Generate storage key with prefix
  getStorageKey(key) {
    return `${this.prefix}${key}`
  }

  // Set data with optional encryption
  async set(key, data, options = {}) {
    try {
      const storageKey = this.getStorageKey(key)
      const metadata = {
        version: this.version,
        timestamp: Date.now(),
        encrypted: false,
        checksum: null
      }

      let processedData = data

      // Encrypt sensitive data if password provided or if key is sensitive
      if (this.isSensitive(key) && (options.password || options.encrypt)) {
        if (!options.password) {
          throw new Error('Password required for sensitive data')
        }
        processedData = await this.encryption.encrypt(data, options.password)
        metadata.encrypted = true
      }

      // Generate checksum for data integrity
      metadata.checksum = await this.generateChecksum(JSON.stringify(data))

      const storageItem = {
        data: processedData,
        metadata
      }

      localStorage.setItem(storageKey, JSON.stringify(storageItem))
      
      // Create backup if this is important data
      if (options.backup !== false) {
        await this.createBackup(key, data, metadata)
      }

      return true
    } catch (error) {
      console.error('Failed to store data:', error)
      throw error
    }
  }

  // Get data with optional decryption
  async get(key, options = {}) {
    try {
      const storageKey = this.getStorageKey(key)
      const item = localStorage.getItem(storageKey)
      
      if (!item) return null

      const storageItem = JSON.parse(item)
      const { data, metadata } = storageItem

      // Verify data integrity if checksum exists
      if (metadata.checksum && !metadata.encrypted) {
        const currentChecksum = await this.generateChecksum(JSON.stringify(data))
        if (currentChecksum !== metadata.checksum) {
          console.warn(`Data integrity check failed for key: ${key}`)
          // Try to restore from backup
          return await this.restoreFromBackup(key, options)
        }
      }

      // Decrypt if encrypted
      if (metadata.encrypted) {
        if (!options.password) {
          throw new Error('Password required to decrypt sensitive data')
        }
        return await this.encryption.decrypt(data, options.password)
      }

      return data
    } catch (error) {
      console.error('Failed to retrieve data:', error)
      // Try to restore from backup on error
      if (options.fallbackToBackup !== false) {
        return await this.restoreFromBackup(key, options)
      }
      throw error
    }
  }

  // Remove data
  remove(key) {
    try {
      const storageKey = this.getStorageKey(key)
      localStorage.removeItem(storageKey)
      // Also remove any backups
      this.removeBackups(key)
      return true
    } catch (error) {
      console.error('Failed to remove data:', error)
      return false
    }
  }

  // Clear all data with prefix
  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
      keys.forEach(key => localStorage.removeItem(key))
      this.clearAllBackups()
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      return false
    }
  }

  // Generate checksum for data integrity
  async generateChecksum(data) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Export all data
  async exportData(options = {}) {
    try {
      const exportData = {
        version: this.version,
        timestamp: Date.now(),
        data: {},
        metadata: {
          encrypted: options.encrypt || false,
          includeBackups: options.includeBackups || false
        }
      }

      // Get all keys with our prefix
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))

      // Export each key
      for (const key of keys) {
        try {
          const data = await this.get(key, { password: options.password, fallbackToBackup: false })
          if (data !== null) {
            exportData.data[key] = data
          }
        } catch (error) {
          console.warn(`Failed to export key ${key}:`, error)
          // Include error info in export
          exportData.data[key] = { error: error.message }
        }
      }

      // Include backups if requested
      if (options.includeBackups) {
        exportData.backups = await this.exportBackups()
      }

      // Encrypt entire export if requested
      if (options.encrypt && options.password) {
        const encryptedData = await this.encryption.encrypt(exportData, options.password)
        return {
          encrypted: true,
          version: this.version,
          data: encryptedData
        }
      }

      return exportData
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  // Import data
  async importData(importData, options = {}) {
    try {
      let data = importData

      // Decrypt if encrypted
      if (importData.encrypted && options.password) {
        data = await this.encryption.decrypt(importData.data, options.password)
      }

      // Validate import data structure
      if (!data.version || !data.data) {
        throw new Error('Invalid import data format')
      }

      // Check version compatibility
      if (data.version !== this.version && !options.force) {
        throw new Error(`Version mismatch: expected ${this.version}, got ${data.version}`)
      }

      const results = {
        success: [],
        failed: [],
        skipped: []
      }

      // Import each key
      for (const [key, value] of Object.entries(data.data)) {
        try {
          if (value.error) {
            results.skipped.push({ key, reason: 'Export error: ' + value.error })
            continue
          }

          // Check if key already exists
          if (!options.overwrite && await this.get(key, { fallbackToBackup: false })) {
            results.skipped.push({ key, reason: 'Key already exists' })
            continue
          }

          await this.set(key, value, { 
            password: options.password,
            backup: options.createBackup !== false 
          })
          results.success.push(key)
        } catch (error) {
          results.failed.push({ key, error: error.message })
        }
      }

      // Import backups if included
      if (data.backups && options.importBackups) {
        await this.importBackups(data.backups)
      }

      return results
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  // Create backup
  async createBackup(key, data, metadata) {
    try {
      const backupKey = `${this.prefix}backup_${key}_${Date.now()}`
      const backup = {
        originalKey: key,
        data,
        metadata,
        backupTimestamp: Date.now()
      }

      localStorage.setItem(backupKey, JSON.stringify(backup))
      
      // Clean up old backups for this key
      await this.cleanupKeyBackups(key)
    } catch (error) {
      console.warn('Failed to create backup:', error)
    }
  }

  // Restore from backup
  async restoreFromBackup(key, options = {}) {
    try {
      const backups = this.getKeyBackups(key)
      if (backups.length === 0) return null

      // Get the most recent backup
      const latestBackup = backups[0]
      console.log(`Restoring ${key} from backup created at ${new Date(latestBackup.backupTimestamp)}`)
      
      return latestBackup.data
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return null
    }
  }

  // Get backups for a specific key
  getKeyBackups(key) {
    const backupPrefix = `${this.prefix}backup_${key}_`
    return Object.keys(localStorage)
      .filter(storageKey => storageKey.startsWith(backupPrefix))
      .map(storageKey => {
        try {
          return JSON.parse(localStorage.getItem(storageKey))
        } catch {
          return null
        }
      })
      .filter(backup => backup !== null)
      .sort((a, b) => b.backupTimestamp - a.backupTimestamp)
  }

  // Clean up old backups for a key
  async cleanupKeyBackups(key) {
    const backups = this.getKeyBackups(key)
    const backupKeys = Object.keys(localStorage)
      .filter(storageKey => storageKey.startsWith(`${this.prefix}backup_${key}_`))
      .sort()

    // Keep only the most recent backups
    if (backupKeys.length > this.maxBackups) {
      const toRemove = backupKeys.slice(0, backupKeys.length - this.maxBackups)
      toRemove.forEach(key => localStorage.removeItem(key))
    }
  }

  // Remove all backups for a key
  removeBackups(key) {
    const backupPrefix = `${this.prefix}backup_${key}_`
    const backupKeys = Object.keys(localStorage).filter(storageKey => 
      storageKey.startsWith(backupPrefix)
    )
    backupKeys.forEach(key => localStorage.removeItem(key))
  }

  // Clear all backups
  clearAllBackups() {
    const backupPrefix = `${this.prefix}backup_`
    const backupKeys = Object.keys(localStorage).filter(storageKey => 
      storageKey.startsWith(backupPrefix)
    )
    backupKeys.forEach(key => localStorage.removeItem(key))
  }

  // Export backups
  async exportBackups() {
    const backupPrefix = `${this.prefix}backup_`
    const backups = {}
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(backupPrefix))
      .forEach(key => {
        try {
          backups[key] = JSON.parse(localStorage.getItem(key))
        } catch (error) {
          console.warn(`Failed to export backup ${key}:`, error)
        }
      })

    return backups
  }

  // Import backups
  async importBackups(backups) {
    for (const [key, backup] of Object.entries(backups)) {
      try {
        localStorage.setItem(key, JSON.stringify(backup))
      } catch (error) {
        console.warn(`Failed to import backup ${key}:`, error)
      }
    }
  }

  // Setup automatic backup
  setupAutoBackup() {
    // Create periodic backups of all data
    setInterval(async () => {
      try {
        const exportData = await this.exportData({ includeBackups: false })
        const backupKey = `${this.prefix}auto_backup_${Date.now()}`
        localStorage.setItem(backupKey, JSON.stringify(exportData))
        
        // Clean up old auto backups
        this.cleanupAutoBackups()
      } catch (error) {
        console.warn('Auto backup failed:', error)
      }
    }, this.backupInterval)
  }

  // Clean up old automatic backups
  cleanupAutoBackups() {
    const autoBackupPrefix = `${this.prefix}auto_backup_`
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(autoBackupPrefix))
      .sort()

    if (backupKeys.length > this.maxBackups) {
      const toRemove = backupKeys.slice(0, backupKeys.length - this.maxBackups)
      toRemove.forEach(key => localStorage.removeItem(key))
    }
  }

  // Clean up old backups
  cleanupOldBackups() {
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    const now = Date.now()
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${this.prefix}backup_`))
      .forEach(key => {
        try {
          const backup = JSON.parse(localStorage.getItem(key))
          if (backup.backupTimestamp && (now - backup.backupTimestamp > maxAge)) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          // Remove corrupted backup
          localStorage.removeItem(key)
        }
      })
  }

  // Migration system
  addMigration(fromVersion, toVersion, handler) {
    const migrationKey = `${fromVersion}->${toVersion}`
    this.migrationHandlers.set(migrationKey, handler)
  }

  async runMigrations() {
    try {
      const currentVersion = this.getCurrentStorageVersion()
      if (currentVersion === this.version) return

      console.log(`Running migrations from ${currentVersion} to ${this.version}`)

      // Run migration handlers
      for (const [migrationKey, handler] of this.migrationHandlers) {
        const [fromVersion, toVersion] = migrationKey.split('->')
        if (this.shouldRunMigration(currentVersion, fromVersion, toVersion)) {
          console.log(`Running migration: ${migrationKey}`)
          await handler(this)
        }
      }

      // Update version
      this.setStorageVersion(this.version)
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  getCurrentStorageVersion() {
    try {
      const versionKey = `${this.prefix}version`
      return localStorage.getItem(versionKey) || '0.0.0'
    } catch {
      return '0.0.0'
    }
  }

  setStorageVersion(version) {
    const versionKey = `${this.prefix}version`
    localStorage.setItem(versionKey, version)
  }

  shouldRunMigration(currentVersion, fromVersion, toVersion) {
    // Simple version comparison - in production, use a proper semver library
    return currentVersion === fromVersion || 
           (currentVersion < toVersion && currentVersion >= fromVersion)
  }

  // Get storage statistics
  getStorageStats() {
    const stats = {
      totalKeys: 0,
      encryptedKeys: 0,
      totalSize: 0,
      backupCount: 0,
      oldestBackup: null,
      newestBackup: null
    }

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        stats.totalKeys++
        
        try {
          const item = localStorage.getItem(key)
          stats.totalSize += item.length

          if (key.includes('backup_')) {
            stats.backupCount++
            const backup = JSON.parse(item)
            if (backup.backupTimestamp) {
              if (!stats.oldestBackup || backup.backupTimestamp < stats.oldestBackup) {
                stats.oldestBackup = backup.backupTimestamp
              }
              if (!stats.newestBackup || backup.backupTimestamp > stats.newestBackup) {
                stats.newestBackup = backup.backupTimestamp
              }
            }
          } else {
            const storageItem = JSON.parse(item)
            if (storageItem.metadata?.encrypted) {
              stats.encryptedKeys++
            }
          }
        } catch (error) {
          // Skip corrupted items
        }
      }
    })

    return stats
  }
}

// Global enhanced storage instance
export const enhancedStorage = new EnhancedStorageManager({
  prefix: 'homepage_enhanced_',
  version: '1.0.0',
  sensitiveKeys: [
    'spotify-tokens',
    'api-keys', 
    'weather-api-key',
    'personal-notes',
    'private-links',
    'user-credentials'
  ]
})

// Migration examples
enhancedStorage.addMigration('0.0.0', '1.0.0', async (storage) => {
  // Migrate from old localStorage format to new enhanced format
  const oldKeys = [
    'homepage-widgets',
    'homepage-theme', 
    'homepage-notes',
    'custom-links'
  ]

  for (const oldKey of oldKeys) {
    const oldData = localStorage.getItem(oldKey)
    if (oldData) {
      try {
        const parsedData = JSON.parse(oldData)
        const newKey = oldKey.replace('homepage-', '').replace('-', '_')
        await storage.set(newKey, parsedData, { backup: true })
        // Keep old data for safety during migration
      } catch (error) {
        console.warn(`Failed to migrate ${oldKey}:`, error)
      }
    }
  }
})

export default enhancedStorage