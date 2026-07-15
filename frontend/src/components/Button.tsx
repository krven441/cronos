"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
  > {
  children: ReactNode;
  status?: Status;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  status = "idle",
  variant = "primary",
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "bg-gradient-to-b from-gold to-[#c9a24f] text-bg0"
      : "border border-white/15 bg-white/5 text-silver";

  return (
    <motion.button
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      animate={
        status === "error"
          ? { x: [0, -6, 6, -6, 6, 0] }
          : status === "success"
            ? { boxShadow: "0 0 0 4px rgba(92,229,143,0.3)" }
            : {}
      }
      transition={{ duration: 0.4 }}
      disabled={disabled || status === "loading"}
      className={`relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${base} ${className}`}
      {...rest}
    >
      {status === "loading" ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Processing...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
