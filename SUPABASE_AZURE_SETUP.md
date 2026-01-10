# 🚀 Supabase + Azure Hardhat Deployment Guide

## 📋 What This Setup Does

- **6 Profiles** in your Supabase database
- **20 Hardhat wallets** randomly assign 6 of them to your profiles
- **Azure Hardhat node** at `98.70.98.222:8545` for blockchain
- **Works on Vercel** - no localhost dependencies!

---

## 🔧 Step 1: Apply Supabase Migration

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/add_wallet_support.sql`
5. Paste and click **Run**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

---

## 🎲 Step 2: Randomly Assign Wallets to Profiles

This will pick 6 random wallets from the pool and assign them to your 6 profiles:

```bash
npm install dotenv  # Install if not already

node scripts/assign-wallets-supabase.mjs
```

**Expected output:**

```
📋 Found 6 profile(s) without wallet addresses
💰 Found 20 available wallet(s)
🎲 Randomly assigning 6 wallet(s)...

✓ Alice (voter)
  Email:  alice@example.com
  Wallet: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
...
✅ Successfully assigned 6 wallet(s)!
```

---

## 📜 Step 3: Deploy Contract to Azure Node

First, make sure your Azure Hardhat node is running:

```bash
# SSH into Azure VM
ssh -i YOUR_KEY.pem azureuser@98.70.98.222

# Check if Hardhat is running
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' \
  http://localhost:8545
```

Then deploy from your local machine:

```bash
# Compile contract first
npx hardhat compile

# Deploy to Azure node
node scripts/deploy-azure.mjs
```

**Expected output:**

```
🚀 Deploying TrustlessVote contract to Azure...
📡 RPC URL: http://98.70.98.222:8545
👤 Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Deployer balance: 10000.0 ETH

✅ Contract deployed successfully!
📍 Contract address: 0xYourContractAddressHere
```

---

## 🔍 Step 4: Verify Setup

```bash
node scripts/view-supabase-wallets.mjs
```

This shows all profile-wallet mappings and contract info.

---

## 🌐 Step 5: Deploy to Vercel

### Update Vercel Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables

Add these:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_RPC_URL=http://98.70.98.222:8545
VITE_CHAIN_ID=31337
```

### Deploy

```bash
# Push to Git (triggers auto-deploy)
git add .
git commit -m "Add wallet support for production"
git push

# Or manual deploy
vercel --prod
```

---

## ✅ How Voting Works on Vercel

### When a user votes:

1. **Frontend** sends vote request to backend
2. **Backend** looks up user's assigned wallet address
3. **Backend** retrieves private key from `hardhat_wallet_pool`
4. **Backend** signs transaction using ethers.js
5. **Transaction** sent to Azure Hardhat node (`98.70.98.222:8545`)
6. **Vote** recorded on blockchain

### No MetaMask needed!

- Users don't need to install MetaMask
- Backend handles all signing automatically
- Each user has their own wallet address for blockchain identity

---

## 🛡️ Security Notes

⚠️ **IMPORTANT:**

- Private keys stored in database (encrypted recommended for production)
- Use environment variables for sensitive data
- Hardhat accounts are TEST ONLY - don't use on mainnet
- For real production, consider:
  - Key Management Service (KMS)
  - Hardware Security Module (HSM)
  - Separate signing service

---

## 📊 Current System

✅ 6 profiles → 6 random Hardhat wallets  
✅ 14 wallets remaining in pool for future users  
✅ Contract deployed to Azure node  
✅ Works with Vercel serverless functions  
✅ No localhost dependencies

---

## 🔧 Troubleshooting

### Cannot connect to Azure node

```bash
# Check if node is running
ssh azureuser@98.70.98.222 "docker ps | grep hardhat"

# Restart if needed
ssh azureuser@98.70.98.222 "docker restart hardhat-node"
```

### Wallet assignment failed

```bash
# Check Supabase tables exist
node scripts/view-supabase-wallets.mjs

# Re-run migration if needed
```

### Contract not found

```bash
# Recompile
npx hardhat compile

# Redeploy
node scripts/deploy-azure.mjs
```

---

## 📝 Quick Reference

```bash
# View all mappings
node scripts/view-supabase-wallets.mjs

# Assign more wallets (if you add more profiles)
node scripts/assign-wallets-supabase.mjs

# Redeploy contract
node scripts/deploy-azure.mjs

# Test local dev
npm run dev
```
