# Pull Request: LaRevela Frontend API & Blockchain Integration

## 🎯 Overview
This PR completes the full technical test for LaRevela. It successfully implements a React 19 frontend that integrates both the LaRevela REST API (Auth, Profiles, and Websites CRUD) and a custom Web3 flow with a local/testnet smart contract. 

All explicit requirements from `TASK.md` have been met, including strict TypeScript coverage, native `fetch`-based API calls, session cookies integration, and full wallet interaction using `viem`.

## 🛠 Features Implemented

### 1. API Integration (`/frontend`)
*   **Fully typed API client:** Hand-wrote `src/types/api.ts` derived from the OpenAPI spec, eliminating reliance on bulky libraries or generated code.
*   **Native Fetch wrapper:** Added `src/api/client.ts` to handle standardized `fetch` calls, JSON mapping, and custom `ApiError` resolution over session cookies (`credentials: "include"`).
*   **Custom React Hooks:** Built `useAuth` (login/logout/profile sync) and `useApi` (for websites CRUD) heavily typed with `react-query` to manage server state efficiently.
*   **Pages:**
    *   `/login`: Secure auth entry point using the `POST /api/v1/auth/login` endpoint.
    *   `/websites`: Full CRUD dashboard allowing users to list, create, edit, and delete websites.
    *   `/profile`: Real-time rendering and updating using `GET/PUT /api/v1/users/me`.
*   **Auth Guarded Routing:** Protects all dashboard routes, kicking unauthenticated users to `/login`.

### 2. Blockchain Smart Contract Integration (`/contracts` & `/frontend`)
*   **LaRevelaToken (LRT):** Created a zero-dependency, standard `ERC-20` like token inside `LaRevelaToken.sol` specifically for this test. Features `transfer`, `balanceOf`, `approve`, `transferFrom`, and a `faucet` to mint test LRT tokens.
*   **Hardhat Configuration:** Configured `hardhat.config.ts`, `deploy.ts` scripts, and fully passing Test suites (`LaRevelaToken.test.ts`). 
*   **Viem Client:** Connected the frontend via `src/blockchain/contract.ts` supplying the generated Contract ABI.
*   **BlockchainDemo UI:** Built a highly polished UI component to demo Web3 flows:
    *   Connect/Disconnect MetaMask.
    *   Displays current network (Hardhat Local / Sepolia) and contract addresses.
    *   Read capability: Fetches the raw `bigint` balance and converts it via `18` decimals (`balanceOf`).
    *   Write capabilities: Initiates signed transactions for `faucet()` (minting 100 LRT) and `transfer()` allowing users to send test tokens. Implements pending UI and Etherscan linking on success.

## 🧹 Housekeeping & Developer Experience
*   **Documentation:** `README.md` is fully documented mapping out how to spin up the React App, API links, Postman instructions, and two clear deployment tracks (Sepolia and Hardhat Local Node) for the smart contract.
*   **Architecture Notes:** Included `NOTES.md` documenting design tradeoffs like using Fetch vs Axios and `viem` vs `ethers`.
*   **Security:** Ensured `.env`, private keys, and Hardhat build `artifacts/`/`typechain-types/` are isolated and `.gitignore`d correctly.

## ✅ Verification
- [x] Tested all endpoints via Postman.
- [x] Zero TypeScript errors (`npm run build` succeeds seamlessly).
- [x] All 5 Hardhat Smart Contract tests pass.
- [x] Full E2E flows (Login -> View Websites -> Check Blockchain Wallet -> Issue Faucet -> Send Transfer) manually tested in browser.
