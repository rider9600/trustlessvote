#!/usr/bin/env node

/**
 * Deploy TrustlessVote contract to Azure Hardhat node
 * For production/Vercel deployment
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AZURE_RPC_URL = process.env.AZURE_RPC_URL || 'http://98.70.98.222:8545';
const DEPLOYER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat Account #0

async function main() {
  console.log('🚀 Deploying TrustlessVote contract to Azure...');
  console.log('📡 RPC URL:', AZURE_RPC_URL);
  console.log('');

  // Connect to Azure Hardhat node
  const provider = new ethers.JsonRpcProvider(AZURE_RPC_URL);
  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);

  console.log('👤 Deployer address:', deployer.address);
  
  try {
    const balance = await provider.getBalance(deployer.address);
    console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
  } catch (error) {
    console.error('❌ Cannot connect to Azure node:', error.message);
    console.error('   Make sure the Hardhat node is running on Azure VM');
    process.exit(1);
  }
  
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
    
    // Update contract address
    if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Update RPC URL to Azure
    if (envContent.includes('VITE_RPC_URL=')) {
      envContent = envContent.replace(
        /VITE_RPC_URL=.*/,
        `VITE_RPC_URL=${AZURE_RPC_URL}`
      );
    } else {
      envContent += `VITE_RPC_URL=${AZURE_RPC_URL}\n`;
    }
  } else {
    envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}\nVITE_RPC_URL=${AZURE_RPC_URL}\nVITE_CHAIN_ID=31337\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('💾 Configuration saved to .env.local');
  console.log('');
  console.log('🎉 Deployment complete!');
  console.log('');
  console.log('⚠️  IMPORTANT: Update Vercel environment variables:');
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   VITE_RPC_URL=${AZURE_RPC_URL}`);
  console.log('   VITE_CHAIN_ID=31337');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
