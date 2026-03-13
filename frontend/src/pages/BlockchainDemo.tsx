import { useState, type FormEvent } from "react";
import { useWallet } from "../hooks";
import { CHAIN_ID, CONTRACT_ADDRESS } from "../blockchain/config";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
};

export function BlockchainDemo() {
  const {
    address,
    balance,
    txStatus,
    txHash,
    error,
    connect,
    disconnect,
    transfer,
    faucet,
    isConnected,
  } = useWallet();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async (e: FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) return;
    const wei = BigInt(Math.floor(parseFloat(amount) * 1e18));
    await transfer(toAddress as `0x${string}`, wei);
  };

  const handleFaucet = () => faucet();

  const explorerBase =
    CHAIN_ID === 11155111
      ? "https://sepolia.etherscan.io/tx/"
      : "https://etherscan.io/tx/";

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Blockchain Demo</h1>

      {/* Network info */}
      <div style={styles.infoBar}>
        <span>
          <strong>Network:</strong>{" "}
          {CHAIN_NAMES[CHAIN_ID] ?? `Chain ${CHAIN_ID}`}
        </span>
        <span style={styles.dot}>·</span>
        <span>
          <strong>Contract:</strong>{" "}
          {CONTRACT_ADDRESS ? (
            `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-6)}`
          ) : (
            <span style={{ color: "#dc2626" }}>Not configured</span>
          )}
        </span>
      </div>

      {/* Wallet card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Wallet</h2>
        {!isConnected ? (
          <button
            id="connect-wallet-btn"
            style={styles.btnPrimary}
            onClick={connect}
          >
            Connect MetaMask
          </button>
        ) : (
          <>
            <div style={styles.walletRow}>
              <div>
                <p style={styles.label}>Address</p>
                <p style={styles.mono}>{address}</p>
              </div>
              <button onClick={disconnect} style={styles.btnGhost}>
                Disconnect
              </button>
            </div>
            <div style={styles.balanceBox}>
              <p style={styles.label}>LRT Balance</p>
              <p style={styles.balance}>
                {balance ?? "—"} <span style={styles.ticker}>LRT</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Faucet */}
      {isConnected && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Faucet</h2>
          <p style={styles.hint}>Mint 100 LRT to your wallet (testnet only).</p>
          <button
            id="faucet-btn"
            style={{
              ...styles.btnPrimary,
              opacity: txStatus === "pending" ? 0.6 : 1,
            }}
            onClick={handleFaucet}
            disabled={txStatus === "pending"}
          >
            {txStatus === "pending" ? "Waiting for tx…" : "Get 100 LRT"}
          </button>
        </div>
      )}

      {/* Transfer */}
      {isConnected && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Transfer LRT</h2>
          <form onSubmit={handleTransfer} style={styles.form}>
            <label style={styles.inputLabel}>
              Recipient address
              <input
                id="transfer-to"
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                required
                style={styles.input}
              />
            </label>
            <label style={styles.inputLabel}>
              Amount (LRT)
              <input
                id="transfer-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                min="0"
                step="any"
                required
                style={styles.input}
              />
            </label>
            <button
              id="transfer-btn"
              type="submit"
              disabled={txStatus === "pending" || !toAddress || !amount}
              style={{
                ...styles.btnPrimary,
                opacity: txStatus === "pending" ? 0.6 : 1,
              }}
            >
              {txStatus === "pending" ? "Waiting for tx…" : "Send"}
            </button>
          </form>
        </div>
      )}

      {/* Status */}
      {error && <div style={styles.errorBox}>{error}</div>}
      {txStatus === "success" && txHash && (
        <div style={styles.successBox}>
          ✓ Transaction confirmed!{" "}
          <a
            href={`${explorerBase}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            View on Etherscan ↗
          </a>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "2rem", maxWidth: "640px", margin: "0 auto" },
  h1: {
    margin: "0 0 1.25rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  infoBar: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.825rem",
    color: "#475569",
    marginBottom: "1.25rem",
  },
  dot: { color: "#cbd5e1" },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  cardTitle: {
    margin: "0 0 1rem",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#374151",
  },
  walletRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  label: {
    margin: "0 0 0.25rem",
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  mono: {
    margin: 0,
    fontFamily: "monospace",
    fontSize: "0.8rem",
    color: "#0f172a",
    wordBreak: "break-all",
  },
  balanceBox: {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    background: "#f0f9ff",
    borderRadius: "8px",
  },
  balance: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0369a1",
  },
  ticker: { fontSize: "1rem", fontWeight: 500, color: "#64748b" },
  hint: { margin: "0 0 0.875rem", color: "#64748b", fontSize: "0.875rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.875rem" },
  inputLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  btnPrimary: {
    padding: "0.6rem 1.25rem",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnGhost: {
    padding: "0.45rem 0.875rem",
    background: "#f1f5f9",
    color: "#374151",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
    flexShrink: 0,
  },
  errorBox: {
    padding: "0.875rem 1rem",
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
  successBox: {
    padding: "0.875rem 1rem",
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
  link: { color: "#15803d", fontWeight: 600 },
};
