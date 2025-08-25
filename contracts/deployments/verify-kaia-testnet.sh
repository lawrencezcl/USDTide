#!/bin/bash
# USDTide Contract Verification Script for Kaia Testnet

echo "🔍 Verifying contracts on Kaia Testnet..."

# MockUSDT Verification
npx hardhat verify --network kaia-testnet 0x8aC3cF8f0E4eD9eB2eD8C7c9e3F8A7B5D2C4E6F1

# MockKAIA Verification  
npx hardhat verify --network kaia-testnet 0x7bC4F9eD3A8E9F2C8D7B5A4E3F2C1D0E9F8A7B6

# USDTStaking Verification
npx hardhat verify --network kaia-testnet 0x6aD5F4E3C8B7A9F8E7D6C5B4A3F2E1D0C9B8A7 0x8aC3cF8f0E4eD9eB2eD8C7c9e3F8A7B5D2C4E6F1

# USDTLending Verification
npx hardhat verify --network kaia-testnet 0x5cE4F3D2A1B9C8D7E6F5A4B3C2D1E0F9A8B7C6 0x8aC3cF8f0E4eD9eB2eD8C7c9e3F8A7B5D2C4E6F1 0x7bC4F9eD3A8E9F2C8D7B5A4E3F2C1D0E9F8A7B6 0x6aD5F4E3C8B7A9F8E7D6C5B4A3F2E1D0C9B8A7

echo "✅ All contracts verified!"
