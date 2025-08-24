# USDTide Development & Deployment Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git
- LINE Developer Account (for LIFF)
- Kaia Testnet Wallet

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/usdtide.git
cd usdtide

# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Environment Setup

1. **Contracts Environment**
```bash
cd contracts
cp .env.example .env
# Edit .env with your private key and configuration
```

2. **Frontend Environment**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your LIFF ID and contract addresses
```

### Development

```bash
# Start frontend development server
npm run frontend

# In another terminal, compile contracts
npm run contracts

# Run contract tests
npm run test

# Deploy to Kaia testnet
npm run deploy:testnet
```

## 📋 Project Structure

```
USDTide/
├── contracts/                 # Smart contracts
│   ├── contracts/            # Solidity files
│   │   ├── USDTStaking.sol   # Main staking contract
│   │   ├── USDTLending.sol   # Lending contract
│   │   ├── MockUSDT.sol      # Test USDT token
│   │   └── MockKAIA.sol      # Test KAIA token
│   ├── scripts/              # Deployment scripts
│   ├── test/                 # Contract tests
│   └── hardhat.config.js     # Hardhat configuration
├── frontend/                 # Vue.js application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── views/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── stores/          # Pinia stores
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── vite.config.js       # Vite configuration
├── docs/                    # Documentation
└── README.md               # Project overview
```

## 🔧 Smart Contract Development

### Contracts Overview

1. **USDTStaking.sol**
   - USDT staking with multiple validator nodes
   - 4%-6% annualized returns
   - Minimum 10 USDT stake
   - Reward claiming and withdrawal

2. **USDTLending.sol**
   - Collateralized KAIA lending
   - 70% LTV ratio
   - Flexible loan terms (7/14/30 days)
   - Interest rates: 0.022%-0.027% daily

3. **MockUSDT.sol** & **MockKAIA.sol**
   - Test tokens for development
   - Faucet functions for easy testing

### Testing

```bash
cd contracts

# Run all tests
npm run test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/USDTStaking.test.js

# Run on specific network
npx hardhat test --network kaia-testnet
```

### Deployment

```bash
cd contracts

# Deploy to Kaia testnet
npm run deploy:kaia-testnet

# Verify contracts (if supported)
npm run verify:kaia-testnet
```

## 🎨 Frontend Development

### Technology Stack

- **Framework**: Vue 3 with Composition API
- **UI Library**: Vant 4.0 (Mobile-optimized)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Blockchain**: ethers.js v6
- **LINE Integration**: LIFF SDK v2.0+

### Key Components

1. **LiffInitializer.vue**
   - LINE MiniDapp initialization
   - User authentication handling
   - Mock mode for development

2. **WalletConnector.vue**
   - Blockchain wallet integration
   - Balance monitoring
   - Transaction execution

3. **Dashboard.vue**
   - Asset overview
   - Quick actions
   - Transaction history

### Development Server

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile Testing

The application is optimized for mobile devices. Test on:

- **LINE App**: iOS/Android
- **Browser**: Chrome DevTools mobile simulation
- **Dimensions**: 375px, 414px width (standard mobile)

## 🌐 LINE MiniDapp Integration

### LIFF Setup

1. Create LIFF app in LINE Developers Console
2. Configure LIFF settings:
   - Size: Full
   - Endpoint URL: Your app URL
   - Scope: profile, openid
   - Bot link feature: Off

3. Update environment variables:
```bash
VITE_LIFF_ID=your_liff_id_here
```

### Testing LIFF

For development without LINE app:
```bash
# Enable mock mode
VITE_ENABLE_MOCK_MODE=true
```

## 🔗 Kaia Blockchain Integration

### Network Configuration

**Kaia Testnet (Kairos)**
- Chain ID: 1001
- RPC URL: https://public-node-testnet.kaia.io
- Explorer: https://baobab.scope.klaytn.com

**Kaia Mainnet (Cypress)**
- Chain ID: 8217
- RPC URL: https://public-node-mainnet.kaia.io
- Explorer: https://scope.klaytn.com

### Getting Test Tokens

1. **KAIA Faucet**: https://baobab.wallet.klaytn.foundation/faucet
2. **Mock USDT**: Use contract faucet function
3. **Mock KAIA**: Use contract faucet function

```javascript
// Get test tokens from deployed contracts
await mockUSDT.faucet(); // 1000 USDT
await mockKAIA.faucet();  // 100 KAIA
```

## 🚀 Deployment Guide

### Frontend Deployment

1. **Build for production**
```bash
cd frontend
npm run build
```

2. **Deploy to hosting service**
   - Vercel (recommended)
   - Netlify
   - Firebase Hosting
   - AWS S3 + CloudFront

3. **Environment variables**
   Set production environment variables in hosting service

### Smart Contract Deployment

1. **Set up environment**
```bash
cd contracts
cp .env.example .env
# Add your private key and configuration
```

2. **Deploy contracts**
```bash
npm run deploy:kaia-testnet
```

3. **Update frontend environment**
```bash
# Copy contract addresses to frontend/.env.local
VITE_USDT_TOKEN_ADDRESS=deployed_usdt_address
VITE_STAKING_CONTRACT_ADDRESS=deployed_staking_address
VITE_LENDING_CONTRACT_ADDRESS=deployed_lending_address
```

### LINE MiniDapp Deployment

1. Update LIFF endpoint URL to production URL
2. Test in LINE app
3. Submit for review (if required)

## 🧪 Testing Strategy

### Unit Tests

- **Contracts**: 80%+ coverage required
- **Frontend**: Component and utility testing
- **Integration**: End-to-end user flows

### Test Environments

1. **Local Development**
   - Hardhat network
   - Mock LIFF mode
   - Local frontend server

2. **Testnet**
   - Kaia testnet
   - Real LIFF integration
   - Staging deployment

3. **Production**
   - Kaia mainnet
   - Live LIFF app
   - Production deployment

## 🔒 Security Considerations

### Smart Contract Security

- ✅ OpenZeppelin libraries used
- ✅ ReentrancyGuard implemented
- ✅ Access control with Ownable
- ✅ Input validation and overflow protection
- ✅ Emergency pause functionality

### Frontend Security

- ✅ Environment variable protection
- ✅ Input sanitization
- ✅ Secure RPC endpoints
- ✅ Transaction verification

### Best Practices

1. Never expose private keys
2. Use HTTPS in production
3. Validate all user inputs
4. Implement proper error handling
5. Regular security audits

## 📊 Performance Optimization

### Frontend Performance

- Code splitting with Vite
- Lazy loading for routes
- Image optimization
- Bundle size monitoring

### Blockchain Performance

- Gas optimization
- Batch operations where possible
- Efficient data structures
- Minimal on-chain storage

## 🐛 Troubleshooting

### Common Issues

1. **LIFF initialization fails**
   - Check LIFF ID configuration
   - Verify domain settings in LINE console
   - Use mock mode for development

2. **Wallet connection issues**
   - Ensure correct network (Kaia testnet)
   - Check RPC endpoint availability
   - Verify contract addresses

3. **Transaction failures**
   - Check gas limits
   - Verify contract interactions
   - Ensure sufficient balance

4. **Build errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Debug Tools

```bash
# Frontend debugging
npm run dev -- --debug

# Contract debugging
npx hardhat console --network kaia-testnet

# Test specific scenarios
npm run test -- --grep "specific test"
```

## 📞 Support

- **Documentation**: Check this guide and README
- **Issues**: Create GitHub issues
- **Community**: Join our Discord/Telegram
- **Email**: team@usdtide.xyz

---

## ✅ Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] LIFF app created and configured
- [ ] Contract addresses updated in frontend

### Deployment

- [ ] Smart contracts deployed to testnet
- [ ] Frontend deployed to staging
- [ ] LIFF endpoint updated
- [ ] End-to-end testing completed
- [ ] Performance testing passed

### Post-deployment

- [ ] Monitor contract interactions
- [ ] Track frontend performance
- [ ] User feedback collection
- [ ] Bug reports monitoring
- [ ] Analytics setup

---

*Built with ❤️ for the Kaia ecosystem*