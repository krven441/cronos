"use client";

import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { fetchVaultEvents } from "@/lib/events";
import { stroopsToXlm } from "@/lib/balance";
import { STELLAR_EXPERT_BASE } from "@/lib/env";
import Card from "./Card";

export default function ActivityTimeline() {
  const { data: events } = useSWR("vault-events", () => fetchVaultEvents(), {
    refreshInterval: 5000,
  });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-medium text-silver">Activity</h2>
      {!events && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      )}
      {events && events.length === 0 && (
        <div className="text-sm text-silver/40">
          No on-chain activity yet.
        </div>
      )}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {events?.map((e, i) => (
            <motion.a
              key={e.id}
              href={`${STELLAR_EXPERT_BASE}/tx/${e.txHash}`}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                boxShadow:
                  i === 0
                    ? [
                        "0 0 0px rgba(230,193,106,0)",
                        "0 0 16px rgba(230,193,106,0.4)",
                        "0 0 0px rgba(230,193,106,0)",
                      ]
                    : "none",
              }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm hover:border-gold/30"
            >
              <span className="text-silver">
                {e.type === "deposit" ? "● Deposit Created" : "● Withdrawn"}{" "}
                <span className="text-silver/40">#{e.lockId.toString()}</span>
              </span>
              <span className="text-gold">
                {stroopsToXlm(e.amount).toFixed(2)} XLM
              </span>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}
