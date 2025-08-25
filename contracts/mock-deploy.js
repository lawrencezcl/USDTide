const fs = require("fs");
const path = require("path");

async function generateMockDeployment() {
  console.log("📝 Generating mock deployment data for KAIA testnet testing...");
  
  // Generate realistic mock addresses
  const mockAddresses = {
    MockUSDT: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
    MockKAIA: "0x8ba1f109551bD432803012645Hac136c82C3e8C9",
    USDTStaking: "0x4E3bC1F3E4F1c3e8A1B2C3D4E5F6A7B8C9D0E1F2",
    USDTLending: "0x7A2bC3D4e5F6a7B8C9D0E1F2A3B4C5D6E7F8A9B0"
  };

  const deploymentInfo = {
    network: "kaia-testnet",
    chainId: 1001,
    deployer: "0xDeployerAddressForTesting",
    contracts: mockAddresses,
    timestamp: new Date().toISOString(),
    nodes: [
      {
        name: "Kaia Foundation Node",
        apy: 600,
        securityRating: 95
      },
      {
        name: "DeFi Alliance Node", 
        apy: 550,
        securityRating: 90
      },
      {
        name: "Community Node",
        apy: 450,
        securityRating: 85
      }
    ]
  };

  // Save deployment information
  const deploymentsDir = path.join(__dirname, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "kaia-testnet-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Generate frontend .env.local file with mock addresses
  const envContent = `# USDTide Contract Addresses - KAIA Testnet (Mock Deployment)
VITE_USDT_TOKEN_ADDRESS=${mockAddresses.MockUSDT}
VITE_KAIA_TOKEN_ADDRESS=${mockAddresses.MockKAIA}
VITE_STAKING_CONTRACT_ADDRESS=${mockAddresses.USDTStaking}
VITE_LENDING_CONTRACT_ADDRESS=${mockAddresses.USDTLending}
VITE_NETWORK_NAME=kaia-testnet
VITE_CHAIN_ID=1001
VITE_RPC_URL=https://public-node-testnet.kaia.io
`;

  const frontendEnvFile = path.join(__dirname, "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvFile, envContent);

  console.log("✅ Mock deployment completed successfully!");
  console.log("\n📋 Mock Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("\n📍 Mock Contract Addresses:");
  console.log("MockUSDT:", mockAddresses.MockUSDT);
  console.log("MockKAIA:", mockAddresses.MockKAIA);
  console.log("USDTStaking:", mockAddresses.USDTStaking);
  console.log("USDTLending:", mockAddresses.USDTLending);
  console.log("\n📁 Files created:");
  console.log("-", deploymentFile);
  console.log("-", frontendEnvFile);
  console.log("\n🔧 Ready for live testing with mock contracts!");
  console.log("\n⚠️  Note: These are mock addresses for testing.");
  console.log("   To deploy real contracts, set your PRIVATE_KEY in .env file");
}

// Run the mock deployment
generateMockDeployment().catch(console.error);