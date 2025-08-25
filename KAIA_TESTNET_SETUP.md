# Kaia Testnet Setup Guide

## Account Information
- **Test Address**: `0x6CB627F127E3E2Dfc529ef521eb3777a4E033131`
- **Private Key**: `0x85a6a49c1a017560d88879280ac7fafa0e63943d2c7a68ca9308dbeaadc0cff0`

## Getting Test KAIA Tokens

### Option 1: Kaia Faucet (Recommended)
1. Visit the official Kaia testnet faucet: https://baobab.wallet.klaytn.foundation/faucet
2. Connect your wallet or paste your address: `0x6CB627F127E3E2Dfc529ef521eb3777a4E033131`
3. Request test KAIA tokens (you'll receive 5 KAIA)
4. Wait for the transaction to confirm (usually 1-2 minutes)

### Option 2: All That Node Faucet
1. Visit: https://www.allthatnode.com/faucet/klaytn.dsrv
2. Enter your address: `0x6CB627F127E3E2Dfc529ef521eb3777a4E033131`
3. Complete the captcha
4. Click "Get KLAY" (you'll receive 2 KLAY)

## Verification Steps

1. **Check Balance**: After getting test tokens, verify your balance:
   ```bash
   cd contracts
   npx hardhat run scripts/check-balance.js --network kaia-testnet
   ```

2. **Expected Balance**: You should have at least 0.1 KAIA for deployment

3. **Deploy Contracts**: Once you have test tokens, run:
   ```bash
   npx hardhat run deploy-kaia-testnet.js --network kaia-testnet
   ```

## Troubleshooting

### If Faucet Doesn't Work
- Try both faucet options above
- Wait 10-15 minutes between requests
- Ensure you're using the Kaia testnet (not mainnet)

### Network Configuration
- **Network**: Kaia Testnet (Baobab)
- **Chain ID**: 1001
- **RPC URL**: https://public-en-kairos.node.kaia.io
- **Explorer**: https://baobab.scope.klaytn.com/

### Common Issues
- **Insufficient funds**: Get more test KAIA from faucets
- **Network unreachable**: Check your internet connection
- **Invalid private key**: Ensure the private key is correct and without 0x prefix

## Next Steps After Funding

1. **Deploy Contracts**: Run the deployment script
2. **Verify Deployment**: Check the generated `kaia-testnet-deployment.json`
3. **Test Frontend**: Update frontend with deployed contract addresses
4. **Test Features**: Use the deployed contracts for staking and lending

## Support

If you encounter issues:
- Check the [Kaia Discord](https://discord.gg/kaia) for community support
- Use the [Kaia Developer Portal](https://docs.kaia.io/) for documentation
- Verify your setup with the deployment guide in `CONTRACT_LIVE_TEST_GUIDE.md`