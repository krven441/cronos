"use client";

import { motion } from "framer-motion";

export default function EmptyVault() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center gap-3 py-10 text-center"
    >
      <div className="h-16 w-16 rounded-full border border-dashed border-gold/30" />
      <p className="text-sm text-silver/50">
        Your vault is empty. Lock funds securely until a chosen date.
      </p>
    </motion.div>
  );
}
