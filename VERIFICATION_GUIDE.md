# 🔍 Blockchain Verification & Workflow Guide

## 📊 What Data is Stored on the Blockchain?

### On-Chain Data (Immutable, Public, Verifiable)

```solidity
1. Election Structure
   - Election ID (UUID from Supabase)
   - Admin Address (who created it)
   - Current Phase (Registration/Commit/Reveal/Results)
   - Total Voters Count
   - Total Committed Votes
   - Total Revealed Votes

2. Voter Eligibility
   - Mapping: electionId → voterAddress → boolean
   - Ensures only registered voters can participate

3. Vote Commitments (During Commit Phase)
   - Mapping: electionId → voterAddress → commitmentHash
   - commitmentHash = SHA256(candidateId + secretKey)
   - Example: SHA256("candidate-uuid-123" + "mySecret456")

4. Reveal Status
   - Mapping: electionId → voterAddress → hasRevealed (boolean)
   - Prevents double voting

5. Vote Counts (After Reveal)
   - Mapping: electionId → candidateId → voteCount
   - Final tallied results on blockchain
```

### Off-Chain Data (Supabase - For UX)

```
1. User profiles (name, email, wallet_address)
2. Election metadata (title, description, dates)
3. Candidate information (name, photo, manifesto)
4. Voter status tracking (committed_at, revealed_at, selected_candidate_id)
```

### Why This Split?

- **Blockchain** = Integrity, Immutability, Verification
- **Supabase** = Speed, User Experience, Rich Metadata
- **Best of Both Worlds** = Fast UI + Trustless Voting

---

## 🔐 Complete Voter Workflow (After Login)

### Step 1: Voter Logs In

```
1. User enters credentials at /login
2. Supabase authenticates user
3. System fetches voter profile from Supabase
4. Dashboard shows: Available Elections, Wallet Status
```

### Step 2: Navigate to Election

```
1. Voter clicks on election card
2. Navigate to /election/{electionId}
3. System loads:
   ✓ Election details from Supabase (title, description, phases)
   ✓ Candidates from Supabase (names, photos, manifestos)
   ✓ Voter status from Supabase (has_committed, has_revealed)
```

### Step 3: Connect MetaMask

```
1. Voter clicks "Connect MetaMask" button
2. MetaMask popup appears
3. Voter approves connection
4. Frontend receives wallet address: 0x1234...
5. System checks network (must be Sepolia)
6. If wrong network → Auto-switch to Sepolia
7. Wallet address displayed in UI
```

**UI Shows:**

```
✅ Connected: 0x1234...5678
Network: Sepolia Testnet
```

### Step 4: Commit Phase - Cast Vote

```
1. Voter selects candidate from list
2. Voter enters secret key (e.g., "mySecret123")
3. Voter clicks "Commit Vote to Blockchain"

Frontend Actions:
   a) Validate inputs (candidate selected, secret not empty)
   b) Generate commitment hash:
      commitmentHash = keccak256(candidateId + secretKey)
      Example: keccak256("uuid-candidate-1" + "mySecret123")
      Result: 0xabcd1234...

   c) Call blockchain.service.ts:
      commitVoteOnChain(electionId, commitmentHash)

   d) MetaMask popup appears:
      "TrustlessVote Contract - Commit Vote"
      Gas Estimate: ~50,000 gas

   e) Voter approves transaction

   f) Transaction submitted to Sepolia
      TX Hash: 0x789abc...

   g) Wait for confirmation (~15 seconds)

   h) Update Supabase voter status:
      - has_committed = true
      - committed_at = timestamp
      - selected_candidate_id = candidateId (encrypted)
      - secret_key = secretKey (stored locally/encrypted)

   i) Show success toast:
      "Vote committed! TX: 0x789abc..."

Blockchain State After Commit:
   commitments[electionId][voterAddress] = 0xabcd1234...
   election.totalCommitted++
```

**UI Updates:**

```
Status: ✅ Vote Committed
Next: Wait for Reveal Phase
Transaction: View on Etherscan →
```

### Step 5: Reveal Phase - Verify Vote

```
1. Phase automatically changes to "Reveal" (time-based)
2. Voter clicks "Reveal Vote on Blockchain"
3. System retrieves stored secret key from Supabase
4. Voter re-enters secret key (or auto-filled)

Frontend Actions:
   a) Retrieve commitment data:
      - candidateId (from Supabase)
      - secretKey (from input or stored)

   b) Call blockchain.service.ts:
      revealVoteOnChain(electionId, candidateId, secretKey)

   c) Smart contract verifies:
      storedHash = commitments[electionId][voterAddress]
      computedHash = keccak256(candidateId + secretKey)

      if (storedHash == computedHash) {
         // Valid! Count the vote
         voteCounts[electionId][candidateId]++
         hasRevealed[voterAddress] = true
      } else {
         // Invalid! Reject transaction
         revert("Invalid reveal")
      }

   d) MetaMask popup appears:
      "TrustlessVote Contract - Reveal Vote"
      Gas Estimate: ~60,000 gas

   e) Voter approves transaction

   f) Transaction confirmed on Sepolia

   g) Update Supabase:
      - has_revealed = true
      - revealed_at = timestamp

   h) Show success toast:
      "Vote counted on blockchain!"

Blockchain State After Reveal:
   voteCounts[electionId][candidateId]++
   hasRevealed[electionId][voterAddress] = true
   election.totalRevealed++
```

**UI Updates:**

```
Status: ✅ Vote Revealed & Counted
Your vote is now on the blockchain!
Transaction: View on Etherscan →
```

### Step 6: Results Phase - View Results

```
1. Phase changes to "Results"
2. System calls:
   getVoteCountsFromChain(electionId, candidateIds)
3. Blockchain returns vote counts for each candidate
4. Display results with percentages
5. Show total votes from blockchain
6. Anyone can verify on Etherscan
```

---

## ✅ Verification Commands

### 1. Compile Contract

```bash
npx hardhat compile
```

**Expected Output:**

```
Compiled 1 Solidity file successfully
```

### 2. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
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

### 3. Verify Contract on Etherscan (Optional)

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

**Expected Output:**

```
Successfully verified contract TrustlessVote on Etherscan
```

### 4. Check Transaction on Etherscan

**Commit Transaction:**

```
URL: https://sepolia.etherscan.io/tx/0xYourTxHash

Look for:
- Status: Success ✅
- Method: commitVote
- From: 0xVoterAddress
- To: 0xContractAddress
- Input Data:
  - electionId: "uuid-string"
  - commitment: 0xabcd1234... (32 bytes hash)
- Gas Used: ~50,000
- Block: #5432124
- Timestamp: 2026-01-10 10:30:45
```

**Reveal Transaction:**

```
URL: https://sepolia.etherscan.io/tx/0xYourRevealTxHash

Look for:
- Status: Success ✅
- Method: revealVote
- From: 0xVoterAddress
- To: 0xContractAddress
- Input Data:
  - electionId: "uuid-string"
  - candidateId: "candidate-uuid"
  - secret: "mySecret123"
- Events Emitted:
  - VoteRevealed(electionId, voterAddress, candidateId)
- Gas Used: ~60,000
```

### 5. Query Contract State (Using Hardhat Console)

```bash
npx hardhat console --network sepolia
```

```javascript
// Get contract instance
const TrustlessVote = await ethers.getContractFactory("TrustlessVote");
const contract = TrustlessVote.attach("0xYourContractAddress");

// Check election exists
const election = await contract.elections("election-uuid-123");
console.log("Admin:", election.admin);
console.log("Phase:", election.currentPhase); // 0=Reg, 1=Commit, 2=Reveal, 3=Results
console.log("Total Voters:", election.totalVoters.toString());
console.log("Total Committed:", election.totalCommitted.toString());
console.log("Total Revealed:", election.totalRevealed.toString());

// Check if voter is eligible
const isEligible = await contract.eligibleVoters(
  "election-uuid",
  "0xVoterAddress"
);
console.log("Voter eligible:", isEligible);

// Check commitment
const commitment = await contract.commitments(
  "election-uuid",
  "0xVoterAddress"
);
console.log("Commitment hash:", commitment);

// Check vote count for candidate
const votes = await contract.voteCounts("election-uuid", "candidate-uuid");
console.log("Candidate votes:", votes.toString());
```

### 6. Test Frontend Connection

```bash
# Start dev server
npm run dev

# Open browser console (F12)
# Check for Web3 connection logs:
```

**Expected Console Output:**

```
[Web3Manager] Wallet connected: 0x1234...5678
[Web3Manager] Network: Sepolia (11155111)
[Web3Manager] Contract loaded at: 0xabcd...
```

### 7. Verify Gas Balance

```bash
# In browser console after connecting MetaMask
web3Manager.getProvider().getBalance("0xYourAddress")
```

**Or check on Etherscan:**

```
https://sepolia.etherscan.io/address/0xYourAddress
```

**Should see:**

```
Balance: 0.1 ETH (Sepolia)
```

### 8. Monitor Events (Real-time)

```bash
# In Hardhat console
const filter = contract.filters.VoteCommitted();
contract.on(filter, (electionId, voter, commitment) => {
  console.log("Vote committed!");
  console.log("Election:", electionId);
  console.log("Voter:", voter);
  console.log("Commitment:", commitment);
});
```

---

## 🎯 Quick Verification Checklist

### Before Demo

```bash
✅ Contract deployed: npx hardhat run scripts/deploy.js --network sepolia
✅ Contract address in .env.local: VITE_CONTRACT_ADDRESS=0x...
✅ Sepolia ETH in wallet: Check on Etherscan
✅ Frontend running: npm run dev
✅ MetaMask on Sepolia network
```

### During Demo

```bash
✅ Connect MetaMask: Click button, approve
✅ Commit vote: Select candidate, enter secret, approve TX
✅ Check Etherscan: Show transaction hash, status
✅ Reveal vote: Enter same secret, approve TX
✅ Verify results: Show vote count on blockchain
```

### Verification URLs

```
Contract: https://sepolia.etherscan.io/address/0xYourContract
Commit TX: https://sepolia.etherscan.io/tx/0xCommitTxHash
Reveal TX: https://sepolia.etherscan.io/tx/0xRevealTxHash
```

---

## 🔬 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    VOTER LOGIN & SETUP                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Supabase Authentication      │
        │  - Email/Password             │
        │  - Fetch voter profile        │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Navigate to Election Page    │
        │  - Load election details      │
        │  - Load candidates            │
        │  - Check voter status         │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Connect MetaMask             │
        │  - Request wallet access      │
        │  - Check/switch to Sepolia    │
        │  - Store wallet address       │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│ COMMIT PHASE │              │ SUPABASE DB  │
└──────┬───────┘              └──────┬───────┘
       │                              │
       │ 1. Select Candidate          │
       │ 2. Enter Secret              │
       │ 3. Generate Hash             │
       │    keccak256(id+secret)      │
       │                              │
       │ 4. Submit to Blockchain      │
       ▼                              │
┌─────────────────────┐              │
│  ETHEREUM SEPOLIA   │              │
│  TrustlessVote.sol  │              │
│                     │              │
│  commitments[       │              │
│    electionId       │              │
│  ][voterAddr]       │              │
│    = 0xHash         │              │
└─────────┬───────────┘              │
          │                          │
          │ 5. Transaction Success   │
          │                          │
          └──────────────────────────┤
                                     │ 6. Update Status
                                     │    has_committed=true
                                     ▼
                            ┌──────────────┐
                            │  SUPABASE    │
                            │  voter_status│
                            └──────────────┘

┌──────────────┐
│ REVEAL PHASE │
└──────┬───────┘
       │
       │ 7. Click Reveal
       │ 8. Enter Same Secret
       │ 9. Submit to Blockchain
       ▼
┌─────────────────────┐
│  ETHEREUM SEPOLIA   │
│  TrustlessVote.sol  │
│                     │
│  Verify:            │
│  stored == computed │
│  ✓ Match!           │
│                     │
│  voteCounts[        │
│    electionId       │
│  ][candidateId]++   │
└─────────┬───────────┘
          │
          │ 10. Vote Counted!
          │
          └──────────────────────────┐
                                     │ 11. Update Status
                                     │     has_revealed=true
                                     ▼
                            ┌──────────────┐
                            │  SUPABASE    │
                            │  voter_status│
                            └──────────────┘

┌──────────────┐
│ RESULTS PAGE │
└──────┬───────┘
       │
       │ 12. Fetch from Blockchain
       ▼
┌─────────────────────┐
│  ETHEREUM SEPOLIA   │
│  TrustlessVote.sol  │
│                     │
│  voteCounts[id][1]  │  → Display
│  voteCounts[id][2]  │  → Display
│  voteCounts[id][3]  │  → Display
└─────────────────────┘
```

---

## 🎪 Demo Talking Points

### "Where is my vote stored?"

**Answer:** "Your vote commitment hash is stored on the Ethereum Sepolia blockchain. Here's the transaction—anyone can verify it on Etherscan."

### "Can someone change my vote?"

**Answer:** "No. Once committed to blockchain, it's immutable. Not even the admin can modify it. That's the power of blockchain."

### "What if I forget my secret key?"

**Answer:** "Your vote cannot be revealed without the exact secret key. This prevents coercion—even under pressure, you can provide a fake secret. Only you know the real one."

### "How do we know votes are counted correctly?"

**Answer:** "The smart contract code is open source and verified on Etherscan. Anyone can audit the logic. Vote counting happens on-chain, visible to everyone."

### "Why not store everything on blockchain?"

**Answer:** "Blockchain is expensive and slow for rich data like photos, descriptions. We use hybrid: Supabase for UX, blockchain for integrity. Best of both worlds."

---

## 🚀 Ready to Verify!

All verification tools are ready. Follow the commands above to:

1. Deploy contract ✅
2. Submit transactions ✅
3. Verify on Etherscan ✅
4. Query blockchain state ✅
5. Prove immutability ✅

**Your demo will blow the judges away! 🎉**
