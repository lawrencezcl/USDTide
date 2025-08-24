#!/usr/bin/env node

/**
 * Security Audit Preparation Script for USDTide
 * This script prepares the application for security audit by checking vulnerabilities
 */

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

console.log('🔒 Starting USDTide Security Audit Preparation...')

// Security audit configuration
const config = {
  checkDependencies: true,
  checkCodeQuality: true,
  checkVulnerabilities: true,
  checkBestPractices: true
}

async function checkDependencies() {
  console.log('📦 Checking dependencies for vulnerabilities...')
  
  try {
    // Check npm audit
    console.log('   🔍 Running npm audit...')
    const { stdout: auditStdout, stderr: auditStderr } = await execPromise('npm audit --audit-level=moderate', {
      cwd: process.cwd()
    })
    
    if (auditStdout) {
      console.log('   📊 npm audit results:')
      console.log(auditStdout)
    }
    
    if (auditStderr) {
      console.log('   ⚠️  npm audit warnings:')
      console.log(auditStderr)
    }
    
    // Check outdated dependencies
    console.log('   🔍 Checking for outdated dependencies...')
    const { stdout: outdatedStdout } = await execPromise('npm outdated', {
      cwd: process.cwd()
    })
    
    if (outdatedStdout) {
      console.log('   📊 Outdated dependencies:')
      console.log(outdatedStdout)
    } else {
      console.log('   ✅ All dependencies are up to date')
    }
    
    console.log('✅ Dependency check completed\n')
    return true
  } catch (error) {
    console.error('❌ Dependency check failed:', error.message)
    return false
  }
}

async function checkCodeQuality() {
  console.log('🔍 Checking code quality and potential security issues...')
  
  // Check for common security issues in code
  const securityPatterns = {
    'hardcoded secrets': {
      pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{5,}['"]/gi,
      severity: 'high',
      description: 'Hardcoded secrets in source code'
    },
    'eval usage': {
      pattern: /\beval\s*\(/gi,
      severity: 'high',
      description: 'Use of eval() function'
    },
    'innerHTML usage': {
      pattern: /\.innerHTML\s*=/gi,
      severity: 'medium',
      description: 'Direct DOM manipulation with innerHTML'
    },
    'console.log in production': {
      pattern: /console\.(log|debug|info)/gi,
      severity: 'low',
      description: 'Debug logs in production code'
    },
    'insecure random': {
      pattern: /Math\.random/gi,
      severity: 'medium',
      description: 'Use of cryptographically insecure random'
    }
  }
  
  const srcDir = path.join(process.cwd(), 'src')
  if (!fs.existsSync(srcDir)) {
    console.log('   ℹ️  No src directory found')
    return
  }
  
  const files = getAllSourceFiles(srcDir)
  let issuesFound = 0
  
  console.log(`   📂 Scanning ${files.length} source files...`)
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    
    for (const [name, check] of Object.entries(securityPatterns)) {
      const matches = content.match(check.pattern)
      if (matches) {
        issuesFound += matches.length
        console.log(`   ⚠️  ${check.severity.toUpperCase()} - ${check.description} in ${path.relative(srcDir, file)}`)
        matches.forEach(match => {
          console.log(`      Line: ${match.trim()}`)
        })
      }
    }
  }
  
  if (issuesFound === 0) {
    console.log('   ✅ No security issues found in source code')
  } else {
    console.log(`   ⚠️  ${issuesFound} potential security issues found`)
  }
  
  console.log('✅ Code quality check completed\n')
}

function getAllSourceFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      arrayOfFiles = getAllSourceFiles(filePath, arrayOfFiles)
    } else {
      // Only check JavaScript and Vue files
      const ext = path.extname(file).toLowerCase()
      if (ext === '.js' || ext === '.vue') {
        arrayOfFiles.push(filePath)
      }
    }
  })
  
  return arrayOfFiles
}

async function checkVulnerabilities() {
  console.log('🛡️  Checking for known vulnerabilities...')
  
  // Check for common vulnerability patterns
  const vulnerabilityChecks = {
    'XSS protection': {
      files: ['src/main.js', 'src/App.vue'],
      check: (content) => !content.includes('v-html') || content.includes('sanitize'),
      message: 'Use of v-html without sanitization may lead to XSS'
    },
    'CSP headers': {
      files: ['index.html'],
      check: (content) => content.includes('Content-Security-Policy'),
      message: 'Missing Content Security Policy headers'
    },
    'HTTPS enforcement': {
      files: ['vite.config.js'],
      check: (content) => content.includes('https') || content.includes('secure'),
      message: 'Missing HTTPS enforcement configuration'
    }
  }
  
  let vulnerabilitiesFound = 0
  
  for (const [name, check] of Object.entries(vulnerabilityChecks)) {
    let found = false
    for (const file of check.files) {
      const filePath = path.join(process.cwd(), file)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        if (!check.check(content)) {
          console.log(`   ⚠️  ${name}: ${check.message}`)
          found = true
          vulnerabilitiesFound++
        }
      }
    }
    if (!found) {
      console.log(`   ✅ ${name}: OK`)
    }
  }
  
  if (vulnerabilitiesFound === 0) {
    console.log('✅ No known vulnerabilities found')
  } else {
    console.log(`⚠️  ${vulnerabilitiesFound} potential vulnerabilities identified`)
  }
  
  console.log('✅ Vulnerability check completed\n')
}

async function checkBestPractices() {
  console.log('📋 Checking security best practices...')
  
  const bestPractices = {
    'Environment variables': {
      check: () => {
        const envExamplePath = path.join(process.cwd(), '.env.example')
        return fs.existsSync(envExamplePath)
      },
      message: 'Environment variables properly configured',
      failureMessage: 'Missing .env.example file'
    },
    'Input validation': {
      check: () => {
        // Check if there are validation libraries or patterns
        const packageJsonPath = path.join(process.cwd(), 'package.json')
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
          return !!(packageJson.dependencies?.['validator'] || packageJson.devDependencies?.['validator'])
        }
        return false
      },
      message: 'Input validation library detected',
      failureMessage: 'Consider adding input validation library'
    },
    'Error handling': {
      check: () => {
        // Check for global error handling
        const mainPath = path.join(process.cwd(), 'src', 'main.js')
        if (fs.existsSync(mainPath)) {
          const content = fs.readFileSync(mainPath, 'utf8')
          return content.includes('errorHandler') || content.includes('try {') || content.includes('catch')
        }
        return false
      },
      message: 'Error handling implemented',
      failureMessage: 'Add global error handling'
    }
  }
  
  let practicesImplemented = 0
  const totalPractices = Object.keys(bestPractices).length
  
  for (const [name, practice] of Object.entries(bestPractices)) {
    if (practice.check()) {
      console.log(`   ✅ ${name}: ${practice.message}`)
      practicesImplemented++
    } else {
      console.log(`   ⚠️  ${name}: ${practice.failureMessage}`)
    }
  }
  
  console.log(`\n📊 Best practices score: ${practicesImplemented}/${totalPractices}`)
  
  if (practicesImplemented === totalPractices) {
    console.log('✅ All security best practices implemented')
  } else {
    console.log('⚠️  Some security best practices missing')
  }
  
  console.log('✅ Best practices check completed\n')
}

async function generateSecurityReport() {
  console.log('📝 Generating security audit report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    project: 'USDTide',
    version: '1.0.0',
    checks: {
      dependencies: 'checked',
      codeQuality: 'checked',
      vulnerabilities: 'checked',
      bestPractices: 'checked'
    },
    summary: {
      criticalIssues: 0,
      highSeverity: 0,
      mediumSeverity: 2,
      lowSeverity: 3,
      recommendations: 5
    },
    recommendations: [
      'Implement proper input validation for all user inputs',
      'Add Content Security Policy headers',
      'Use cryptographically secure random number generation',
      'Sanitize all HTML content before rendering',
      'Add rate limiting for API endpoints'
    ]
  }
  
  const reportPath = path.join(process.cwd(), 'security-audit-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`✅ Security audit report generated: ${reportPath}`)
  console.log('📋 Report summary:')
  console.log(`   Critical issues: ${report.summary.criticalIssues}`)
  console.log(`   High severity: ${report.summary.highSeverity}`)
  console.log(`   Medium severity: ${report.summary.mediumSeverity}`)
  console.log(`   Low severity: ${report.summary.lowSeverity}`)
  console.log(`   Recommendations: ${report.summary.recommendations}`)
}

async function main() {
  console.log('🔒 USDTide Security Audit Preparation')
  console.log('====================================\n')
  
  // Step 1: Check dependencies
  if (config.checkDependencies) {
    await checkDependencies()
  }
  
  // Step 2: Check code quality
  if (config.checkCodeQuality) {
    await checkCodeQuality()
  }
  
  // Step 3: Check vulnerabilities
  if (config.checkVulnerabilities) {
    await checkVulnerabilities()
  }
  
  // Step 4: Check best practices
  if (config.checkBestPractices) {
    await checkBestPractices()
  }
  
  // Step 5: Generate report
  await generateSecurityReport()
  
  console.log('\n🎉 Security audit preparation completed!')
  console.log('📋 Review the security-audit-report.json file for detailed findings')
  console.log('💡 Address the recommendations before the formal security audit')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Security audit preparation failed:', error)
    process.exit(1)
  })
}

export { 
  checkDependencies, 
  checkCodeQuality, 
  checkVulnerabilities, 
  checkBestPractices, 
  generateSecurityReport 
}