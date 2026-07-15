"use client";

import { motion } from "framer-motion";

export default function WalletMissingBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mb-6 flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path
          d="M8 24h10l4-8 4 16 4-8h10"
          stroke="#FF6A6A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="24" r="3" stroke="#FF6A6A" strokeWidth="2" />
        <circle cx="36" cy="24" r="3" stroke="#FF6A6A" strokeWidth="2" />
      </svg>
      <p className="text-sm text-silver">
        No Stellar wallet extension detected. Install Freighter or another
        supported wallet to connect.
      </p>
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-gold underline"
      >
        Install Freighter
      </a>
    </motion.div>
  );
}
