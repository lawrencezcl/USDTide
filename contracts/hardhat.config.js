require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    "kaia-testnet": {
      url: "https://public-node-testnet.kaia.io",
      chainId: 1001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 gwei
    },
    "kaia-mainnet": {
      url: "https://public-node-mainnet.kaia.io",
      chainId: 8217,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 gwei
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      "kaia-testnet": "dummy", // Kaia uses different verification
      "kaia-mainnet": "dummy",
    },
    customChains: [
      {
        network: "kaia-testnet",
        chainId: 1001,
        urls: {
          apiURL: "https://api-baobab.scope.klaytn.com/api",
          browserURL: "https://baobab.scope.klaytn.com/",
        },
      },
      {
        network: "kaia-mainnet",
        chainId: 8217,
        urls: {
          apiURL: "https://api.scope.klaytn.com/api",
          browserURL: "https://scope.klaytn.com/",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};