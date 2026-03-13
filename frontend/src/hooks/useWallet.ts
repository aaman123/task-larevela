import { useState, useCallback, useEffect } from "react";
import { createWalletClient, custom, type Address } from "viem";
import { mainnet } from "viem/chains";
import { CHAIN_ID, readBalance, writeTransfer } from "../blockchain";

const chain = CHAIN_ID === 1 ? mainnet : mainnet;

export type TxStatus = "idle" | "pending" | "success" | "error";

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const getWalletClient = useCallback(() => {
    const provider =
      typeof window !== "undefined" ? window.ethereum : undefined;
    if (!provider) return null;
    return createWalletClient({
      chain,
      transport: custom(provider),
    });
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const provider = window.ethereum;
      if (!provider) {
        setError("No wallet found. Install MetaMask or another Web3 wallet.");
        return;
      }
      const [acc] = (await provider.request({
        method: "eth_requestAccounts",
      })) as Address[];
      if (!acc) return;
      setAddress(acc);
      const bal = await readBalance(acc);
      setBalance(bal);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setError(null);
    setTxStatus("idle");
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
      try {
        const hash = await writeTransfer(walletClient, address, to, amount);
        setTxStatus("success");
        const newBalance = await readBalance(address);
        setBalance(newBalance);
        return hash;
      } catch (e) {
        setTxStatus("error");
        setError(e instanceof Error ? e.message : "Transaction failed");
      }
    },
    [address, getWalletClient],
  );

  useEffect(() => {
    if (!address) return;
    readBalance(address).then(setBalance);
  }, [address]);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts: unknown) => {
      const acc = (accounts as Address[])?.[0];
      setAddress(acc ?? null);
      if (!acc) setBalance(null);
    };
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    return () =>
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
  }, []);

  return {
    address,
    balance,
    txStatus,
    error,
    connect,
    disconnect,
    transfer,
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
