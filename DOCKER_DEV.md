# Docker Local Dev (TrustlessVote)

This repo can run fully locally (frontend + local chain + local Supabase-like backend) using Docker Compose.

## Prereqs (Windows)

- Install **Docker Desktop**
- Ensure Docker Desktop is **running**
- Settings → **General**: enable “Use the WSL 2 based engine” (recommended)

Sanity check:

- `docker version` should show a **Server** section.

## Start everything

From the `trustlessvote/` folder:

- `docker compose up -d --build`

Services / ports:

- Frontend (Vite): `http://localhost:8080`
- Supabase base URL (proxy): `http://localhost:8000`
- Hardhat JSON-RPC: `http://localhost:8545`
- Postgres (optional direct access): `localhost:54322`

## Seeded accounts

On first boot, the `seed` container creates:

- Admin user
  - email: `admin@trustlessvote.local`
  - password: `admin123456`
- 19 voter users
  - emails: `voter01@trustlessvote.local` … `voter19@trustlessvote.local`
  - password: `voter123456`

Those 19 voters are also stored in `public.profiles` with a `wallet_address` matching the **first 19 default Hardhat accounts**.

## Notes

- The local Supabase keys and JWT secret are stored in `.env.docker` and are **dev-only**.
- The contract is deployed automatically on startup (`deploy` service).
- If you wipe volumes (`docker compose down -v`), everything will reseed on next `up`.

## Stop

- `docker compose down`

To delete all local data:

- `docker compose down -v`
