"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { getWalletKit, isWalletExtensionLikelyMissing } from "@/lib/wallet";

interface WalletButtonProps {
  onConnected: (publicKey: string) => void;
  onDisconnected: () => void;
  publicKey: string | null;
  onWalletMissing: () => void;
}

export default function WalletButton({
  onConnected,
  onDisconnected,
  publicKey,
  onWalletMissing,
}: WalletButtonProps) {
  const [busy, setBusy] = useState(false);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const kit = getWalletKit();
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          onConnected(address);
        },
      });
    } catch (err) {
      if (isWalletExtensionLikelyMissing(err)) {
        onWalletMissing();
      }
    } finally {
      setBusy(false);
    }
  }, [onConnected, onWalletMissing]);

  const disconnect = useCallback(async () => {
    try {
      const kit = getWalletKit();
      await kit.disconnect();
    } finally {
      onDisconnected();
    }
  }, [onDisconnected]);

  const short = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : null;

  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(230,193,106,0.25)" }}
      whileTap={{ scale: 0.96 }}
      disabled={busy}
      onClick={publicKey ? disconnect : connect}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-b from-[#1c1c20] to-[#111114] px-5 py-2.5 text-sm font-medium text-silver shadow-lg transition-colors hover:border-gold/40"
    >
      <motion.span
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Wallet size={16} className="text-gold" />
      </motion.span>
      {busy ? "Connecting..." : short ?? "Connect Wallet"}
    </motion.button>
  );
}
