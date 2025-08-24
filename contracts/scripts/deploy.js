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
  await mockUSDT.waitForDeployment();
  console.log("MockUSDT deployed to:", await mockUSDT.getAddress());

  const MockKAIA = await ethers.getContractFactory("MockKAIA");
  const mockKAIA = await MockKAIA.deploy();
  await mockKAIA.waitForDeployment();
  console.log("MockKAIA deployed to:", await mockKAIA.getAddress());

  // Deploy USDTStaking contract
  console.log("\n=== Deploying USDTStaking ===");
  const USDTStaking = await ethers.getContractFactory("USDTStaking");
  const usdtStaking = await USDTStaking.deploy(await mockUSDT.getAddress());
  await usdtStaking.waitForDeployment();
  console.log("USDTStaking deployed to:", await usdtStaking.getAddress());

  // Deploy USDTLending contract
  console.log("\n=== Deploying USDTLending ===");
  const USDTLending = await ethers.getContractFactory("USDTLending");
  const usdtLending = await USDTLending.deploy(
    await mockUSDT.getAddress(),
    await mockKAIA.getAddress(),
    await usdtStaking.getAddress()
  );
  await usdtLending.waitForDeployment();
  console.log("USDTLending deployed to:", await usdtLending.getAddress());

  // Setup initial configuration
  console.log("\n=== Setting up initial configuration ===");
  
  // Add rewards to staking contract (100,000 USDT)
  const rewardAmount = ethers.parseUnits("100000", 6); // 6 decimals for USDT
  await mockUSDT.approve(await usdtStaking.getAddress(), rewardAmount);
  await usdtStaking.addRewards(rewardAmount);
  console.log("Added 100,000 USDT to staking rewards");

  // Add KAIA reserve to lending contract (50,000 KAIA)
  const reserveAmount = ethers.parseEther("50000");
  await mockKAIA.approve(await usdtLending.getAddress(), reserveAmount);
  await usdtLending.addReserve(reserveAmount);
  console.log("Added 50,000 KAIA to lending reserve");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      MockUSDT: await mockUSDT.getAddress(),
      MockKAIA: await mockKAIA.getAddress(),
      USDTStaking: await usdtStaking.getAddress(),
      USDTLending: await usdtLending.getAddress(),
    },
    blockNumbers: {
      MockUSDT: (await mockUSDT.deploymentTransaction()).blockNumber,
      MockKAIA: (await mockKAIA.deploymentTransaction()).blockNumber,
      USDTStaking: (await usdtStaking.deploymentTransaction()).blockNumber,
      USDTLending: (await usdtLending.deploymentTransaction()).blockNumber,
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
  console.log("MockUSDT:", await mockUSDT.getAddress());
  console.log("MockKAIA:", await mockKAIA.getAddress());
  console.log("USDTStaking:", await usdtStaking.getAddress());
  console.log("USDTLending:", await usdtLending.getAddress());
  console.log("\nDeployment info saved to:", deploymentFile);

  // Generate .env file for frontend
  const envContent = `# USDTide Contract Addresses - ${hre.network.name}
VITE_USDT_TOKEN_ADDRESS=${await mockUSDT.getAddress()}
VITE_KAIA_TOKEN_ADDRESS=${await mockKAIA.getAddress()}
VITE_STAKING_CONTRACT_ADDRESS=${await usdtStaking.getAddress()}
VITE_LENDING_CONTRACT_ADDRESS=${await usdtLending.getAddress()}
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