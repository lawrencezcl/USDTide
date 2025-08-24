#!/usr/bin/env node

/**
 * Test runner for USDTide frontend components
 * This script runs all unit tests and generates a report
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

// Test configuration
const testConfig = {
  verbose: true,
  watch: false,
  coverage: true
}

// Test files to run
const testFiles = [
  'src/views/__tests__/Profile.test.js',
  'src/views/__tests__/Staking.test.js',
  'src/views/__tests__/Lending.test.js',
  'src/views/__tests__/Invite.test.js'
]

async function runTests() {
  console.log('🚀 Starting USDTide frontend tests...\n')
  
  let passedTests = 0
  let failedTests = 0
  let totalTests = 0
  
  for (const testFile of testFiles) {
    try {
      console.log(`🧪 Running tests for ${testFile}...`)
      
      const command = `npx vitest run ${testFile} --reporter=verbose`
      const { stdout, stderr } = await execPromise(command, {
        cwd: path.join(process.cwd(), 'frontend')
      })
      
      console.log(stdout)
      
      if (stderr) {
        console.error('STDERR:', stderr)
      }
      
      // Parse test results (simplified)
      const passedMatch = stdout.match(/(\d+) passed/)
      const failedMatch = stdout.match(/(\d+) failed/)
      const totalMatch = stdout.match(/(\d+) total/)
      
      if (passedMatch) passedTests += parseInt(passedMatch[1])
      if (failedMatch) failedTests += parseInt(failedMatch[1])
      if (totalMatch) totalTests += parseInt(totalMatch[1])
      
      console.log(`✅ Completed tests for ${testFile}\n`)
      
    } catch (error) {
      console.error(`❌ Failed to run tests for ${testFile}:`, error.message)
      failedTests += 1
    }
  }
  
  // Summary
  console.log('\n📋 Test Summary:')
  console.log(`📊 Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📈 Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%`)
  
  if (failedTests > 0) {
    console.log('\n⚠️  Some tests failed. Please review the output above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner failed:', error)
  process.exit(1)
})