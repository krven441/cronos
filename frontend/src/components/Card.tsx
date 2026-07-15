"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent bg-bg1 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </motion.div>
  );
}
