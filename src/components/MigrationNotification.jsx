/**
 * Migration Notification Component
 * Notifies users about data migration to enhanced storage system
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { migrationHelper } from '../utils/migrationHelper'

const MigrationNotification = () => {
  const [showNotification, setShowNotification] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkMigration = async () => {
      try {
        const needed = await migrationHelper.checkMigrationNeeded()
        setShowNotification(needed)
      } catch (error) {
        console.error('Failed to check migration status:', error)
      }
    }

    checkMigration()
  }, [])

  const handleMigrate = async () => {
    try {
      setLoading(true)
      const status = await migrationHelper.performMigration({
        encryptSensitive: false,
        removeOldData: false
      })
      setMigrationStatus(status)
      
      // Hide notification after successful migration
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    } catch (error) {
      setMigrationStatus({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">
                Data Storage Upgrade Available
              </h3>
              
              {!migrationStatus ? (
                <div>
                  <p className="text-blue-200 text-sm mb-3">
                    We've enhanced our data storage system with encryption, backups, and better reliability. 
                    Would you like to upgrade your existing data?
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleMigrate}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
                    >
                      {loading ? 'Upgrading...' : 'Upgrade Now'}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              ) : migrationStatus.error ? (
                <div>
                  <p className="text-red-200 text-sm mb-2">
                    Migration failed: {migrationStatus.error}
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-green-200 text-sm mb-2">
                    ✅ Migration completed successfully!
                  </p>
                  <div className="text-xs text-blue-200">
                    <div>Migrated: {migrationStatus.migrated?.length || 0} items</div>
                    <div>Errors: {migrationStatus.errors?.length || 0}</div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MigrationNotification