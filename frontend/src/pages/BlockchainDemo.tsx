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
    <div className="fade-in">
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
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={styles.cardTitle}>Wallet</h2>
        {!isConnected ? (
          <button
            id="connect-wallet-btn"
            style={{ background: "#f5841f", color: "#fff" }} // MetaMask Orange
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
              <button
                onClick={disconnect}
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
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
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <h2 style={styles.cardTitle}>Faucet</h2>
          <p style={styles.hint}>Mint 100 LRT to your wallet (testnet only).</p>
          <button
            id="faucet-btn"
            style={{
              background: "var(--brand-gradient)",
              color: "#fff",
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
        <div className="card">
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
              />
            </label>
            <button
              id="transfer-btn"
              type="submit"
              disabled={txStatus === "pending" || !toAddress || !amount}
              style={{
                background: "#3b82f6",
                color: "#fff",
                opacity: txStatus === "pending" ? 0.6 : 1,
                marginTop: "0.5rem",
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
            View on Block Explorer ↗
          </a>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: {
    margin: "0 0 1.5rem",
    fontSize: "1.8rem",
    color: "var(--text-main)",
  },
  infoBar: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    background: "#fff",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    marginBottom: "2rem",
    boxShadow: "var(--shadow-sm)",
  },
  dot: { color: "#cbd5e1" },
  cardTitle: {
    margin: "0 0 1.25rem",
    fontSize: "1.15rem",
    color: "var(--text-main)",
  },
  walletRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  label: {
    margin: "0 0 0.35rem",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
  },
  mono: {
    margin: 0,
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: "var(--text-main)",
    wordBreak: "break-all",
    background: "#f1f5f9",
    padding: "0.2rem 0.5rem",
    borderRadius: "6px",
  },
  balanceBox: {
    marginTop: "1.5rem",
    padding: "1rem 1.25rem",
    background: "linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
  },
  balance: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0369a1",
  },
  ticker: { fontSize: "1.1rem", fontWeight: 600, color: "#0ea5e9" },
  hint: { margin: "0 0 1rem", color: "var(--text-muted)", fontSize: "0.9rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  inputLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "var(--text-main)",
  },
  errorBox: {
    padding: "1rem 1.25rem",
    background: "var(--error-bg)",
    color: "var(--error-text)",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginTop: "1rem",
    fontWeight: 500,
  },
  successBox: {
    padding: "1rem 1.25rem",
    background: "var(--success-bg)",
    color: "var(--success-text)",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginTop: "1rem",
    fontWeight: 500,
  },
  link: {
    color: "var(--success-text)",
    fontWeight: 600,
    textDecoration: "underline",
  },
};
