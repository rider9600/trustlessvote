# 🚀 TrustlessVote - Deployment & Demo Guide

## ✅ What We've Built

A **hybrid Web2 + Web3 voting system** that combines:

- **Supabase** (Off-chain): User management, election metadata, candidate information
- **Ethereum Blockchain** (On-chain): Vote commitments, vote counts, immutable records
- **MetaMask** integration for secure blockchain transactions

---

## 📋 Pre-Deployment Checklist

### 1. Get Sepolia Testnet ETH (FREE)

You need testnet ETH to deploy and test. Get it from:

#### Option A: Alchemy Faucet (Recommended)

1. Visit: https://sepoliafaucet.com/
2. Create free Alchemy account
3. Enter your MetaMask address
4. Receive **0.5 Sepolia ETH** instantly

#### Option B: QuickNode Faucet

1. Visit: https://faucet.quicknode.com/ethereum/sepolia
2. Connect Twitter account
3. Receive **0.05 Sepolia ETH**

### 2. Install Hardhat (For Contract Deployment)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

---

## 🔧 Deployment Steps

### Step 1: Deploy Smart Contract to Sepolia

#### A. Create Hardhat Config

Create `hardhat.config.js` in project root:

```javascript
require("@nomicfoundation/hardhat-toolbox");

// Get from MetaMask: Settings > Security & Privacy > Show private key
const SEPOLIA_PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE";

// Get from: https://www.alchemy.com/ (free account)
const ALCHEMY_API_KEY = "YOUR_ALCHEMY_API_KEY";

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY", // Optional, for verification
  },
};
```

#### B. Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying TrustlessVote contract to Sepolia...");

  const TrustlessVote = await hre.ethers.getContractFactory("TrustlessVote");
  const contract = await TrustlessVote.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ TrustlessVote deployed to:", address);
  console.log("📋 Save this address in your .env.local file!");
  console.log(
    "🔍 View on Etherscan:",
    `https://sepolia.etherscan.io/address/${address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### C. Deploy

```bash
# Compile contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

#### D. Update Environment Variables

Copy the deployed contract address and update `.env.local`:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

---

### Step 2: Start Frontend

```bash
npm run dev
```

Open http://localhost:5173

---

## 🎪 Demo Flow for Judges (Tomorrow's Presentation)

### Pre-Demo Setup (Do this today!)

1. **Deploy contract** (Step 1 above)
2. **Create test accounts**:
   - Admin account (your account)
   - 2-3 voter accounts (can be same MetaMask with different profile IDs)
3. **Create a test election**:
   - Login as admin
   - Create election with commit/reveal phases
   - Add 2-3 candidates
   - Add voters (can use admin's wallet address for testing)

### During Presentation

#### Phase 1: Introduction (2 min)

"TrustlessVote solves campus election transparency problems using blockchain's commit-reveal voting scheme."

**Show:**

- Problem: Current systems (Google Forms) can be manipulated by admins
- Solution: Votes stored on blockchain, immutable and verifiable

#### Phase 2: Live Demo (5-7 min)

**Part A: Voter Flow**

1. Navigate to voter dashboard
2. Open election
3. Click "Connect MetaMask" (show MetaMask popup)
4. Select candidate
5. Enter secret key: `mySecret123`
6. Click "Commit Vote to Blockchain"
7. **Approve transaction in MetaMask** (judges see this!)
8. Show transaction hash
9. Open [Sepolia Etherscan](https://sepolia.etherscan.io) → paste TX hash
10. Show transaction confirmed on blockchain

**Part B: Reveal (if time permits)**

1. Show reveal phase
2. Enter same secret key
3. Reveal vote on blockchain
4. Show vote count updated

#### Phase 3: Why Web3? (2 min)

"Web2 solution cannot provide:

1. **Immutability**: Admin cannot change votes after commit
2. **Privacy**: Vote hidden until reveal phase
3. **Verifiability**: Anyone can check blockchain
4. **No single point of failure**: Decentralized storage"

#### Phase 4: Q&A

Common questions:

- Q: "Is this expensive?" A: "Testnet is free, mainnet ~$1-5 per vote"
- Q: "What about gas fees?" A: "University can sponsor transactions via meta-transactions"
- Q: "Scalability?" A: "Can use L2 solutions like Base or Polygon"

---

## 🛡️ Backup Plans

### If Network is Slow

1. Show pre-recorded video of working demo
2. Show existing transactions on Etherscan
3. Explain the flow using screenshots

### If MetaMask Issues

1. Use multiple browsers (Chrome, Firefox, Brave)
2. Have backup wallet with testnet ETH
3. Show contract on Etherscan as proof it's deployed

### If You Run Out of Time

Focus on:

1. MetaMask connection (proves Web3 integration)
2. Commit vote transaction (shows blockchain interaction)
3. Etherscan verification (proves it's real blockchain)

---

## 📊 Technical Highlights for Judges

### Architecture

```
┌─────────────┐
│   Supabase  │ ← User profiles, election metadata
└─────────────┘
       │
       ▼
┌─────────────┐
│  React UI   │ ← MetaMask integration
└─────────────┘
       │
       ▼
┌─────────────┐
│  Ethereum   │ ← Vote commitments & counts
│  (Sepolia)  │
└─────────────┘
```

### Smart Contract Features

- ✅ Multi-election support
- ✅ Commit-reveal scheme
- ✅ On-chain vote counting
- ✅ Eligibility verification
- ✅ Phase management
- ✅ Event emission for indexing

### Frontend Features

- ✅ MetaMask wallet connection
- ✅ Network detection & switching
- ✅ Transaction status tracking
- ✅ User-friendly error messages
- ✅ Hybrid data architecture

---

## 🎯 Key Selling Points

1. **Real Blockchain**: Not a simulation - actual Sepolia testnet
2. **MetaMask Integration**: Industry-standard wallet
3. **Commit-Reveal**: Prevents vote buying/coercion
4. **Verifiable**: Anyone can check on Etherscan
5. **Production-Ready**: Can deploy to mainnet with minimal changes

---

## 📝 What to Show in README (Update before submission)

Add to your GitHub README:

```markdown
## 🎥 Live Demo

- **Deployed Contract**: https://sepolia.etherscan.io/address/0xYourAddress
- **Demo Video**: [Link to demo video]
- **Demo Site**: [If deployed on Vercel/Netlify]

## 🔗 Quick Links

- Sepolia Testnet: https://sepolia.etherscan.io
- Contract Address: `0xYourContractAddress`
- Sample Transaction: https://sepolia.etherscan.io/tx/0xSampleTxHash
```

---

## ⚡ Quick Test Commands

```bash
# Check if contract deployed
npx hardhat verify --network sepolia 0xYourContractAddress

# Test locally
npm run dev

# Build for production
npm run build
```

---

## 🚨 Common Issues & Fixes

### "MetaMask not detected"

- Make sure MetaMask extension is installed
- Refresh the page
- Check browser console for errors

### "Wrong network"

- App will auto-prompt to switch to Sepolia
- Or manually: MetaMask > Networks > Sepolia

### "Insufficient funds"

- Get more testnet ETH from faucets
- Each transaction costs ~0.001 ETH

### "Transaction failed"

- Check you're in correct phase (Commit/Reveal)
- Verify you're eligible voter
- Check MetaMask gas settings

---

## 🎉 You're Ready!

Tomorrow's demo will show:

1. ✅ Real blockchain integration (not fake)
2. ✅ MetaMask wallet connection
3. ✅ Live transactions on Sepolia
4. ✅ Verifiable on Etherscan
5. ✅ Production-quality UI

**Good luck with your presentation! 🚀**
