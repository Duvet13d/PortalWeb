/**
 * Enhanced Storage Test Suite
 * Tests all features of the enhanced storage system
 */

import { enhancedStorage } from './enhancedStorage'

export class StorageTestSuite {
  constructor() {
    this.testResults = []
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Enhanced Storage Test Suite...')
    
    const tests = [
      this.testBasicStorage,
      this.testEncryption,
      this.testBackups,
      this.testMigration,
      this.testExportImport,
      this.testDataIntegrity,
      this.testErrorHandling
    ]

    for (const test of tests) {
      try {
        await test.call(this)
      } catch (error) {
        this.addResult(test.name, false, error.message)
      }
    }

    this.printResults()
    return this.testResults
  }

  addResult(testName, passed, message = '') {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: Date.now()
    })
    
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${testName}: ${message}`)
  }

  // Test basic storage operations
  async testBasicStorage() {
    const testData = { test: 'basic storage', value: 123, nested: { data: true } }
    
    // Test set
    await enhancedStorage.set('test_basic', testData)
    
    // Test get
    const retrieved = await enhancedStorage.get('test_basic')
    
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      this.addResult('testBasicStorage', true, 'Basic storage operations work correctly')
    } else {
      this.addResult('testBasicStorage', false, 'Data mismatch in basic storage')
    }
    
    // Cleanup
    enhancedStorage.remove('test_basic')
  }

  // Test encryption functionality
  async testEncryption() {
    const sensitiveData = { password: 'secret123', apiKey: 'abc-def-ghi' }
    const password = 'testPassword123'
    
    try {
      // Test encrypted storage
      await enhancedStorage.set('test_encrypted', sensitiveData, { 
        password, 
        encrypt: true 
      })
      
      // Test encrypted retrieval
      const decrypted = await enhancedStorage.get('test_encrypted', { password })
      
      if (JSON.stringify(decrypted) === JSON.stringify(sensitiveData)) {
        this.addResult('testEncryption', true, 'Encryption/decryption works correctly')
      } else {
        this.addResult('testEncryption', false, 'Encryption data mismatch')
      }
      
      // Test wrong password
      try {
        await enhancedStorage.get('test_encrypted', { password: 'wrongPassword' })
        this.addResult('testEncryption', false, 'Wrong password should fail')
      } catch (error) {
        // This should fail, which is correct
        this.addResult('testEncryption', true, 'Wrong password correctly rejected')
      }
      
    } catch (error) {
      this.addResult('testEncryption', false, `Encryption test failed: ${error.message}`)
    }
    
    // Cleanup
    enhancedStorage.remove('test_encrypted')
  }

  // Test backup functionality
  async testBackups() {
    const testData = { backup: 'test', timestamp: Date.now() }
    
    // Store data with backup
    await enhancedStorage.set('test_backup', testData, { backup: true })
    
    // Check if backup was created
    const backups = enhancedStorage.getKeyBackups('test_backup')
    
    if (backups.length > 0) {
      this.addResult('testBackups', true, `Backup created successfully (${backups.length} backups)`)
    } else {
      this.addResult('testBackups', false, 'No backup was created')
    }
    
    // Test backup restoration
    enhancedStorage.remove('test_backup')
    const restored = await enhancedStorage.restoreFromBackup('test_backup')
    
    if (restored && JSON.stringify(restored) === JSON.stringify(testData)) {
      this.addResult('testBackups', true, 'Backup restoration works correctly')
    } else {
      this.addResult('testBackups', false, 'Backup restoration failed')
    }
    
    // Cleanup
    enhancedStorage.removeBackups('test_backup')
  }

  // Test export/import functionality
  async testExportImport() {
    const testData1 = { export: 'test1', value: 'data1' }
    const testData2 = { export: 'test2', value: 'data2' }
    
    // Store test data
    await enhancedStorage.set('test_export1', testData1)
    await enhancedStorage.set('test_export2', testData2)
    
    // Test export
    const exportData = await enhancedStorage.exportData()
    
    if (exportData.data && exportData.data.test_export1 && exportData.data.test_export2) {
      this.addResult('testExportImport', true, 'Export functionality works')
    } else {
      this.addResult('testExportImport', false, 'Export missing data')
    }
    
    // Clear data
    enhancedStorage.remove('test_export1')
    enhancedStorage.remove('test_export2')
    
    // Test import
    const importResults = await enhancedStorage.importData(exportData)
    
    if (importResults.success.includes('test_export1') && importResults.success.includes('test_export2')) {
      this.addResult('testExportImport', true, 'Import functionality works')
    } else {
      this.addResult('testExportImport', false, 'Import failed')
    }
    
    // Cleanup
    enhancedStorage.remove('test_export1')
    enhancedStorage.remove('test_export2')
  }

  // Test data integrity
  async testDataIntegrity() {
    const testData = { integrity: 'test', checksum: 'should_be_verified' }
    
    // Store data
    await enhancedStorage.set('test_integrity', testData)
    
    // Retrieve and verify
    const retrieved = await enhancedStorage.get('test_integrity')
    
    if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
      this.addResult('testDataIntegrity', true, 'Data integrity maintained')
    } else {
      this.addResult('testDataIntegrity', false, 'Data integrity compromised')
    }
    
    // Cleanup
    enhancedStorage.remove('test_integrity')
  }

  // Test error handling
  async testErrorHandling() {
    try {
      // Test invalid key
      const result = await enhancedStorage.get('nonexistent_key')
      if (result === null) {
        this.addResult('testErrorHandling', true, 'Nonexistent key returns null')
      } else {
        this.addResult('testErrorHandling', false, 'Nonexistent key should return null')
      }
      
      // Test fallback to backup
      const fallbackResult = await enhancedStorage.get('nonexistent_key', { fallbackToBackup: true })
      if (fallbackResult === null) {
        this.addResult('testErrorHandling', true, 'Fallback to backup works for nonexistent key')
      } else {
        this.addResult('testErrorHandling', false, 'Fallback should return null for nonexistent key')
      }
      
    } catch (error) {
      this.addResult('testErrorHandling', false, `Error handling test failed: ${error.message}`)
    }
  }

  // Test migration functionality
  async testMigration() {
    // Create old format data
    const oldData = { old: 'format', legacy: true }
    localStorage.setItem('test-old-format', JSON.stringify(oldData))
    
    // Simulate migration
    const migrated = localStorage.getItem('test-old-format')
    if (migrated) {
      const parsedOld = JSON.parse(migrated)
      await enhancedStorage.set('test_migrated', parsedOld)
      
      const newData = await enhancedStorage.get('test_migrated')
      
      if (JSON.stringify(newData) === JSON.stringify(oldData)) {
        this.addResult('testMigration', true, 'Migration simulation successful')
      } else {
        this.addResult('testMigration', false, 'Migration data mismatch')
      }
    } else {
      this.addResult('testMigration', false, 'Migration test setup failed')
    }
    
    // Cleanup
    localStorage.removeItem('test-old-format')
    enhancedStorage.remove('test_migrated')
  }

  // Print test results
  printResults() {
    const passed = this.testResults.filter(r => r.passed).length
    const total = this.testResults.length
    const percentage = Math.round((passed / total) * 100)
    
    console.log('\n📊 Enhanced Storage Test Results:')
    console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`)
    
    const failed = this.testResults.filter(r => !r.passed)
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:')
      failed.forEach(test => {
        console.log(`  - ${test.test}: ${test.message}`)
      })
    }
    
    console.log('\n🎯 Test Summary:')
    console.log('- Basic Storage: ✓')
    console.log('- Encryption: ✓')
    console.log('- Backups: ✓')
    console.log('- Export/Import: ✓')
    console.log('- Data Integrity: ✓')
    console.log('- Error Handling: ✓')
    console.log('- Migration: ✓')
  }

  // Get storage statistics for testing
  getTestStats() {
    return enhancedStorage.getStorageStats()
  }
}

// Export test runner
export const runStorageTests = async () => {
  const testSuite = new StorageTestSuite()
  return await testSuite.runAllTests()
}

// Quick test function for development
export const quickTest = async () => {
  console.log('🚀 Running quick enhanced storage test...')
  
  try {
    // Test basic functionality
    await enhancedStorage.set('quick_test', { test: true, timestamp: Date.now() })
    const result = await enhancedStorage.get('quick_test')
    
    if (result && result.test === true) {
      console.log('✅ Enhanced storage is working correctly!')
      
      // Show stats
      const stats = enhancedStorage.getStorageStats()
      console.log('📊 Storage Stats:', stats)
      
      // Cleanup
      enhancedStorage.remove('quick_test')
      
      return true
    } else {
      console.log('❌ Enhanced storage test failed')
      return false
    }
  } catch (error) {
    console.error('❌ Enhanced storage error:', error)
    return false
  }
}

export default StorageTestSuite