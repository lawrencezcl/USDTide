# USDTide Testing Guide - Complete User Flows

## Overview
This guide provides comprehensive testing instructions for USDTide's complete user flows on Kaia testnet. All frontend features are now deployed and ready for testing.

## Test Environment Setup
- **Frontend URL**: http://localhost:3000
- **Network**: Kaia Testnet (Chain ID: 1001)
- **RPC**: https://public-node-testnet.kaia.io

## Pre-Testing Checklist
- [ ] Frontend development server is running
- [ ] Kaia testnet wallet (Kaia Wallet) is installed
- [ ] Test KAIA tokens obtained from faucet
- [ ] Mock contract addresses configured in frontend/.env.local

## Test User Flows

### 1. Wallet Connection & LIFF Integration
**Test Steps:**
1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Select Kaia Wallet or LINE Wallet
4. Verify wallet address displays correctly
5. Test LIFF integration for LINE MiniDapp

**Expected Results:**
- Wallet connects successfully
- Address displays in header
- Network shows Kaia Testnet
- LINE MiniDapp mode works if accessed via LINE

### 2. Staking Flow Test
**Test Steps:**
1. Navigate to Staking page
2. Check available USDT balance
3. Select a staking node (Kaia Foundation, DeFi Alliance, or Community)
4. Enter staking amount (e.g., 100 USDT)
5. Review estimated earnings
6. Confirm staking transaction
7. Check staking confirmation

**Expected Results:**
- Available USDT balance displays correctly
- Estimated earnings calculate properly
- Transaction completes successfully
- Staking appears in dashboard

### 3. Lending Flow Test
**Test Steps:**
1. Navigate to Lending page
2. Check collateral value and health ratio
3. Enter borrowing amount in KAIA
4. Select loan term (7, 14, or 30 days)
5. Review loan summary
6. Confirm borrowing transaction
7. Verify loan appears in active loans

**Expected Results:**
- Borrowing amount calculates correctly
- Interest rates display properly
- Loan term options work
- Transaction completes successfully

### 4. Social Features & Referral System
**Test Steps:**
1. Check dashboard for social features
2. Generate referral link
3. Copy referral link
4. Test LINE sharing functionality
5. Check referral leaderboard
6. View recent referrals
7. Test invite friends modal

**Expected Results:**
- Referral link generates correctly
- Sharing options work (copy, LINE, general)
- Leaderboard displays top referrers
- Referral history updates

### 5. Transaction Monitoring & Notifications
**Test Steps:**
1. Check notification bell icon
2. View transaction history
3. Test transaction details modal
4. Verify notification badges
5. Test notification filtering

**Expected Results:**
- Notifications display correctly
- Transaction history loads
- Modal shows transaction details
- Badges update appropriately

### 6. Complete User Journey
**Test Steps:**
1. New user registration via referral
2. Initial staking of 100 USDT
3. Borrow 50 KAIA against staking
4. Check referral rewards
5. Withdraw staking rewards
6. Repay loan
7. Check final balances

**Expected Results:**
- Full cycle completes without errors
- Balances update correctly
- Referral rewards accumulate
- All transactions appear in history

## Test Data

### Mock Contract Addresses
- **MockUSDT**: 0x8aC3cF8f0E4eD9eB2eD8C7c9e3F8A7B5D2C4E6F1
- **MockKAIA**: 0x7bC4F9eD3A8E9F2C8D7B5A4E3F2C1D0E9F8A7B6
- **USDTStaking**: 0x6aD5F4E3C8B7A9F8E7D6C5B4A3F2E1D0C9B8A7
- **USDTLending**: 0x5cE4F3D2A1B9C8D7E6F5A4B3C2D1E0F9A8B7C6

### Test Accounts
- **Deployer**: 0xA1B2C3D4E5F6789012345678901234567890123
- **Test User**: Use your Kaia testnet wallet address

## Error Handling

### Common Issues & Solutions
1. **"Insufficient KAIA for gas"**
   - Solution: Get test KAIA from https://baobab.wallet.klaytn.foundation/faucet

2. **"Contract not found"**
   - Solution: Verify contract addresses in frontend/.env.local

3. **"Transaction failed"**
   - Solution: Check wallet connection and network settings

4. **"LIFF initialization failed"**
   - Solution: Ensure LIFF_ID is configured correctly

## Performance Testing

### Load Testing
- Test with multiple simultaneous users
- Monitor transaction response times
- Check for memory leaks in long sessions

### Mobile Testing
- Test on mobile devices via LINE MiniDapp
- Verify responsive design
- Test touch interactions

## Security Testing

### Wallet Security
- Verify no private keys are exposed
- Test wallet disconnection
- Check for XSS vulnerabilities

### Contract Security
- Verify contract interactions are safe
- Test emergency functions
- Check access control

## Reporting Issues

### Bug Report Template
```
**Bug Description:**
**Steps to Reproduce:**
**Expected Behavior:**
**Actual Behavior:**
**Environment:**
- Browser:
- Wallet:
- Network:
**Screenshots:**
```

### Success Criteria
- [ ] All test flows complete successfully
- [ ] No critical bugs found
- [ ] Performance meets requirements
- [ ] Security checks pass
- [ ] Mobile experience is smooth

## Next Steps
After successful testing:
1. Update todo list to mark testing complete
2. Prepare for production deployment
3. Conduct security audit
4. Finalize documentation
5. Deploy to mainnet