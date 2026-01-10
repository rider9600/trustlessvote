# ✅ Auto-Wallet Assignment & Contract Display - Complete

## 🎯 What Changed

### 1. **Sequential Wallet Assignment** (address0, address1, address2...)

- Changed from random to sequential order
- First user gets wallet #0, second gets #1, etc.
- More predictable and organized

### 2. **Auto-Assign on Signup**

- New users automatically get assigned the next available wallet
- No manual assignment needed
- Works for unlimited users (up to 20 with current pool)

### 3. **Contract Address Display**

- Shows contract address when creating election
- Displays in Election Details page
- Copy button for easy sharing

---

## 📁 Files Created/Updated

### New Files:

1. **`server/src/wallets.ts`** - Wallet management functions

   - `assignWalletToProfile()` - Auto-assign next wallet
   - `getWalletForProfile()` - Get wallet for backend signing
   - `getWalletPoolStats()` - Check pool status

2. **`src/services/contract-deployment.service.ts`** - Contract management
   - `deployContractForElection()` - Create contract per election
   - `getContractForElection()` - Fetch contract address

### Updated Files:

1. **`server/src/auth.ts`** - Auto-assign wallet on signup
2. **`src/pages/CreateElection.tsx`** - Deploy contract on election creation
3. **`src/pages/ElectionDetails.tsx`** - Display contract address
4. **`scripts/assign-wallets-supabase.mjs`** - Sequential assignment

---

## 🔄 How It Works Now

### User Signup Flow:

```
1. User signs up (POST /auth/signup)
   ↓
2. Profile created in database
   ↓
3. Auto-assign next wallet (address0, address1, etc.)
   ↓
4. User can immediately vote with assigned wallet
```

### Election Creation Flow:

```
1. Admin creates election
   ↓
2. Election saved to database
   ↓
3. Contract assigned (stores in election_blockchain_map)
   ↓
4. Contract address shown to admin
   ↓
5. Admin can share contract for verification
```

### Voting Flow:

```
1. User logs in
   ↓
2. Backend fetches user's assigned wallet + private key
   ↓
3. User commits vote (backend signs with their wallet)
   ↓
4. Transaction sent to blockchain
   ↓
5. Vote recorded immutably
```

---

## 🗄️ Database Schema

### `profiles` table:

```sql
- id (uuid)
- email (text)
- full_name (text)
- role (text)
- wallet_address (text) ← Auto-assigned on signup
```

### `hardhat_wallet_pool` table:

```sql
- id (serial)
- wallet_address (text)
- private_key (text)
- is_assigned (boolean)
- assigned_to_profile_id (uuid)
- assigned_at (timestamp)
```

### `election_blockchain_map` table:

```sql
- election_id (uuid)
- contract_address (text) ← Set when election created
- chain_name (text)
```

---

## 🎨 UI Updates

### Election Details Page:

```
┌─────────────────────────────────────────┐
│ 📜 Smart Contract                       │
│ 0xe7f1725E7734CE288F8367e1Bb143E90... │
│                             [Copy]      │
└─────────────────────────────────────────┘
```

### Create Election Success:

```
✅ Election created!
   Contract: 0xe7f1725E...
```

---

## 🚀 Usage

### For New Users:

Just sign up - wallet assigned automatically!

### For Existing Users (6 in Supabase):

```bash
# Run once to assign wallets sequentially
node scripts/assign-wallets-supabase.mjs
```

### For Admins Creating Elections:

Contract automatically assigned when you create an election. View it in Election Details page.

---

## 💡 Key Benefits

✅ **No manual wallet assignment** - Automatic on signup  
✅ **Sequential allocation** - Predictable (address0, 1, 2...)  
✅ **One wallet per user** - Consistent blockchain identity  
✅ **One contract per election** - Each election is isolated  
✅ **Easy verification** - Contract address displayed and copyable  
✅ **Works on Vercel** - All backend signing, no MetaMask needed

---

## 📊 Current Capacity

- **Wallet Pool**: 20 Hardhat accounts
- **Currently Assigned**: 0 (run script to assign to 6 existing users)
- **Remaining**: 20 → 14 (after assigning to 6 users)
- **New signups**: Auto-assign until pool exhausted

### When Pool Gets Full:

You can:

1. Add more Hardhat accounts to pool
2. Use a testnet (Sepolia) with faucet
3. Limit registration to 20 users
