# 🧪 Testing Guide - Step by Step

## ✅ What You Can Test RIGHT NOW (Without Deployment)

### Step 1: Test Wallet Connection

1. **Make sure dev server is running:**

```bash
cd trustlessvote
npm run dev
```

2. **Open browser:** http://localhost:8080

3. **Login as voter:**

   - Email: voter@example.com
   - Password: password123

4. **Test in Voter Dashboard:**

   - You should see "Connect MetaMask" button
   - Click it
   - MetaMask popup should appear
   - Click "Connect" in MetaMask
   - Should show "Wallet Connected" with your address

5. **Test in Election Page:**
   - Click on any election
   - Should see "Connect Your Wallet" section at top
   - If already connected in dashboard, should show "Wallet Connected"
   - If not, click "Connect MetaMask" and approve

**✅ If wallet connects successfully, this part is working!**

---

## 🚀 Deploy Smart Contract (Needed for Voting)

### Prerequisites

**You need:**

- [ ] MetaMask installed in browser
- [ ] Alchemy account (free): https://www.alchemy.com/
- [ ] Sepolia testnet ETH (free from faucet)

### Step 1: Get Sepolia Testnet ETH (Free)

1. **Copy your MetaMask wallet address:**

   - Open MetaMask
   - Click on account name to copy address (starts with 0x...)

2. **Get free Sepolia ETH:**
   - Visit: https://sepoliafaucet.com/
   - OR: https://www.alchemy.com/faucets/ethereum-sepolia
   - Paste your wallet address
   - Click "Send Me ETH"
   - Wait 1-2 minutes
   - Check MetaMask - should see 0.5 Sepolia ETH

### Step 2: Create Alchemy Account (Free RPC Provider)

1. **Sign up:**

   - Go to: https://www.alchemy.com/
   - Click "Get started for free"
   - Sign up with email

2. **Create new app:**

   - Click "Create new app"
   - Name: TrustlessVote
   - Network: Ethereum
   - Chain: Sepolia
   - Click "Create app"

3. **Get API Key:**
   - Click on your app name
   - Click "API Key"
   - Copy the API Key (starts with something like: `abc123...`)

### Step 3: Export MetaMask Private Key

⚠️ **IMPORTANT:** Only use a TEST wallet for this! Never use your main wallet!

1. **Open MetaMask**
2. **Click 3 dots menu** → Account details
3. **Click "Show private key"**
4. **Enter your password**
5. **Copy the private key** (64 characters, no 0x prefix needed)

### Step 4: Create Environment File for Deployment

1. **Create a file named `.env` in trustlessvote folder** (NOT .env.local)

2. **Add these lines:**

```
SEPOLIA_PRIVATE_KEY=your_private_key_here_without_0x
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**Example:**

```
SEPOLIA_PRIVATE_KEY=abc123def456...
ALCHEMY_API_KEY=xyz789abc123...
```

3. **Save the file**

### Step 5: Deploy the Contract

Open PowerShell in trustlessvote folder:

```powershell
# 1. Compile the smart contract
npx hardhat compile

# Should see: "Compiled 1 Solidity file successfully"

# 2. Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Wait 30-60 seconds...
```

**Expected Output:**

```
Deploying TrustlessVote contract...
Contract deployed to: 0x1234567890abcdef1234567890abcdef12345678
Transaction hash: 0xabc123...
Block number: 5432123

✅ Deployment successful!
🌐 View on Etherscan: https://sepolia.etherscan.io/address/0x1234...
```

**⚠️ SAVE THE CONTRACT ADDRESS!** (the 0x... address)

### Step 6: Update Frontend with Contract Address

1. **Open `.env.local` file in trustlessvote folder**

2. **Find this line:**

```
VITE_CONTRACT_ADDRESS=
```

3. **Update it with your deployed contract address:**

```
VITE_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

4. **Save the file**

5. **Restart dev server:**

```powershell
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🎉 Test Full Voting Flow

Now you can test the complete blockchain voting!

### Test 1: Connect Wallet

1. Open http://localhost:8080
2. Login as voter
3. Click "Connect MetaMask"
4. Approve connection
5. Should see "Wallet Connected"

### Test 2: Commit Vote

1. Click on an election
2. Select a candidate
3. Enter a secret key (example: `mySecret123`)
4. Click "Commit Vote to Blockchain"
5. MetaMask popup appears - click "Confirm"
6. Wait 15-30 seconds
7. Should see success message with transaction hash
8. Click "View on Etherscan" to see transaction

### Test 3: Check Transaction on Etherscan

1. Open the Etherscan link
2. Should see:
   - Status: Success ✅
   - Method: commitVote
   - From: Your wallet address
   - To: Contract address
   - Block number

### Test 4: Reveal Vote (If election is in Reveal phase)

1. Click "Reveal Vote on Blockchain"
2. Enter the SAME secret key (`mySecret123`)
3. Click "Reveal"
4. Approve in MetaMask
5. Wait 15-30 seconds
6. Should see success message
7. Vote is now counted!

---

## 🐛 Troubleshooting

### Issue: "MetaMask is not installed"

**Solution:** Install MetaMask browser extension from https://metamask.io/

### Issue: "Insufficient funds"

**Solution:** Get more Sepolia ETH from faucet (you need ~0.01 ETH for transactions)

### Issue: "Wrong network"

**Solution:**

- Open MetaMask
- Click network dropdown (top left)
- Select "Sepolia test network"
- If not visible, click "Show test networks" in settings

### Issue: "Smart contract not deployed"

**Solution:** Follow deployment steps above - contract address must be in .env.local

### Issue: "Cannot read properties of null"

**Solution:**

- Make sure you're logged in
- Make sure election has candidates
- Check browser console (F12) for errors

### Issue: "Transaction failed"

**Solution:**

- Check you have enough Sepolia ETH (0.01+)
- Make sure you're on Sepolia network
- Wait for previous transaction to complete

---

## 📊 What to Show in Demo Tomorrow

### 1. Login Flow (30 seconds)

- Login as voter
- Show dashboard with elections

### 2. Connect Wallet (1 minute)

- Click "Connect MetaMask"
- Show MetaMask popup
- Show "Wallet Connected" status

### 3. Commit Vote (2 minutes)

- Select election
- Choose candidate
- Enter secret key
- Click "Commit to Blockchain"
- **Show MetaMask popup** (this proves blockchain!)
- Approve transaction
- Show success message

### 4. Show on Etherscan (1 minute)

- Open Etherscan link
- Point out:
  - Transaction hash
  - Block number
  - Contract interaction
  - Gas fees paid

### 5. Explain Why Blockchain (1 minute)

"This proves votes are:

- Immutable (can't be changed)
- Transparent (anyone can verify)
- Decentralized (no single point of control)
- Timestamped (permanent record)"

---

## ✅ Final Checklist for Demo

Before presentation:

- [ ] Contract deployed to Sepolia
- [ ] Contract address in .env.local
- [ ] Wallet has 0.1+ Sepolia ETH
- [ ] Tested full commit flow once
- [ ] Saved Etherscan transaction link
- [ ] Browser has MetaMask extension
- [ ] Dev server runs without errors
- [ ] Can login as voter
- [ ] Elections are visible
- [ ] Candidates are showing

Backup plan:

- [ ] Record video of working flow
- [ ] Take screenshots of Etherscan
- [ ] Save transaction hashes
- [ ] Have explanation ready if network slow

---

## 🎯 Quick Test Commands

```bash
# Check if hardhat is installed
npx hardhat --version

# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Start frontend
npm run dev

# Check if contract address is set
cat .env.local | Select-String "VITE_CONTRACT_ADDRESS"
```

---

**🚀 You're ready to demo! Good luck with your presentation tomorrow!**
