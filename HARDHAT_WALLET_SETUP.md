# 🎯 Hardhat Wallet System - Complete Setup

## ✅ What's Configured

### 1. 20 Pre-Funded Hardhat Accounts

- **All 20** profiles have been mapped to the Hardhat test accounts
- Each profile gets a dedicated wallet with **10,000 ETH** (testnet)
- Wallet addresses and private keys are stored in the database

### 2. Deployed Smart Contract

- **Contract Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Network**: Hardhat Local (localhost:8545)
- **Chain ID**: 31337
- Saved in `.env.local` for frontend use

### 3. Profile-to-Wallet Mapping

| #   | Profile            | Role  | Wallet Address  | Private Key (Test Only!) |
| --- | ------------------ | ----- | --------------- | ------------------------ |
| 1   | Admin User         | ADMIN | 0xf39Fd...2266  | 0xac0974...2ff80         |
| 2   | Alice (Voter 1)    | VOTER | 0x70997...79C8  | 0x59c699...8690d         |
| 3   | Bob (Voter 2)      | VOTER | 0x3C44C...93BC  | 0x5de411...b365a         |
| 4   | Carol (Voter 3)    | VOTER | 0x90F79...3b906 | 0x7c8521...007a6         |
| 5   | Dave (Voter 4)     | VOTER | 0x15d34...6A65  | 0x47e179...4926a         |
| 6   | Eve (Voter 5)      | VOTER | 0x99655...A4dc  | 0x8b3a35...dffba         |
| 7   | Frank (Voter 6)    | VOTER | 0x976EA...0aa9  | 0x92db14...1564e         |
| 8   | Grace (Voter 7)    | VOTER | 0x14dC7...9955  | 0x4bbbf8...f4356         |
| 9   | Heidi (Voter 8)    | VOTER | 0x23618...1E8f  | 0xdbda18...a67b97        |
| 10  | Ivan (Voter 9)     | VOTER | 0xa0Ee7...9720  | 0x2a871d...d409c6        |
| 11  | Judy (Voter 10)    | VOTER | 0xBcd40...4096  | 0xf214f2...28897         |
| 12  | Mallory (Voter 11) | VOTER | 0x71bE6...5788  | 0x701b61...192c82        |
| 13  | Niaj (Voter 12)    | VOTER | 0xFABB0...694a  | 0xa26753...4967b1        |
| 14  | Olivia (Voter 13)  | VOTER | 0x1CBd3...C9Ec  | 0x47c99a...942dd         |
| 15  | Peggy (Voter 14)   | VOTER | 0xdF3e1...7097  | 0xc526ee...09aaa         |
| 16  | Rupert (Voter 15)  | VOTER | 0xcd3B7...ce71  | 0x816654...ffb61         |
| 17  | Sybil (Voter 16)   | VOTER | 0x2546B...Ec30  | 0xea6c44...2484a0        |
| 18  | Trent (Voter 17)   | VOTER | 0xbDA57...197E  | 0x689af8...37fd          |
| 19  | Victor (Voter 18)  | VOTER | 0xdD2FD...44C0  | 0xde9be8...b4ee0         |
| 20  | Wendy (Voter 19)   | VOTER | 0x86269...1199  | 0xdf5708...3656e         |

## 🔧 Database Schema

### New Table: `hardhat_wallet_pool`

```sql
- wallet_address (text, unique)
- private_key (text)
- is_assigned (boolean)
- assigned_to_profile_id (uuid, FK to profiles)
- assigned_at (timestamp)
```

### Updated: `profiles` table

- Each profile now has a `wallet_address` field populated
- Wallet addresses match the Hardhat accounts

## 📜 Scripts Created

### 1. `scripts/get-hardhat-accounts.mjs`

Display all 20 Hardhat accounts with addresses and keys

```bash
node scripts/get-hardhat-accounts.mjs
```

### 2. `scripts/deploy-local.mjs`

Deploy TrustlessVote contract to local Hardhat node

```bash
node scripts/deploy-local.mjs
```

### 3. `scripts/assign-wallets.mjs`

Auto-assign available wallets to profiles without addresses

```bash
node scripts/assign-wallets.mjs
```

### 4. `scripts/view-wallet-mappings.mjs`

View all profile-wallet mappings and system status

```bash
node scripts/view-wallet-mappings.mjs
```

## 🚀 How to Use

### For Voters

1. Login with voter credentials (e.g., voter01@trustlessvote.local / password123)
2. The system **automatically uses the assigned Hardhat wallet**
3. No MetaMask needed - backend handles signing

### For Admins

1. Login with admin credentials (admin@trustlessvote.local / password123)
2. Use Hardhat Account #0 automatically
3. Create elections and manage voters

### Login Credentials (All Test Users)

**Password for all accounts**: `password123`

**Admin**:

- Email: `admin@trustlessvote.local`

**Voters**:

- Email: `voter01@trustlessvote.local` to `voter19@trustlessvote.local`

## 🔐 Security Notes

⚠️ **IMPORTANT**: These are **PUBLIC TEST KEYS**!

- **NEVER** use these accounts with real funds
- **NEVER** deploy to mainnet with these keys
- Only for **local development** and **testing**

## 📊 Current System Status

✅ **20/20 wallets** assigned to profiles  
✅ **Contract deployed** at `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`  
✅ **All profiles** have wallet mappings  
✅ **Database migrations** applied  
✅ **Frontend configured** with contract address

## 🎯 Next Steps

1. **Restart dev server** to load new contract address:

   ```bash
   npm run dev
   ```

2. **Test voting flow**:

   - Login as admin
   - Create election
   - Add candidates
   - Add voters
   - Login as voter
   - Commit vote (backend uses Hardhat wallet automatically)
   - Reveal vote

3. **Monitor transactions** on Hardhat console (see Docker logs)
