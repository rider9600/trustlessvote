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
- Frontend: Minimal UI served via Express (deployable to Vercel)
- Blockchain interaction: Ethers.js
- Infrastructure: Docker & Docker Compose (optional) for reproducible local setup)
- Backend APIs: Node/Express (Microsoft Auth, Email, Files) ready for Render
- Storage/DB: Supabase (Storage bucket + Postgres tables)

---

## **Project structure**

backend/
├── contracts/CampusVote.sol
├── scripts/deploy.js
├── scripts/testCommitReveal.js
├── src/server.js (Express API: auth/email/files)

frontend/
├── public/index.html
├── public/app.js
├── public/styles.css

docker-compose.yml
README.md
render.yaml (Render blueprint)

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

## **Deploy (Render + Supabase + Vercel)**

1) Supabase
- Create a new project and get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Create Storage bucket named `uploads`.
- Create tables (SQL editor):
	- files:
		- id text primary key
		- original_name text
		- mime_type text
		- size bigint
		- path text not null
		- uploader text
		- created_at timestamptz default now()
	- email_reminders:
		- id bigint primary key generated always as identity
		- to_address text not null
		- subject text
		- body_html text
		- run_at timestamptz not null
		- sent_at timestamptz
		- created_at timestamptz default now()

2) Azure (Entra ID)
- Register app; record `AZURE_CLIENT_ID`, create `AZURE_CLIENT_SECRET`, set tenant or use `common`.
- Add Redirect URI (Web): `https://YOUR_RENDER_BACKEND/auth/redirect` and `http://localhost:4000/auth/redirect` for local.
- API permissions: Microsoft Graph → Delegated → `User.Read`, `Mail.Send` → Grant admin consent.
 - For scheduled emails (cron), also add Application permission: `Mail.Send` and grant admin consent. Provide `MAIL_SENDER_USER_ID` (UPN or user object id) of the mailbox to send from.

3) Render
- Use the provided [render.yaml](render.yaml) blueprint.
- After first deploy, update env `BASE_URL` to the actual Render URL.
- Configure env vars: `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally adjust `CORS_ORIGINS`.
- The cron job hits `/email/process-reminders` every 5 minutes; you may later move to a service mailbox flow for long-lived email sending.
 - Set `MAIL_SENDER_USER_ID` for cron-based sends (requires Graph Application permission).

4) Vercel (Frontend)
- Deploy the `frontend` folder as a static site or small Node app.
- Set env `VITE_BACKEND_URL` or hardcode backend base in your JS (e.g., `https://YOUR_RENDER_BACKEND`).
- Add a "Sign in with Microsoft" button linking to `${BACKEND_URL}/auth/login`.

5) Ethereum
- Choose a network (e.g., Sepolia testnet). Configure RPC via Alchemy/Infura in Hardhat.
- Deploy contract with Hardhat and set the contract address in the frontend.
- Users connect with MetaMask to interact on-chain.

---

## **Planned improvements (Round 2)**

- Student identity verification / federation
- Support for multiple concurrent elections
- Better UI/UX and mobile support
- Deploy to a public testnet and run gas estimates
- Additional security audits and edge-case handling
 - Persistent session store (Redis) on Render
 - Durable scheduled email worker using a queue

---

