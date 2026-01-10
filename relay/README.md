# TrustlessVote Relay (VM)

A minimal relay that signs and submits transactions to a Hardhat node running on your VM. No MetaMask in the browser; the relay uses the VM’s unlocked accounts.

## Endpoints

- POST `/admin/deploy` — deploys `TrustlessVote` and persists the address
- GET `/admin/contract` — returns current contract address
- POST `/admin/create-election` — body `{ electionId }`
- POST `/admin/add-voters` — body `{ electionId, profileIds?: string[], addresses?: string[] }`
- POST `/admin/set-phase` — body `{ electionId, phase: 0|1|2|3 }`
- POST `/vote/commit` — body `{ electionId, profileId, commitment? | (candidateId, secret) }`
- POST `/vote/reveal` — body `{ electionId, profileId, candidateId, secret }`

All requests require header `X-API-Key: <API_KEY>`.

## Configure

Copy `.env.example` to `.env` and set values:

- `HARDHAT_RPC_URL`: e.g. `http://127.0.0.1:8545`
- `ADMIN_PRIVATE_KEY`: a Hardhat account (admin) used for admin ops
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`: used to resolve voter wallet private keys via `profiles.wallet_address` and `hardhat_wallet_pool.private_key` (server-side only)
- `API_KEY`: shared secret the frontend includes in request headers

## Run

```bash
cd relay
npm install
npm run start
```

## Networking

- For local dev: create an SSH tunnel to the VM or expose via Nginx with CORS and IP allowlist.
- The API key is visible to the browser if you call this directly from the frontend. Restrict access at the edge (IP allowlist, private network/VPC, or use a reverse proxy that injects the key).

## Notes

- `TrustlessVote` is deployed once; elections are created by ID within the same contract.
- Voter signing uses the private keys stored in `hardhat_wallet_pool`. Keep the service key secure and run the relay only on the VM.
