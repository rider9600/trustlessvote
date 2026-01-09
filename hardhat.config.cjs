require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

const AZURE_RPC_URL = process.env.AZURE_RPC_URL || "http://98.70.98.222:8545";

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    azure: {
      type: "http",
      url: AZURE_RPC_URL,
      chainId: 31337,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
