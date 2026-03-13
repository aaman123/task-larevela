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
| `VITE_CHAIN_ID`         | EVM chain ID (`1` = mainnet, `11155111` = Sepolia)          | `1`                        |
| `VITE_CONTRACT_ADDRESS` | Deployed contract address (`0x…`)                           | placeholder                |

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

> **Pending**: contract ABI and address not yet provided. The existing `BlockchainDemo` page scaffolds wallet connect/disconnect, a contract read (`balanceOf`), and a write (`transfer`) with tx-status feedback. Update `src/blockchain/contract.ts` with your real ABI and `.env` with `VITE_CONTRACT_ADDRESS` / `VITE_CHAIN_ID` when ready.

- Library: **viem** (lightweight, tree-shakeable, TypeScript-first)
- Wallet: MetaMask / any injected EIP-1193 provider
- Supported chains: `1` (mainnet), `11155111` (Sepolia) — see `src/blockchain/config.ts`

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
