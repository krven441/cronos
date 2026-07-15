"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import Button from "./Button";
import { deposit } from "@/lib/contract";
import { xlmToStroops, stroopsToXlm } from "@/lib/balance";
import { isUserRejection } from "@/lib/wallet";
import { STELLAR_EXPERT_BASE, TOKEN_CONTRACT_ADDRESS } from "@/lib/env";

type Status = "idle" | "pending" | "success" | "error";

export default function CreateLockForm({
  publicKey,
  balanceStroops,
  onSuccess,
}: {
  publicKey: string;
  balanceStroops: bigint;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("100");
  const [unlockLocal, setUnlockLocal] = useState("");
  const [recipient, setRecipient] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [insufficientShake, setInsufficientShake] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const amountStroops = xlmToStroops(amountNum);
  const feeHeadroom = xlmToStroops(1); // 1 XLM buffer for fees
  const insufficientBalance =
    amountStroops > 0 && amountStroops + feeHeadroom > balanceStroops;

  const unlockDate = unlockLocal ? new Date(unlockLocal) : null;
  const unlockValid = !!unlockDate && unlockDate.getTime() > Date.now();

  const summary =
    amountNum > 0 && unlockDate
      ? `Lock ${amountNum} XLM until ${unlockDate.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}`
      : "Enter amount and unlock time";

  async function submit() {
    setErrorMsg("");
    if (insufficientBalance) {
      setInsufficientShake(true);
      setTimeout(() => setInsufficientShake(false), 500);
      return;
    }
    if (amountStroops <= 0n || !unlockValid) return;

    setStatus("pending");
    try {
      const unlockAtSeconds = BigInt(Math.floor(unlockDate!.getTime() / 1000));
      const recipientAddr = recipient.trim() || publicKey;
      const { hash } = await deposit({
        owner: publicKey,
        recipient: recipientAddr,
        token: TOKEN_CONTRACT_ADDRESS,
        amountStroops,
        unlockAt: unlockAtSeconds,
        label: label.trim() || "Vault lock",
      });
      setTxHash(hash);
      setStatus("success");
      onSuccess();
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        isUserRejection(err)
          ? "Transaction declined in wallet."
          : err instanceof Error
            ? err.message
            : "Deposit failed."
      );
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-medium text-silver">Lock funds</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-silver/50">
            Amount (XLM)
          </label>
          <motion.input
            animate={insufficientShake ? { x: [0, -6, 6, -6, 6, 0] } : {}}
            type="number"
            min="0"
            step="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg2 px-3 py-2 text-silver outline-none focus:border-gold/50"
          />
          <div className="mt-1 text-xs text-silver/40">
            Balance: {stroopsToXlm(balanceStroops).toFixed(2)} XLM
          </div>
          {insufficientBalance && (
            <div className="mt-1 text-xs text-danger">
              Insufficient balance for this amount plus fees.
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-silver/50">
            Unlock date &amp; time
          </label>
          <input
            type="datetime-local"
            value={unlockLocal}
            onChange={(e) => setUnlockLocal(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg2 px-3 py-2 text-silver outline-none focus:border-gold/50"
          />
          {unlockLocal && !unlockValid && (
            <div className="mt-1 text-xs text-danger">
              Unlock time must be in the future.
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-silver/50">
            Recipient (optional, defaults to you)
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={publicKey}
            className="w-full rounded-lg border border-white/10 bg-bg2 px-3 py-2 text-silver outline-none focus:border-gold/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-silver/50">
            Label (optional)
          </label>
          <input
            type="text"
            maxLength={64}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Rent — August"
            className="w-full rounded-lg border border-white/10 bg-bg2 px-3 py-2 text-silver outline-none focus:border-gold/50"
          />
        </div>

        <div className="text-sm text-gold/90">{summary}</div>

        <Button
          status={status === "pending" ? "loading" : status === "error" ? "error" : status === "success" ? "success" : "idle"}
          disabled={amountStroops <= 0n || !unlockValid}
          onClick={submit}
        >
          Lock Vault
        </Button>

        {status === "error" && (
          <div className="text-sm text-danger">{errorMsg}</div>
        )}

        {status === "success" && txHash && (
          <div className="text-sm text-success">
            Vault Locked Successfully —{" "}
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
      </div>
    </Card>
  );
}
