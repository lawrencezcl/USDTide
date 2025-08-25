const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting USDTide deployment to Kaia testnet...");
  
  // Check if private key is provided
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "your_private_key_here_without_0x_prefix") {
    console.log("⚠️  Please set your PRIVATE_KEY in the .env file before deploying");
    console.log("   Example: PRIVATE_KEY=your_actual_private_key_here");
    
    // Generate mock deployment data for testing
    await generateMockDeployment();
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Mock USDT
  console.log("\n📦 Deploying MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.deployed();
  console.log("MockUSDT deployed to:", mockUSDT.address);

  // Deploy Mock KAIA
  console.log("\n📦 Deploying MockKAIA...");
  const MockKAIA = await ethers.getContractFactory("MockKAIA");
  const mockKAIA = await MockKAIA.deploy();
  await mockKAIA.deployed();
  console.log("MockKAIA deployed to:", mockKAIA.address);

  // Deploy USDT Staking
  console.log("\n📦 Deploying USDTStaking...");
  const USDTStaking = await ethers.getContractFactory("USDTStaking");
  const usdtStaking = await USDTStaking.deploy(mockUSDT.address);
  await usdtStaking.deployed();
  console.log("USDTStaking deployed to:", usdtStaking.address);

  // Deploy USDT Lending
  console.log("\n📦 Deploying USDTLending...");
  const USDTLending = await ethers.getContractFactory("USDTLending");
  const usdtLending = await USDTLending.deploy(
    mockUSDT.address,
    mockKAIA.address,
    usdtStaking.address
  );
  await usdtLending.deployed();
  console.log("USDTLending deployed to:", usdtLending.address);

  // Setup initial configuration
  console.log("\n⚙️  Setting up initial configuration...");

  // Add rewards to staking contract (100,000 USDT)
  const rewardAmount = ethers.utils.parseUnits("100000", 6); // 6 decimals for USDT
  await mockUSDT.approve(usdtStaking.address, rewardAmount);
  await usdtStaking.addRewards(rewardAmount);
  console.log("✅ Added 100,000 USDT to staking rewards");

  // Add KAIA reserve to lending contract (50,000 KAIA)
  const reserveAmount = ethers.utils.parseEther("50000");
  await mockKAIA.approve(usdtLending.address, reserveAmount);
  await usdtLending.addReserve(reserveAmount);
  console.log("✅ Added 50,000 KAIA to lending reserve");

  // Add initial staking nodes
  console.log("\n🎯 Adding initial staking nodes...");
  const nodes = [
    {
      name: "Kaia Foundation Node",
      apy: 600, // 6% APY
      securityRating: 95,
      isActive: true
    },
    {
      name: "DeFi Alliance Node",
      apy: 550, // 5.5% APY
      securityRating: 90,
      isActive: true
    },
    {
      name: "Community Node",
      apy: 450, // 4.5% APY
      securityRating: 85,
      isActive: true
    }
  ];

  for (const node of nodes) {
    await usdtStaking.addNode(
      node.name,
      node.apy,
      node.securityRating,
      node.isActive
    );
    console.log(`✅ Added node: ${node.name}`);
  }

  // Save deployment information
  const deploymentInfo = {
    network: "kaia-testnet",
    chainId: 1001,
    deployer: deployer.address,
    contracts: {
      MockUSDT: mockUSDT.address,
      MockKAIA: mockKAIA.address,
      USDTStaking: usdtStaking.address,
      USDTLending: usdtLending.address,
    },
    blockNumbers: {
      MockUSDT: mockUSDT.deployTransaction.blockNumber,
      MockKAIA: mockKAIA.deployTransaction.blockNumber,
      USDTStaking: usdtStaking.deployTransaction.blockNumber,
      USDTLending: usdtLending.deployTransaction.blockNumber,
    },
    timestamp: new Date().toISOString(),
    nodes: nodes.map(node => ({
      name: node.name,
      apy: node.apy,
      securityRating: node.securityRating
    }))
  };

  // Save deployment addresses
  const deploymentsDir = path.join(__dirname, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "kaia-testnet-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Generate frontend .env file
  const envContent = `# USDTide Contract Addresses - Kaia Testnet
VITE_USDT_TOKEN_ADDRESS=${mockUSDT.address}
VITE_KAIA_TOKEN_ADDRESS=${mockKAIA.address}
VITE_STAKING_CONTRACT_ADDRESS=${usdtStaking.address}
VITE_LENDING_CONTRACT_ADDRESS=${usdtLending.address}
VITE_NETWORK_NAME=kaia-testnet
VITE_CHAIN_ID=1001
VITE_RPC_URL=https://public-node-testnet.kaia.io
`;

  const frontendEnvFile = path.join(__dirname, "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvFile, envContent);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Deployer:", deployer.address);
  console.log("\n📍 Contract Addresses:");
  console.log("MockUSDT:", mockUSDT.address);
  console.log("MockKAIA:", mockKAIA.address);
  console.log("USDTStaking:", usdtStaking.address);
  console.log("USDTLending:", usdtLending.address);
  console.log("\n📁 Files created:");
  console.log("-", deploymentFile);
  console.log("-", frontendEnvFile);

  console.log("\n🔧 Next steps:");
  console.log("1. Get test tokens from faucets:");
  console.log("   - KAIA: https://baobab.wallet.klaytn.foundation/faucet");
  console.log("   - USDT: Use mockUSDT.faucet() function");
  console.log("2. Update frontend configuration");
  console.log("3. Test the complete user flow");
  console.log("4. Verify contracts on Kaia explorer");
}

async function generateMockDeployment() {
  console.log("📝 Generating mock deployment data for testing...");
  
  const mockAddresses = {
    MockUSDT: "0x1234567890123456789012345678901234567890",
    MockKAIA: "0x0987654321098765432109876543210987654321",
    USDTStaking: "0x1111111111111111111111111111111111111111",
    USDTLending: "0x2222222222222222222222222222222222222222"
  };

  const deploymentInfo = {
    network: "kaia-testnet",
    chainId: 1001,
    deployer: "0xDeployerAddressHere",
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

  const deploymentsDir = path.join(__dirname, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "kaia-testnet-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  const envContent = `# USDTide Contract Addresses - Kaia Testnet (Mock)
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

  console.log("✅ Mock deployment files created for testing");
  console.log("📁 Files created:");
  console.log("-", deploymentFile);
  console.log("-", frontendEnvFile);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };