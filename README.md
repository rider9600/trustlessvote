# TrustlessVote

A trustless, decentralized voting dApp with an on-chain election contract and a modern React frontend. Auth, profiles, and some off-chain data are managed via Supabase.

## Overview

- Smart contract: `contracts/TrustlessVote.sol` (Solidity, Hardhat)
- Frontend: React + Vite + TypeScript + Tailwind + shadcn-ui
- Backend services: Supabase (auth, storage, Postgres)
- Scripts: Hardhat + utility deploy scripts under `scripts/`

See the implementation summary and architecture notes in [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).

## Tech Stack

- Frontend: Vite, React, TypeScript, React Router
- UI: Tailwind CSS, shadcn-ui, Radix UI
- Data & Forms: TanStack Query, React Hook Form, Zod
- Charts & UX: Recharts, Sonner (toasts), Lucide Icons
- Web3: Ethers.js, MetaMask integration, Hardhat network
- Backend: Supabase (Auth, Postgres, Storage)
- Tooling: ESLint, TypeScript, Vite SWC plugin

## Quick Start

### Option A: Docker (full local stack)

Bring up the frontend, local chain, and Supabase-like services with:

```sh
docker compose up -d --build
```

Details (ports, seeded accounts, service layout) are in [DOCKER_DEV.md](DOCKER_DEV.md).

### Option B: Manual (frontend only)

Prerequisites:

- Node.js 18+ and npm
- Supabase project (for auth) — see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

Steps:

```sh
# Install dependencies
npm install

# Configure environment (create .env.local)
# Required:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# Optional (if connecting to a chain/RPC):
# VITE_RPC_URL=...
# VITE_CHAIN_ID=...

# Start the dev server
npm run dev
```

The dev server runs locally; see the terminal output for the port. For full-stack local development, prefer Docker.

## Smart Contracts

- Contract source: [contracts/TrustlessVote.sol](contracts/TrustlessVote.sol)
- Hardhat config: [hardhat.config.cjs](hardhat.config.cjs)

Common commands:

```sh
# Compile contracts
npx hardhat compile

# Run contract tests (if present)

npx hardhat test

# Deploy via script (configure network in hardhat config or env)
node scripts/deploy-ethers.mjs
```

For verification and deployment tips, see [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) and [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

### Contract API (summary)

- `createElection(electionId)`: initializes an election on-chain (admin = sender)
- `addVoter(electionId, voter)` / `addVotersBatch(...)`: marks wallets eligible
- `setPhase(electionId, phase)`: switches phases: Registration → Commit → Reveal → Results
- `commitVote(electionId, commitment)`: stores `keccak256(candidateId + secret)`
- `revealVote(electionId, candidateId, secret)`: verifies commitment and increments on-chain count
- Read-only helpers: `getVoteCount`, `getElectionStats`, `hasCommitted`, `isVoterEligible`

## Supabase Setup

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to:

- Create a Supabase project
- Configure auth providers
- Set required environment variables for the frontend

## Testing

Guidance for testing the contracts and app is in [TESTING_GUIDE.md](TESTING_GUIDE.md).

## Deployment

- Vercel: see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Azure: see [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)
- Docker-based hosting: adapt from [docker-compose.yml](docker-compose.yml)

## Project Structure

- Frontend app under `src/` with routes in `src/pages/` and services in `src/services/`
- Web3 helpers in `src/lib/`
- Contracts and Hardhat tooling under `contracts/` and scripts in `scripts/`

## Troubleshooting

- Missing Supabase keys: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`.
- RPC/chain issues: set `VITE_RPC_URL` and `VITE_CHAIN_ID` appropriately or run the local chain via Docker.
- Port conflicts: stop other dev servers or adjust ports in Vite/Docker configs.

For deeper setup and operational details, consult the docs in this folder (Docker, Supabase, Deployment, Testing).

## System Workflow

### Admin Flow

1. Sign up/sign in (Supabase Auth). A `profiles` row is created with `role = admin`.
2. Create election (Supabase: `elections`). Get the generated `id` (UUID).
3. Initialize on-chain election: call `createElectionOnChain(id)` so blockchain knows this election.
4. Add candidates (Supabase: `candidates`, optional `candidate_manifestos`).
5. Add voters off-chain (Supabase: `election_voters`) and on-chain via `addVoter` or `addVotersBatch` (wallet addresses).
6. Define timeline (Supabase: `election_phases`). When ready, set on-chain phase via `setPhase(id, Commit)`.
7. During commit window, monitor status (counts via on-chain `getElectionStats` and Supabase flags).
8. Switch phase to `Reveal`. Voters reveal; counts increase on-chain in `voteCounts`.
9. Switch phase to `Results`. Mark Supabase election `status = completed` and read final counts from chain.

### Voter Flow

1. Connect MetaMask (frontend `web3Manager`). App switches to configured Hardhat/Sepolia network if needed.
2. Check eligibility (on-chain `isVoterEligible(electionId, wallet)`).
3. Commit: app computes `commitment = keccak256(candidateId + secret)` and calls `commitVote`. Supabase marks `has_committed`.
4. Reveal: later, call `revealVote(electionId, candidateId, secret)`. Supabase marks `has_revealed`.
5. View results: app reads on-chain counts per candidate via `getVoteCount`.

Notes:

- Keep your `secret` private; it must match between commit and reveal.
- If you switch devices, you must remember the same `secret` string used at commit.

## Internal Architecture

- Frontend services:
  - `src/services/auth.service.ts`: Supabase auth and `profiles` CRUD.
  - `src/services/elections.service.ts`: `elections`, `election_phases`, admin stats.
  - `src/services/candidates.service.ts`: `candidates`, `candidate_manifestos`.
  - `src/services/voters.service.ts`: `election_voters` and status flags.
- Web3:
  - `src/lib/contracts/trustlessVote.ts`: ABI, phase enum, network config, `CONTRACT_ADDRESS` env.
  - `src/lib/web3.ts`: MetaMask connect, network switching, `ethers.Contract` instantiation.
  - `src/services/blockchain.service.ts`: high-level contract calls (create, add voters, set phase, commit, reveal, stats).
- Data Model (Supabase tables):
  - `profiles`, `elections`, `election_phases`, `candidates`, `candidate_manifestos`, `election_voters`, `admin_election_stats`, optional `election_blockchain_map`.

## Environment Configuration

Create `.env.local` for frontend:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RPC_URL=http://<your-node>:8545
VITE_CHAIN_ID=31337
VITE_CONTRACT_ADDRESS=0x...
```

Docker flow writes `VITE_CONTRACT_ADDRESS` to `.env.docker` on deploy (see `scripts/deploy-ethers.mjs`).

## Development Scripts

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npx hardhat compile | test`: contract toolchain
- `node scripts/deploy-ethers.mjs`: deploy contract to local RPC (Docker/Hardhat)

## Security Considerations

- Commit–reveal ensures ballot secrecy during commit phase; reveals verify integrity.
- On-chain enforces eligibility and single-commit/reveal per voter.
- Do not log secrets or sensitive env values; check `src/lib/supabase.ts` for safe logging.
- Use HTTPS and verified RPC endpoints in production; rotate Supabase keys as needed.
