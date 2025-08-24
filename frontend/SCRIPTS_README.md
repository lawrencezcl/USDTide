# USDTide Development Scripts

This directory contains various scripts to help with testing, deployment, and optimization of the USDTide application.

## Available Scripts

### 1. Test Runner (`test-runner.js`)
Runs all unit tests for the frontend components using Vitest.

**Usage:**
```bash
node test-runner.js
```

### 2. End-to-End Testing (`e2e-test.js`)
Tests the complete user flow on the Kaia testnet blockchain.

**Usage:**
```bash
node e2e-test.js
```

**Features:**
- Network connectivity verification
- Wallet balance checking
- Contract interaction testing
- Performance benchmarking
- Security checks

### 3. LINE MiniDapp Deployment (`deploy-minidapp.js`)
Prepares and deploys the application to LINE's MiniDapp platform.

**Usage:**
```bash
node deploy-minidapp.js
```

**Features:**
- Vue app building for production
- LINE MiniDapp package preparation
- Manifest generation
- Deployment simulation

### 4. Performance Optimization (`optimize-performance.js`)
Analyzes and optimizes the frontend performance.

**Usage:**
```bash
node optimize-performance.js
```

**Features:**
- Bundle size analysis
- Image optimization suggestions
- Load performance metrics
- Lighthouse audit simulation
- Optimization recommendations

### 5. Security Audit Preparation (`security-audit.js`)
Prepares the application for security audit by checking vulnerabilities.

**Usage:**
```bash
node security-audit.js
```

**Features:**
- Dependency vulnerability scanning
- Code quality analysis
- Known vulnerability checks
- Security best practice verification
- Audit report generation

## Requirements

- Node.js v16+
- npm or yarn
- Access to Kaia testnet (for E2E tests)

## Environment Variables

Some scripts may require environment variables to be set:

- `VITE_RPC_URL`: Kaia RPC endpoint
- `VITE_LIFF_ID`: LINE LIFF ID
- `TEST_PRIVATE_KEY`: Test wallet private key (for E2E tests)

## Running Tests

To run all tests:

```bash
# Run unit tests
npm run test:unit

# Run end-to-end tests
node e2e-test.js

# Run all development scripts
node test-runner.js && node optimize-performance.js && node security-audit.js
```

## Contributing

When adding new scripts:
1. Follow the existing naming convention
2. Include comprehensive error handling
3. Add usage documentation
4. Export functions for modularity
5. Test scripts thoroughly