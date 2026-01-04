docker-compose up

# TrustlessVote — Campus Commit-Reveal Voting

TrustlessVote is a minimal Web3 prototype for secure, trustless campus voting using a commit-reveal scheme.

## Problem Statement

Campus elections (student government, club officers, course representatives) often rely on centralized systems that can be opaque, tampered with, or require trusted administrators. TrustlessVote demonstrates a practical, implementable Web3 approach that enforces fairness and auditability without requiring voters to trust a single party.

## Solution Overview

- Smart contract (`TrustlessVote`) implements a phased commit-reveal voting flow (Register → Commit → Reveal → End).
- Admin registers eligible voters on-chain.
- Voters submit a commitment (hash of choice+secret) during Commit phase, then reveal in Reveal phase.
- Tallies are stored on-chain and are auditable.

## Why Web3?

- On-chain commitments and reveals ensure immutability and public verifiability of the election flow.
- A Web2 app cannot provide the same level of transparent, tamper-evident records without a trusted third party; Web3 decentralizes trust to the blockchain.

## Tech Stack

- Solidity `0.8.20` smart contract (Hardhat)
- Frontend: simple static app served by Express (`frontend/`)
- Development: Hardhat, Ethers.js
- Optional: Docker + Docker Compose to run frontend + backend together

## Quick Start — Recommended (Docker)

Prerequisites: `docker`, `docker-compose`

```bash
docker-compose build
docker-compose up
```

- Frontend served at http://localhost:3000
- Backend (Hardhat) available for local development

## Local development (without Docker)

1. Backend (Hardhat)

```bash
cd backend
npm install
npx hardhat node      # start local node in one terminal
npx hardhat run scripts/deploy.js --network localhost   # deploy contract
```

Note: `scripts/deploy.js` logs the deployed contract address.

2. Frontend

```bash
cd frontend
npm install
npm start   # starts express server (node server.js)
# open http://localhost:3000
```

## How to test the commit → reveal flow (manual)

1. Deploy contract on local Hardhat node and copy the contract address.
2. Open the frontend, paste the contract address into the `Contract Address` field and click `Use Address`.
3. As the deployer (admin), call `Add Voter` with a test address, then `Next Phase` to move to Commit.
4. Commit a vote: enter an integer `Choice` and a `Secret`, then `Commit` (the frontend computes the commitment and calls `commitVote`).
5. `Next Phase` to Reveal. Reveal by entering the same `Choice` and `Secret`, then `Reveal`.

# TrustlessVote — Campus Commit-Reveal Voting

TrustlessVote is a minimal, working Web3 prototype for secure campus voting using a commit–reveal scheme. It demonstrates a practical, implementable on-chain election flow suitable for student elections, club votes, and similar campus decisions.

## Project summary

- Smart contract: `TrustlessVote` implements a phased commit–reveal voting flow: Register → Commit → Reveal → End.
- Frontend: lightweight UI served by Express in `frontend/` to interact with the contract.
- Goal: show a simple, auditable, tamper‑evident voting process where the admin registers voters and votes are committed and revealed on‑chain.

## Why Web3 (short)

- Trustless audit trail: votes and commitments are recorded immutably on-chain.
- Decentralized verification: any participant can independently verify tallies and commitments using the contract address.
- Permission transparency: `eligibleVoters` is an on-chain registry; adds accountability to who can vote.

## Repo layout

- `backend/` — Hardhat project, Solidity contract at [backend/contracts/CampusVote.sol](backend/contracts/CampusVote.sol).
- `backend/scripts/deploy.js` — deployment script (deploys to Hardhat local node or testnet).
- `backend/artifacts/` — compiled artifacts (contains `TrustlessVote.json`).
- `frontend/` — Express server and static UI (served from `frontend/public/`).

## Quick start — Local (no Docker)

Prerequisites: Node.js (16+), npm

1. Start a local Hardhat node and deploy the contract

```bash
cd backend
npm install
npx hardhat node
# in a second terminal (once node is running):
npx hardhat run scripts/deploy.js --network localhost
```

Keep the deploy terminal open. `scripts/deploy.js` prints the deployed contract address — copy it.

2. Run the frontend

```bash
cd frontend
npm install
node server.js
# open http://localhost:3000
```

3. Use the UI

- Paste the deployed contract address into the `Contract Address` field and click `Use Address`.
- Connect a wallet: either MetaMask (connect) or use one of the Hardhat account private keys with `Connect via RPC` (enter a 0x... private key and use RPC `http://localhost:8545`).

## Demo walkthrough (what to show during the pitch)

1. Show the UI at [frontend/server.js](frontend/server.js).
2. Deploy contract and copy address (show `scripts/deploy.js` output).
3. As the deployer (admin):
   - Add one or two test accounts as eligible voters via `Add Voter`.
   - Click `Next Phase` to move to Commit phase.
4. Demonstrate two voters: each commits (Choice + Secret) — frontend computes commitment.
5. Advance to Reveal phase with `Next Phase` and reveal both votes.
6. Show on-chain tallies updating in the `Tallies` panel and copy transaction hashes for audit.

## Developer notes & gotchas

- Encoding must match: contract uses `keccak256(abi.encodePacked(choice, secret))`. The frontend provides `buildCommit` in `frontend/public/app.js`; confirm it produces identical packed bytes before hashing.
- `nextPhase()` increments the enum; there is no bounds check — do not call past the `End` phase in tests.
- This prototype stores vote counts on-chain but does not remove commitments after reveal — consider privacy/gas tradeoffs for production.

## Recommended additions (to increase judging score)

- Add Hardhat unit tests that exercise: registration, commit failure for unregistered voters, valid commit→reveal→tally.
- Add a tiny CI or test script that runs the tests and outputs pass/fail (helps judges see automated proof-of-work).
- Prepare a 5‑minute demo script and a short recorded clip (30–60s) showing commit+reveal.

## Commands quick reference

```bash
# start hardhat node
npx hardhat node

# deploy to local node (prints contract address)
npx hardhat run scripts/deploy.js --network localhost

# run frontend
node frontend/server.js
```

## Round 1 submission checklist

- 5‑minute video pitch with clear problem, technical approach, and Why Web3.
- GitHub repo with README (this file), contract, frontend, and at least one core component implemented.
- Invite `blockspace-iith` as a collaborator to your repository (private repos allowed).

---

If you want, I can:

1. Add a small Hardhat test suite that covers commit→reveal and produce a one-line `npm test` for `backend`.
2. Prepare a compact 5‑minute video script and a 30‑60s demo clip plan you can record.

Tell me which and I'll proceed.
