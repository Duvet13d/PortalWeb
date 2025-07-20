/**
 * Migration Helper - Assists with migrating data from old localStorage format to enhanced storage
 */

import React from 'react'
import { enhancedStorage } from './enhancedStorage'

export class MigrationHelper {
  constructor() {
    this.migrationStatus = {
      completed: false,
      errors: [],
      migrated: [],
      skipped: []
    }
  }

  // Check if migration is needed
  async checkMigrationNeeded() {
    const oldKeys = [
      'homepage-widgets',
      'homepage-theme',
      'homepage-notes',
      'custom-links',
      'notes-settings'
    ]

    const needsMigration = oldKeys.some(key => localStorage.getItem(key) !== null)
    const alreadyMigrated = await enhancedStorage.get('migration_completed')

    return needsMigration && !alreadyMigrated
  }

  // Perform automatic migration
  async performMigration(options = {}) {
    try {
      console.log('Starting data migration to enhanced storage...')
      
      const migrations = [
        {
          oldKey: 'homepage-widgets',
          newKey: 'widgets',
          transform: (data) => data
        },
        {
          oldKey: 'homepage-theme',
          newKey: 'theme',
          transform: (data) => data
        },
        {
          oldKey: 'homepage-notes',
          newKey: 'personal_notes',
          transform: (data) => data,
          sensitive: true
        },
        {
          oldKey: 'custom-links',
          newKey: 'custom_links',
          transform: (data) => data
        },
        {
          oldKey: 'notes-settings',
          newKey: 'notes_settings',
          transform: (data) => data
        }
      ]

      for (const migration of migrations) {
        try {
          const oldData = localStorage.getItem(migration.oldKey)
          if (oldData) {
            const parsedData = JSON.parse(oldData)
            const transformedData = migration.transform(parsedData)
            
            await enhancedStorage.set(migration.newKey, transformedData, {
              backup: true,
              encrypt: migration.sensitive && options.encryptSensitive
            })

            this.migrationStatus.migrated.push({
              from: migration.oldKey,
              to: migration.newKey,
              encrypted: migration.sensitive && options.encryptSensitive
            })

            // Keep old data for safety during migration period
            if (options.removeOldData) {
              localStorage.removeItem(migration.oldKey)
            }
          } else {
            this.migrationStatus.skipped.push({
              key: migration.oldKey,
              reason: 'No data found'
            })
          }
        } catch (error) {
          this.migrationStatus.errors.push({
            key: migration.oldKey,
            error: error.message
          })
        }
      }

      // Mark migration as completed
      await enhancedStorage.set('migration_completed', {
        timestamp: Date.now(),
        version: '1.0.0',
        status: this.migrationStatus
      })

      this.migrationStatus.completed = true
      console.log('Migration completed successfully:', this.migrationStatus)
      
      return this.migrationStatus
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  // Get migration status
  getMigrationStatus() {
    return this.migrationStatus
  }

  // Rollback migration (restore from old localStorage)
  async rollbackMigration() {
    try {
      console.log('Rolling back migration...')
      
      const migrationRecord = await enhancedStorage.get('migration_completed')
      if (!migrationRecord) {
        throw new Error('No migration record found')
      }

      // Clear enhanced storage data
      const keysToRemove = migrationRecord.status.migrated.map(m => m.to)
      for (const key of keysToRemove) {
        enhancedStorage.remove(key)
      }

      // Remove migration record
      enhancedStorage.remove('migration_completed')

      console.log('Migration rollback completed')
      return true
    } catch (error) {
      console.error('Rollback failed:', error)
      throw error
    }
  }

  // Clean up old localStorage data after successful migration
  async cleanupOldData() {
    try {
      const migrationRecord = await enhancedStorage.get('migration_completed')
      if (!migrationRecord) {
        throw new Error('No migration record found')
      }

      const oldKeys = migrationRecord.status.migrated.map(m => m.from)
      for (const key of oldKeys) {
        localStorage.removeItem(key)
      }

      console.log('Old data cleanup completed')
      return true
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    }
  }
}

// Global migration helper instance
export const migrationHelper = new MigrationHelper()

// Auto-migration hook for React components
export const useAutoMigration = () => {
  const [migrationNeeded, setMigrationNeeded] = React.useState(false)
  const [migrationStatus, setMigrationStatus] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkAndMigrate = async () => {
      try {
        const needed = await migrationHelper.checkMigrationNeeded()
        setMigrationNeeded(needed)

        if (needed) {
          // Perform automatic migration
          const status = await migrationHelper.performMigration({
            encryptSensitive: false, // Don't encrypt by default during migration
            removeOldData: false // Keep old data for safety
          })
          setMigrationStatus(status)
        }
      } catch (error) {
        console.error('Auto-migration failed:', error)
        setMigrationStatus({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    checkAndMigrate()
  }, [])

  return {
    migrationNeeded,
    migrationStatus,
    loading,
    performMigration: migrationHelper.performMigration.bind(migrationHelper),
    rollbackMigration: migrationHelper.rollbackMigration.bind(migrationHelper),
    cleanupOldData: migrationHelper.cleanupOldData.bind(migrationHelper)
  }
}

export default migrationHelper