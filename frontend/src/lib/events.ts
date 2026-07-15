"use client";

import { SorobanRpc, scValToNative } from "@stellar/stellar-sdk";
import { STELLAR_RPC_URL, VAULT_CONTRACT_ADDRESS } from "./env";

export interface VaultEvent {
  id: string;
  type: "deposit" | "withdraw";
  txHash: string;
  ledgerCloseTime: string;
  lockId: bigint;
  amount: bigint;
}

export async function fetchVaultEvents(startLedger?: number): Promise<VaultEvent[]> {
  const rpc = new SorobanRpc.Server(STELLAR_RPC_URL);
  const latest = await rpc.getLatestLedger();
  const from = startLedger ?? Math.max(1, latest.sequence - 10_000);

  const res = await rpc.getEvents({
    startLedger: from,
    filters: [
      {
        type: "contract",
        contractIds: [VAULT_CONTRACT_ADDRESS],
      },
    ],
    limit: 100,
  });

  const events: VaultEvent[] = [];
  for (const e of res.events) {
    const topics = e.topic.map((t) => scValToNative(t));
    const kind = topics[1];
    if (kind !== "deposit" && kind !== "withdraw") continue;
    const data = scValToNative(e.value) as unknown[];
    const lockId = BigInt(data[0] as string | number | bigint);
    const amount = BigInt(
      (kind === "deposit" ? data[3] : data[2]) as string | number | bigint
    );
    events.push({
      id: e.id,
      type: kind,
      txHash: e.txHash,
      ledgerCloseTime: e.ledgerClosedAt,
      lockId,
      amount,
    });
  }

  return events.sort(
    (a, b) =>
      new Date(b.ledgerCloseTime).getTime() -
      new Date(a.ledgerCloseTime).getTime()
  );
}
