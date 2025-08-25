# 🚀 USDTide Contract Live Testing Guide - KAIA Testnet

## 📋 Overview
This guide provides comprehensive instructions for testing USDTide smart contracts on KAIA testnet using mock deployment addresses. All contracts are configured for live testing with mock data.

## 🎯 Test Environment
- **Network**: KAIA Testnet (Chain ID: 1001)
- **RPC URL**: https://public-node-testnet.kaia.io
- **Frontend**: https://usdtidelive-ptxryc00l-lawrencezcls-projects.vercel.app
- **LINE MiniDapp**: https://liff.line.me/2006548696-QqlL5jKG

## 🔗 Mock Contract Addresses
```
MockUSDT: 0x742d35Cc6634C0532925a3b844Bc9e7595f6E123
MockKAIA: 0x8ba1f109551bD432803012645Hac136c82C3e8C9
USDTStaking: 0x4E3bC1F3E4F1c3e8A1B2C3D4E5F6A7B8C9D0E1F2
USDTLending: 0x7A2bC3D4e5F6a7B8C9D0E1F2A3B4C5D6E7F8A9B0
```

## 🧪 Live Testing Scenarios

### 1. Wallet Connection Tests
**Test 1.1: LINE Dapp Portal Wallet**
- Open LINE MiniDapp: https://liff.line.me/2006548696-QqlL5jKG
- Verify automatic wallet connection
- Check wallet address display
- Test network detection (KAIA Testnet)

**Test 1.2: Browser Wallet**
- Open web app: https://usdtidelive-ptxryc00l-lawrencezcls-projects.vercel.app
- Connect MetaMask or other browser wallet
- Switch to KAIA Testnet network
- Verify balance display

### 2. Token Balance Tests
**Test 2.1: USDT Balance Display**
- Navigate to Dashboard
- Check USDT balance shows 0 (mock)
- Verify USDT token address matches mock address

**Test 2.2: KAIA Balance Display**
- Check KAIA balance shows 0 (mock)
- Verify KAIA token address matches mock address

### 3. Staking Feature Tests
**Test 3.1: Staking Node Display**
- Navigate to Staking page
- Verify 3 staking nodes are displayed:
  - Kaia Foundation Node (6% APY)
  - DeFi Alliance Node (5.5% APY)
  - Community Node (4.5% APY)

**Test 3.2: Staking Simulation**
- Enter staking amount (e.g., 100 USDT)
- Select a staking node
- Click "Stake USDT" (will show mock transaction)
- Verify UI updates appropriately

### 4. Lending Feature Tests
**Test 4.1: Lending Pool Display**
- Navigate to Lending page
- Check lending pool information
- Verify KAIA reserve display

**Test 4.2: Borrowing Simulation**
- Enter borrow amount (e.g., 50 USDT)
- Check collateral requirements
- Click "Borrow USDT" (will show mock transaction)
- Verify UI updates

### 5. Referral System Tests
**Test 5.1: Referral Link Generation**
- Navigate to Invite page
- Generate referral link
- Verify link format and parameters

**Test 5.2: Referral Tracking**
- Share referral link
- Check referral tracking display
- Verify reward calculations

### 6. Cross-Platform Tests
**Test 6.1: LINE MiniDapp vs Web App**
- Compare UI consistency
- Test responsive design
- Verify feature parity

**Test 6.2: Mobile Testing**
- Test on mobile devices
- Check touch interactions
- Verify LINE-specific features

## 🚰 Testnet Faucet Instructions

### Get KAIA Test Tokens
1. Visit: https://baobab.wallet.klaytn.foundation/faucet
2. Connect your wallet
3. Request test KAIA tokens
4. Wait for confirmation (1-2 minutes)

### Get USDT Test Tokens (Mock)
Since we're using mock contracts, you can:
1. Use the mock USDT contract's `faucet()` function
2. Or simulate transactions with zero balances for UI testing

## 🔍 Verification Checklist

### ✅ Wallet & Network
- [ ] Wallet connects successfully
- [ ] Network shows KAIA Testnet
- [ ] Address displays correctly
- [ ] Balances load without errors

### ✅ Smart Contract Integration
- [ ] Contract addresses display correctly
- [ ] ABI loading successful
- [ ] Function calls don't throw errors
- [ ] Events are properly handled

### ✅ User Interface
- [ ] All pages load correctly
- [ ] Forms validate properly
- [ ] Loading states display correctly
- [ ] Error handling works

### ✅ LINE Integration
- [ ] LIFF SDK initializes
- [ ] LINE-specific features work
- [ ] QR code scanning functions
- [ ] Sharing features work

## 🐛 Common Issues & Solutions

### Issue: "Wallet Not Connected"
**Solution**: 
- Refresh the page
- Check if LINE Dapp Portal is enabled
- Verify network settings

### Issue: "Contract Not Found"
**Solution**:
- Check mock addresses are correct
- Verify RPC connection
- Ensure network is KAIA Testnet

### Issue: "Transaction Failed"
**Solution**:
- Expected for mock deployment
- Focus on UI/UX testing
- Check console for detailed errors

## 📊 Testing Results Template

```markdown
# Test Results - [Date]

## Environment
- Device: [Mobile/Desktop]
- Browser: [Chrome/Safari/etc]
- Network: KAIA Testnet
- Wallet: [LINE/Metamask/etc]

## Tests Completed
1. ✅ Wallet Connection
2. ✅ Token Balance Display
3. ✅ Staking Interface
4. ✅ Lending Interface
5. ✅ Referral System
6. ✅ LINE Integration

## Issues Found
- [List any bugs or issues]

## Performance Notes
- [Loading times, responsiveness]
```

## 🚀 Quick Start Commands

### Web App Testing
```bash
# Open web app
open https://usdtidelive-ptxryc00l-lawrencezcls-projects.vercel.app

# Test with mobile browser
# Navigate to same URL on mobile
```

### LINE MiniDapp Testing
```bash
# Open LINE app
# Scan QR code or use direct link
# Test: https://liff.line.me/2006548696-QqlL5jKG
```

## 📞 Support
For testing issues or questions:
- Check browser console for errors
- Verify network connectivity
- Test with different wallets
- Document any bugs found

---

**Ready to start live testing! 🎉**
All mock contracts are configured and the frontend is deployed with the latest changes.