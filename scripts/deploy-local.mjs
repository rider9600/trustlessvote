#!/usr/bin/env node

/**
 * Deploy TrustlessVote contract to local Hardhat network
 * and save the contract address
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat Account #0

async function main() {
  console.log('🚀 Deploying TrustlessVote contract...');
  console.log('📡 RPC URL:', RPC_URL);
  console.log('');

  // Connect to Hardhat node
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  console.log('👤 Deployer address:', deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
  console.log('');

  // Load compiled contract
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'TrustlessVote.sol', 'TrustlessVote.json');
  
  if (!fs.existsSync(artifactPath)) {
    console.error('❌ Contract artifact not found!');
    console.error('   Run: npx hardhat compile');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const { abi, bytecode } = artifact;

  // Deploy contract
  console.log('📝 Deploying contract...');
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log('');
  console.log('✅ Contract deployed successfully!');
  console.log('📍 Contract address:', contractAddress);
  console.log('');

  // Save to .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add contract address
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
  } else {
    envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('💾 Contract address saved to .env.local');
  console.log('');
  console.log('🎉 Deployment complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Restart your dev server: npm run dev');
  console.log('  2. The frontend will now use the deployed contract');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
