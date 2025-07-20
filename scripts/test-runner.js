#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'blue')
  try {
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    return false
  }
}

function createTestReport() {
  const reportDir = 'test-results'
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    results: {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 }
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    }
  }
  
  // This would be populated by actual test results
  fs.writeFileSync(
    path.join(reportDir, 'test-summary.json'),
    JSON.stringify(report, null, 2)
  )
}

async function main() {
  log('🧪 Personal Portal Test Suite', 'cyan')
  log('================================', 'cyan')
  
  const args = process.argv.slice(2)
  const runAll = args.length === 0 || args.includes('--all')
  const runUnit = runAll || args.includes('--unit')
  const runIntegration = runAll || args.includes('--integration')
  const runE2E = runAll || args.includes('--e2e')
  const runPerformance = runAll || args.includes('--performance')
  const runCoverage = runAll || args.includes('--coverage')
  const runLint = runAll || args.includes('--lint')
  
  let allPassed = true
  
  // Linting
  if (runLint) {
    const lintPassed = runCommand('npm run lint', 'Running ESLint')
    allPassed = allPassed && lintPassed
  }
  
  // Unit Tests
  if (runUnit) {
    const unitPassed = runCommand(
      'vitest run --reporter=verbose --reporter=json --outputFile=test-results/unit-results.json',
      'Running unit tests'
    )
    allPassed = allPassed && unitPassed
  }
  
  // Integration Tests
  if (runIntegration) {
    const integrationPassed = runCommand(
      'vitest run src/test/integration --reporter=verbose',
      'Running integration tests'
    )
    allPassed = allPassed && integrationPassed
  }
  
  // Coverage Report
  if (runCoverage) {
    const coveragePassed = runCommand(
      'vitest run --coverage --reporter=verbose',
      'Generating coverage report'
    )
    allPassed = allPassed && coveragePassed
  }
  
  // Build before E2E tests
  if (runE2E) {
    const buildPassed = runCommand('npm run build', 'Building application for E2E tests')
    if (buildPassed) {
      const e2ePassed = runCommand(
        'playwright test --reporter=html --output-dir=test-results/e2e',
        'Running end-to-end tests'
      )
      allPassed = allPassed && e2ePassed
    } else {
      allPassed = false
    }
  }
  
  // Performance Tests
  if (runPerformance) {
    const perfPassed = runCommand(
      'vitest run src/test/performance --reporter=verbose',
      'Running performance tests'
    )
    allPassed = allPassed && perfPassed
    
    // Lighthouse CI
    const lighthousePassed = runCommand(
      'lhci autorun --config=src/test/performance/lighthouse.config.js',
      'Running Lighthouse performance audit'
    )
    allPassed = allPassed && lighthousePassed
  }
  
  // Create test report
  createTestReport()
  
  // Summary
  log('\n📊 Test Summary', 'magenta')
  log('================', 'magenta')
  
  if (allPassed) {
    log('🎉 All tests passed!', 'green')
    process.exit(0)
  } else {
    log('💥 Some tests failed. Check the output above for details.', 'red')
    process.exit(1)
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('Personal Portal Test Runner', 'cyan')
  log('Usage: node scripts/test-runner.js [options]', 'yellow')
  log('\nOptions:')
  log('  --all          Run all tests (default)')
  log('  --unit         Run unit tests only')
  log('  --integration  Run integration tests only')
  log('  --e2e          Run end-to-end tests only')
  log('  --performance  Run performance tests only')
  log('  --coverage     Generate coverage report')
  log('  --lint         Run linting only')
  log('  --help, -h     Show this help message')
  process.exit(0)
}

main().catch(error => {
  log(`💥 Test runner failed: ${error.message}`, 'red')
  process.exit(1)
})