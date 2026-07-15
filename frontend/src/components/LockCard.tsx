"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import Button from "./Button";
import Countdown from "./Countdown";
import { withdraw } from "@/lib/contract";
import { stroopsToXlm } from "@/lib/balance";
import { isUserRejection } from "@/lib/wallet";
import { STELLAR_EXPERT_BASE } from "@/lib/env";
import type { Lock } from "@/lib/contract";

type Status = "idle" | "pending" | "success" | "error";

export default function LockCard({
  id,
  lock,
  publicKey,
  onWithdrawn,
}: {
  id: bigint;
  lock: Lock;
  publicKey: string;
  onWithdrawn: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState(false);

  const unlockAtSec = Number(lock.unlock_at);
  const nowSec = Math.floor(Date.now() / 1000);
  const unlocked = lock.status === "Locked" && nowSec >= unlockAtSec;
  const withdrawn = lock.status === "Withdrawn";

  async function doWithdraw() {
    if (!unlocked) {
      setTooltip(true);
      setTimeout(() => setTooltip(false), 2000);
      return;
    }
    setStatus("pending");
    setErrorMsg("");
    try {
      const { hash } = await withdraw(id, publicKey);
      setTxHash(hash);
      setStatus("success");
      onWithdrawn();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        isUserRejection(err)
          ? "Transaction declined in wallet."
          : err instanceof Error
            ? err.message
            : "Withdraw failed."
      );
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-sm text-silver/50">{lock.label}</div>
          <div className="text-2xl font-semibold text-gold">
            {stroopsToXlm(lock.amount).toFixed(2)} XLM
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            withdrawn
              ? "bg-white/5 text-silver/50"
              : unlocked
                ? "bg-success/10 text-success"
                : "bg-gold/10 text-gold"
          }`}
        >
          {withdrawn ? "Withdrawn" : unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>

      {!withdrawn && (
        <div className="mb-4">
          <Countdown unlockAt={unlockAtSec} />
        </div>
      )}

      {!withdrawn && (
        <div className="relative">
          <Button
            status={status === "pending" ? "loading" : status === "error" ? "error" : status === "success" ? "success" : "idle"}
            onClick={doWithdraw}
            className={!unlocked ? "opacity-60" : ""}
          >
            {unlocked ? "Withdraw" : "Sealed"}
          </Button>
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-full mt-2 rounded-lg bg-bg2 px-3 py-1.5 text-xs text-silver shadow-lg"
              >
                Still locked — vault opens when the countdown reaches zero.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {status === "error" && (
        <div className="mt-2 text-sm text-danger">{errorMsg}</div>
      )}

      {status === "success" && txHash && (
        <div className="mt-2 text-sm text-success">
          Funds released —{" "}
          <a
            href={`${STELLAR_EXPERT_BASE}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            view transaction
          </a>
        </div>
      )}
    </Card>
  );
}
