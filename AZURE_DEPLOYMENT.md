# Azure VM Hardhat Deployment Guide

## Overview

Your blockchain infrastructure is running on an Azure VM at **http://98.70.98.222:8545**

## Frontend Deployment on Vercel

### 1. Environment Variables Setup

Add these environment variables in your Vercel project settings:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://iliaxwhklkjaiaatxcja.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaWF4d2hrbGtqYWlhYXR4Y2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODU0NDgsImV4cCI6MjA4MzQ2MTQ0OH0.LsT-QSZeN-DJmE9-pPTPGg_XC4sEJ6xRkHu3vY0bQPs

# Blockchain Configuration - Azure VM Hardhat Node
VITE_RPC_URL=http://98.70.98.222:8545
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE
VITE_CHAIN_ID=31337
```

### 2. Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd trustlessvote
vercel
```

**Option B: Using GitHub Integration**

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables
6. Deploy

## Smart Contract Deployment on Azure VM

### Prerequisites

- SSH access to Azure VM (98.70.98.222)
- Hardhat node running on port 8545

### Deploy Contract

SSH into your Azure VM and run:

```bash
# Navigate to project directory
cd /path/to/trustlessvote

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract address from output
```

### Update Environment Variables

After deployment, update `VITE_CONTRACT_ADDRESS` in:

1. Local `.env.local` file
2. Vercel environment variables

## Network Configuration

The application is configured to use:

- **Network**: Hardhat Network
- **Chain ID**: 31337 (0x7a69)
- **RPC URL**: http://98.70.98.222:8545
- **Block Explorer**: None (private network)

## MetaMask Setup for Users

Users need to add the Hardhat network to MetaMask:

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter details:
   - **Network Name**: Hardhat Network
   - **RPC URL**: http://98.70.98.222:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

**Note**: The app will automatically prompt users to add this network when they connect their wallet.

## Important Security Notes

⚠️ **CORS Configuration**: Your Hardhat node on Azure VM must allow CORS from Vercel domains:

On Azure VM, ensure Hardhat is started with:

```bash
npx hardhat node --hostname 0.0.0.0
```

⚠️ **Firewall**: Ensure port 8545 is open on Azure VM:

```bash
# Check if port is accessible
curl http://98.70.98.222:8545
```

⚠️ **HTTPS Warning**: Using HTTP RPC URL from HTTPS Vercel site may cause browser security warnings. Consider:

- Using HTTPS reverse proxy (nginx with SSL)
- Or setting up Cloudflare tunnel

## Testing Deployment

### 1. Test Locally First

```bash
npm run dev
# Visit http://localhost:5173
# Connect MetaMask to Hardhat network (98.70.98.222:8545)
# Test voting flow
```

### 2. Test on Vercel

- Visit your Vercel URL
- Connect MetaMask
- Test complete voting flow

## Troubleshooting

### Issue: "Cannot connect to blockchain"

**Solution**: Check if Hardhat node is running on Azure VM:

```bash
curl http://98.70.98.222:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Issue: "Wrong network"

**Solution**: Verify VITE_CHAIN_ID=31337 in Vercel environment variables

### Issue: "Contract not found"

**Solution**: Ensure VITE_CONTRACT_ADDRESS is set with deployed contract address

### Issue: CORS errors

**Solution**: Configure Hardhat node with proper CORS headers or use reverse proxy

## Production Checklist

- [ ] Hardhat node running on Azure VM (port 8545)
- [ ] Contract deployed and address noted
- [ ] Environment variables set in Vercel
- [ ] vercel.json created
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] MetaMask network added and tested
- [ ] Full voting flow tested on Vercel URL
- [ ] CORS configured correctly
- [ ] Firewall rules allow port 8545

## Demo Preparation

For your hackathon demo tomorrow:

1. **Have ready**:

   - Vercel deployment URL
   - MetaMask with Hardhat network configured
   - Test accounts with voting permissions
   - Sample election created

2. **Demo flow**:

   - Show Vercel-hosted frontend
   - Connect MetaMask (will auto-add network)
   - Login as voter
   - View elections
   - Cast vote (commit)
   - Reveal vote
   - Show results

3. **Backup plan**:
   - Keep localhost version ready
   - Have screenshots of working flow
   - Document in presentation
