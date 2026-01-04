# **TrustlessVote**

**A Trustless Commit–Reveal Voting System for College Campuses**

TrustlessVote is a working Web3 prototype that demonstrates how college elections and polls can be made fair, private, and verifiable using blockchain. It replaces centralized tools (for example, Google Forms) with on‑chain rule enforcement using a commit–reveal voting mechanism.

---

## **Problem**

Current campus election systems often rely on centralized services. That introduces several issues:

- Votes stored in private databases
- Administrators can modify or delete responses
- Results cannot be independently verified
- Voters must trust the platform or organizer

For sensitive processes like voting, these weaknesses create a trust gap.

---

## **Our idea**

TrustlessVote enforces election rules with a smart contract instead of a central operator. Key properties:

- Eligible voters are registered on‑chain
- Votes are hidden (committed) during the voting window
- Votes are revealed later and counted on‑chain
- Final tallies are immutable and publicly verifiable

Once deployed, the admin cannot tamper with committed votes or final results.

---

## **Why Web3?**

Short comparison:

- Web2: database owner controls data; transparency depends on trust; auditing requires permissions.
- Web3: votes and rules live on‑chain; data immutability and public verifiability remove the need to trust a single party.

Blockchain gives cryptographic guarantees that are difficult or impossible to replicate with a centralized Web2-only system.

---

## **Core component (Round 1)**

The core implemented piece is the `TrustlessVote` smart contract implementing a phased commit–reveal voting flow:

- **Register** — admin registers eligible voters
- **Commit** — voters submit a hashed vote (choice + secret)
- **Reveal** — voters reveal their choice + secret; contract verifies and updates tally
- **End** — voting finalized

Guarantees provided by the contract:

- One eligible voter → one vote
- Vote privacy until reveal phase
- No vote modification after submission
- On‑chain, tamper‑proof tallying

---

## **Tech stack**

- Smart contract: Solidity (0.8.20), Hardhat
- Frontend: Minimal UI served via Express
- Blockchain interaction: Ethers.js
- Infrastructure: Docker & Docker Compose (optional) for reproducible local setup

---

## **Project structure**

backend/
├── contracts/CampusVote.sol
├── scripts/deploy.js
├── scripts/testCommitReveal.js

frontend/
├── public/index.html
├── public/app.js
├── public/styles.css

docker-compose.yml
README.md

---

## **Quick start (recommended: Docker)**

**Prerequisites**: Docker, Docker Compose

```bash
docker compose build
docker compose up
```

- Frontend: http://localhost:3000
- Local Hardhat node (if used): http://localhost:8545

---

## **Quick start (local, no Docker)**

**Prerequisites**: Node.js (16+), npm

1. Start a Hardhat node and deploy

```bash
cd backend
npm install
npx hardhat node
# in a second terminal:
npx hardhat run scripts/deploy.js --network localhost
```

2. Start the frontend

```bash
cd frontend
npm install
node server.js
# open http://localhost:3000
```

3. Use the UI

- Paste the deployed contract address into the **Contract Address** field and click **Use Address**.
- Connect with MetaMask or use **Connect via RPC** with a Hardhat private key (RPC: `http://localhost:8545`).

---

## **Testing the flow (manual)**

1. Deploy the contract on the local Hardhat network (`deploy.js`) and copy the address.
2. Open the frontend and paste the address.
3. As admin: register voters and click **Next Phase** to move to Commit.
4. As voter: commit (Choice + Secret).
5. Admin moves to Reveal; voters reveal with the same Choice + Secret.
6. Verify tallies update on‑chain.

An automated test helper is included at `backend/test/TrustlessVote.test.js`.

---

## **Current status (Round 1)**

- Core smart contract implemented and unit tested
- End‑to‑end commit → reveal flow verified
- Frontend interacts with the contract for demo purposes
- Dockerized setup for easy reproduction

---

## **Planned improvements (Round 2)**

- Student identity verification / federation
- Support for multiple concurrent elections
- Better UI/UX and mobile support
- Deploy to a public testnet and run gas estimates
- Additional security audits and edge-case handling

---

