const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("📊 Kaia Testnet Balance Check");
  console.log("=".repeat(40));
  console.log("Address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInKAIA = ethers.formatEther(balance);
  
  console.log("Balance:", balance.toString(), "wei");
  console.log("Balance:", balanceInKAIA, "KAIA");
  
  if (balance === 0n) {
    console.log("\n⚠️  Your account has 0 balance!");
    console.log("\n🚰 To get test KAIA tokens:");
    console.log("1. Visit: https://baobab.wallet.klaytn.foundation/faucet");
    console.log("2. Enter your address:", deployer.address);
    console.log("3. Request test tokens");
    console.log("4. Wait 1-2 minutes for confirmation");
    console.log("5. Run this script again to verify");
  } else if (balance < ethers.parseEther("0.1")) {
    console.log("\n⚠️  Low balance detected!");
    console.log("You may need more KAIA for contract deployment.");
    console.log("Get additional tokens from: https://baobab.wallet.klaytn.foundation/faucet");
  } else {
    console.log("\n✅ Sufficient balance for deployment!");
    console.log("You can now run the deployment script.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});