#!/bin/bash

# USDTide Deployment Script for Kaia Testnet
# This script deploys all contracts to Kaia testnet and sets up the complete system

set -e

echo "🚀 Starting USDTide deployment to Kaia testnet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "hardhat.config.js" ]; then
    print_error "Please run this script from the contracts directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please create one with PRIVATE_KEY"
    print_status "Example .env file:"
    echo "PRIVATE_KEY=your_private_key_here"
    echo "INFURA_API_KEY=your_infura_key_here"
    exit 1
fi

# Load environment variables
source .env

if [ -z "$PRIVATE_KEY" ]; then
    print_error "PRIVATE_KEY not set in .env file"
    exit 1
fi

print_status "Environment loaded successfully"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Compile contracts
print_status "Compiling contracts..."
npx hardhat compile

# Run tests
print_status "Running tests..."
npx hardhat test

# Check if tests passed
if [ $? -ne 0 ]; then
    print_error "Tests failed. Please fix issues before deploying."
    exit 1
fi

print_status "All tests passed! ✅"

# Deploy to Kaia testnet
print_status "Deploying to Kaia testnet..."
npx hardhat run scripts/deploy.js --network kaia-testnet

# Check deployment status
if [ $? -eq 0 ]; then
    print_status "Deployment successful! 🎉"
    
    # Display deployment info
    if [ -f "deployments/kaia-testnet-deployment.json" ]; then
        print_status "Deployment addresses:"
        cat deployments/kaia-testnet-deployment.json | grep -A 10 "contracts"
    fi
    
    print_status "Next steps:"
    echo "1. Update frontend .env with contract addresses"
    echo "2. Get test tokens from faucets"
    echo "3. Test the application"
    
else
    print_error "Deployment failed!"
    exit 1
fi

# Generate verification commands
print_status "Contract verification commands:"
if [ -f "deployments/kaia-testnet-deployment.json" ]; then
    USDT_ADDRESS=$(cat deployments/kaia-testnet-deployment.json | grep MockUSDT | cut -d'"' -f4)
    KAIA_ADDRESS=$(cat deployments/kaia-testnet-deployment.json | grep MockKAIA | cut -d'"' -f4)
    STAKING_ADDRESS=$(cat deployments/kaia-testnet-deployment.json | grep USDTStaking | cut -d'"' -f4)
    LENDING_ADDRESS=$(cat deployments/kaia-testnet-deployment.json | grep USDTLending | cut -d'"' -f4)
    
    echo "npx hardhat verify --network kaia-testnet $USDT_ADDRESS"
    echo "npx hardhat verify --network kaia-testnet $KAIA_ADDRESS"
    echo "npx hardhat verify --network kaia-testnet $STAKING_ADDRESS \"$USDT_ADDRESS\""
    echo "npx hardhat verify --network kaia-testnet $LENDING_ADDRESS \"$USDT_ADDRESS\" \"$KAIA_ADDRESS\" \"$STAKING_ADDRESS\""
fi

print_status "Deployment completed successfully! 🚀"