# Frontend – API & Blockchain Technical Test

React 19 + TypeScript + Vite frontend integrating the LaRevela REST API and a Web3 wallet/contract flow.

Live API: **https://api.larevela.com** · Swagger UI: **https://api.larevela.com/docs#/** · OpenAPI JSON: **https://api.larevela.com/openapi.json**

---

## Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if you need to override defaults (base URL, token, chain, contract)
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
src/
  api/           # Base fetch client (session-cookie auth, typed ApiError)
  blockchain/    # viem contract config, read/write helpers
  components/    # Layout, ErrorMessage, Loading
  hooks/         # useAuth (login/logout/me/updateProfile), useApi (websites CRUD), useWallet
  pages/         # LoginPage, WebsitesPage, ProfilePage, BlockchainDemo
  types/         # TypeScript interfaces derived from the OpenAPI spec
```

---

## Environment Variables

| Variable                | Description                                                 | Default                    |
| ----------------------- | ----------------------------------------------------------- | -------------------------- |
| `VITE_API_BASE_URL`     | LaRevela API base URL                                       | `https://api.larevela.com` |
| `VITE_API_TOKEN`        | Optional Bearer token (leave blank for session-cookie auth) | —                          |
| `VITE_CHAIN_ID`         | EVM chain ID (`1` = mainnet, `11155111` = Sepolia)          | `11155111`                 |
| `VITE_CONTRACT_ADDRESS` | Deployed LaRevelaToken address (`0x…`)                      | placeholder (see below)    |

---

## Part 1 – API Integration

### Authentication

The API uses **session cookies**. The client sends `credentials: 'include'` with every request so the browser automatically attaches the session cookie after login.

### Pages & Endpoints

| Page                       | Endpoints used                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Login** (`/login`)       | `POST /api/v1/auth/login`                                                                                    |
| **Websites** (`/websites`) | `GET /api/v1/websites`, `POST /api/v1/websites`, `PUT /api/v1/websites/{id}`, `DELETE /api/v1/websites/{id}` |
| **Profile** (`/profile`)   | `GET /api/v1/users/me`, `PUT /api/v1/users/me`                                                               |

A `GET /api/v1/users/me` call on startup serves as the auth gate — a `401` response redirects to `/login`.

### Swagger / Postman

- Swagger UI: https://api.larevela.com/docs#/
- OpenAPI spec (saved locally): `docs/api-spec.json`
- For Postman: import `docs/api-spec.json` directly — Postman supports OpenAPI 3.1 import. Set the base URL to `https://api.larevela.com`.

---

## Part 2 – Blockchain Smart Contract

- **Library**: [viem](https://viem.sh) — TypeScript-first, tree-shakeable, no ethers.js dependency
- **Wallet**: MetaMask / any injected EIP-1193 provider
- **Chain**: Sepolia Testnet (chain ID `11155111`)
- **Token**: `LaRevelaToken` (LRT) — custom ERC-20 with `balanceOf` (read), `transfer` (write), `faucet` (mint 100 LRT)
- **Contract source**: `contracts/src/LaRevelaToken.sol`

### Deploy the contract

```bash
# 1. Configure secrets
cp contracts/.env.example contracts/.env
# Fill in SEPOLIA_RPC_URL (Alchemy/Infura) and DEPLOYER_PRIVATE_KEY

# 2. Deploy to Sepolia
cd contracts && npm run deploy:sepolia
# → prints: VITE_CONTRACT_ADDRESS=0x...

# 3. Paste the address into frontend/.env
cd ../frontend && cp .env.example .env
# Set VITE_CONTRACT_ADDRESS=0x<printed above>
```

### Run a local node (optional, for development without Sepolia)

```bash
# Terminal 1 — start local Hardhat node
cd contracts && npx hardhat node

# Terminal 2 — deploy to localhost
cd contracts && npm run deploy:local

# Then set in frontend/.env:
# VITE_CHAIN_ID=31337
# VITE_CONTRACT_ADDRESS=0x<local printed address>
```

### What the Blockchain page does

| Feature                       | Implementation                                  |
| ----------------------------- | ----------------------------------------------- |
| Connect / disconnect MetaMask | `useWallet` hook via `eth_requestAccounts`      |
| Display LRT balance (read)    | `balanceOf(address)` — view call, no gas        |
| Faucet — mint 100 LRT         | `faucet()` — state-changing tx, MetaMask sign   |
| Transfer LRT to any address   | `transfer(to, amount)` — state-changing tx      |
| Tx status feedback            | idle → pending → success/error + Etherscan link |

---

## Scripts

```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # TypeScript compile + Vite production build
npm run preview  # Serve production build locally
npm run lint     # ESLint
```

---

## Notes

See [`NOTES.md`](./NOTES.md) for design decisions and what I'd improve with more time.
