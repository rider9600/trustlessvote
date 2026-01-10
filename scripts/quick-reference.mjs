#!/usr/bin/env node

/**
 * Quick reference for TrustlessVote system
 */

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    TRUSTLESSVOTE - QUICK REFERENCE                         ║
╚════════════════════════════════════════════════════════════════════════════╝

📜 SMART CONTRACT
─────────────────────────────────────────────────────────────────────────────
Address:    0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Network:    Hardhat Local (http://localhost:8545)
Chain ID:   31337
File:       contracts/TrustlessVote.sol

💰 WALLET SYSTEM
─────────────────────────────────────────────────────────────────────────────
Type:       Pre-funded Hardhat accounts (20 total)
Balance:    ~10,000 ETH per account (testnet)
Storage:    Database table: hardhat_wallet_pool
Mapping:    Each profile → 1 unique wallet address

🔐 TEST CREDENTIALS
─────────────────────────────────────────────────────────────────────────────
Admin:      admin@trustlessvote.local / password123
Voters:     voter01@trustlessvote.local to voter19@trustlessvote.local
Password:   password123 (all accounts)

📊 USEFUL SCRIPTS
─────────────────────────────────────────────────────────────────────────────
View wallet mappings:
  $ node scripts/view-wallet-mappings.mjs

List all accounts:
  $ node scripts/get-hardhat-accounts.mjs

Assign wallets to profiles:
  $ node scripts/assign-wallets.mjs

Deploy contract:
  $ node scripts/deploy-local.mjs

🔧 DATABASE ACCESS
─────────────────────────────────────────────────────────────────────────────
Host:       localhost
Port:       54322
Database:   postgres
User:       postgres
Password:   postgres

Docker:
  $ docker exec -it trustlessvote-db psql -U postgres

🗄️ KEY TABLES
─────────────────────────────────────────────────────────────────────────────
profiles                  - User accounts (admin/voters)
hardhat_wallet_pool       - 20 Hardhat accounts with keys
elections                 - Election metadata
election_phases           - Commit/Reveal/Results phases
candidates                - Candidate details
election_voters           - Voter eligibility & status
election_blockchain_map   - Maps elections to contract

🚀 DEVELOPMENT WORKFLOW
─────────────────────────────────────────────────────────────────────────────
1. Start services:      docker compose up -d
2. Compile contract:    npx hardhat compile
3. Deploy contract:     node scripts/deploy-local.mjs
4. Start frontend:      npm run dev
5. Access app:          http://localhost:5173

📝 VOTING FLOW
─────────────────────────────────────────────────────────────────────────────
Phase 1: REGISTRATION
  - Admin creates election
  - Admin adds candidates
  - Admin adds eligible voters

Phase 2: COMMIT
  - Voters commit encrypted votes
  - Backend signs with assigned Hardhat wallet
  - Votes stored on blockchain (hashed)

Phase 3: REVEAL
  - Voters reveal their votes
  - Smart contract verifies hash matches
  - Vote counts updated on-chain

Phase 4: RESULTS
  - Final results visible
  - Anyone can verify on blockchain

🔍 MONITORING
─────────────────────────────────────────────────────────────────────────────
Docker logs:
  $ docker logs trustlessvote-hardhat -f

Frontend console:
  Browser DevTools → Console

Database queries:
  $ docker exec -it trustlessvote-db psql -U postgres

📚 DOCUMENTATION
─────────────────────────────────────────────────────────────────────────────
Setup Guide:        HARDHAT_WALLET_SETUP.md
Implementation:     IMPLEMENTATION_SUMMARY.md
Deployment:         DEPLOYMENT_GUIDE.md
Docker Guide:       DOCKER_DEV.md
Testing:            TESTING_GUIDE.md

╔════════════════════════════════════════════════════════════════════════════╗
║  Need help? Check the docs above or run: node scripts/view-wallet-mappings.mjs
╚════════════════════════════════════════════════════════════════════════════╝
`);
