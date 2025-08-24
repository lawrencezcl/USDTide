const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting USDTide contract deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy mock tokens first
  console.log("\n=== Deploying Mock Tokens ===");
  
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.deployed();
  console.log("MockUSDT deployed to:", mockUSDT.address);

  const MockKAIA = await ethers.getContractFactory("MockKAIA");
  const mockKAIA = await MockKAIA.deploy();
  await mockKAIA.deployed();
  console.log("MockKAIA deployed to:", mockKAIA.address);

  // Deploy USDTStaking contract
  console.log("\n=== Deploying USDTStaking ===");
  const USDTStaking = await ethers.getContractFactory("USDTStaking");
  const usdtStaking = await USDTStaking.deploy(mockUSDT.address);
  await usdtStaking.deployed();
  console.log("USDTStaking deployed to:", usdtStaking.address);

  // Deploy USDTLending contract
  console.log("\n=== Deploying USDTLending ===");
  const USDTLending = await ethers.getContractFactory("USDTLending");
  const usdtLending = await USDTLending.deploy(
    mockUSDT.address,
    mockKAIA.address,
    usdtStaking.address
  );
  await usdtLending.deployed();
  console.log("USDTLending deployed to:", usdtLending.address);

  // Setup initial configuration
  console.log("\n=== Setting up initial configuration ===");
  
  // Add rewards to staking contract (100,000 USDT)
  const rewardAmount = ethers.utils.parseUnits("100000", 6); // 6 decimals for USDT
  await mockUSDT.approve(usdtStaking.address, rewardAmount);
  await usdtStaking.addRewards(rewardAmount);
  console.log("Added 100,000 USDT to staking rewards");

  // Add KAIA reserve to lending contract (50,000 KAIA)
  const reserveAmount = ethers.utils.parseEther("50000");
  await mockKAIA.approve(usdtLending.address, reserveAmount);
  await usdtLending.addReserve(reserveAmount);
  console.log("Added 50,000 KAIA to lending reserve");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
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
  };

  // Save to JSON file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("MockUSDT:", mockUSDT.address);
  console.log("MockKAIA:", mockKAIA.address);
  console.log("USDTStaking:", usdtStaking.address);
  console.log("USDTLending:", usdtLending.address);
  console.log("\nDeployment info saved to:", deploymentFile);

  // Generate .env file for frontend
  const envContent = `# USDTide Contract Addresses - ${hre.network.name}
VITE_USDT_TOKEN_ADDRESS=${mockUSDT.address}
VITE_KAIA_TOKEN_ADDRESS=${mockKAIA.address}
VITE_STAKING_CONTRACT_ADDRESS=${usdtStaking.address}
VITE_LENDING_CONTRACT_ADDRESS=${usdtLending.address}
VITE_NETWORK_NAME=${hre.network.name}
VITE_CHAIN_ID=${deploymentInfo.chainId}
VITE_RPC_URL=${hre.network.config.url || 'https://public-node-testnet.kaia.io'}
`;

  const frontendEnvFile = path.join(__dirname, "..", "..", "frontend", ".env.local");
  fs.writeFileSync(frontendEnvFile, envContent);
  console.log("Frontend .env.local file generated");

  console.log("\n🎉 Deployment completed successfully!");
  
  // Verification instructions
  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Get test tokens from faucets:");
  console.log(`   - MockUSDT faucet: mockUSDT.faucet()`);
  console.log(`   - MockKAIA faucet: mockKAIA.faucet()`);
  console.log("3. Start the frontend application");
  console.log("4. Test staking and lending functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });