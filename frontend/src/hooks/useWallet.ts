import { useState, useCallback, useEffect } from "react";
import { createWalletClient, custom, formatUnits, type Address } from "viem";
import { mainnet, sepolia } from "viem/chains";
import {
  CHAIN_ID,
  readBalance,
  writeTransfer,
  writeFaucet,
} from "../blockchain";

const chain = CHAIN_ID === 11155111 ? sepolia : mainnet;

export type TxStatus = "idle" | "pending" | "success" | "error";

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [rawBalance, setRawBalance] = useState<bigint | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // LRT balance formatted with 18 decimals
  const balance = rawBalance !== null ? formatUnits(rawBalance, 18) : null;

  const getWalletClient = useCallback(() => {
    const provider =
      typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) return null;
    return createWalletClient({ chain, transport: custom(provider) });
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const provider = window.ethereum;
      if (!provider) {
        setError("No wallet found. Install MetaMask.");
        return;
      }
      const [acc] = (await provider.request({
        method: "eth_requestAccounts",
      })) as Address[];
      if (!acc) return;
      setAddress(acc);
      const bal = await readBalance(acc);
      setRawBalance(bal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setRawBalance(null);
    setError(null);
    setTxStatus("idle");
    setTxHash(null);
  }, []);

  const transfer = useCallback(
    async (to: Address, amount: bigint) => {
      if (!address) {
        setError("Connect wallet first");
        return;
      }
      const walletClient = getWalletClient();
      if (!walletClient) {
        setError("Wallet not available");
        return;
      }
      setTxStatus("pending");
      setError(null);
      setTxHash(null);
      try {
        const hash = await writeTransfer(walletClient, address, to, amount);
        setTxHash(hash);
        setTxStatus("success");
        setRawBalance(await readBalance(address));
        return hash;
      } catch (e) {
        setTxStatus("error");
        setError(e instanceof Error ? e.message : "Transaction failed");
      }
    },
    [address, getWalletClient],
  );

  const faucet = useCallback(async () => {
    if (!address) {
      setError("Connect wallet first");
      return;
    }
    const walletClient = getWalletClient();
    if (!walletClient) {
      setError("Wallet not available");
      return;
    }
    setTxStatus("pending");
    setError(null);
    setTxHash(null);
    try {
      const hash = await writeFaucet(walletClient, address);
      setTxHash(hash);
      setTxStatus("success");
      setRawBalance(await readBalance(address));
      return hash;
    } catch (e) {
      setTxStatus("error");
      setError(e instanceof Error ? e.message : "Faucet failed");
    }
  }, [address, getWalletClient]);

  // Refresh balance whenever address changes
  useEffect(() => {
    if (!address) return;
    readBalance(address).then(setRawBalance);
  }, [address]);

  // Track MetaMask account switches
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts: unknown) => {
      const acc = (accounts as Address[])?.[0];
      setAddress(acc ?? null);
      if (!acc) setRawBalance(null);
    };
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    return () =>
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  return {
    address,
    balance, // formatted LRT string e.g. "100.0"
    rawBalance, // raw bigint
    txStatus,
    txHash,
    error,
    connect,
    disconnect,
    transfer,
    faucet,
    isConnected: !!address,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<unknown>;
      on?: (event: string, cb: (args: unknown) => void) => void;
      removeListener?: (event: string, cb: (args: unknown) => void) => void;
    };
  }
}
