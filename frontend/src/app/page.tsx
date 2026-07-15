"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import VaultHero from "@/components/vault-3d/VaultHero";
import WalletButton from "@/components/WalletButton";
import WalletMissingBanner from "@/components/WalletMissingBanner";
import CreateLockForm from "@/components/CreateLockForm";
import LockCard from "@/components/LockCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import EmptyVault from "@/components/EmptyVault";
import Card from "@/components/Card";
import { getLocksFor, getLock } from "@/lib/contract";
import { getXlmBalance } from "@/lib/balance";

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletMissing, setWalletMissing] = useState(false);

  const { data: balance, mutate: refreshBalance } = useSWR(
    publicKey ? ["balance", publicKey] : null,
    () => getXlmBalance(publicKey!),
    { refreshInterval: 5000 }
  );

  const { data: lockIds, mutate: refreshLocks } = useSWR(
    publicKey ? ["locks", publicKey] : null,
    () => getLocksFor(publicKey!),
    { refreshInterval: 5000 }
  );

  const { data: locks } = useSWR(
    lockIds ? ["lock-details", lockIds.join(",")] : null,
    async () => {
      const entries = await Promise.all(
        lockIds!.map(async (id) => [id, await getLock(id)] as const)
      );
      return entries;
    },
    { refreshInterval: 5000 }
  );

  const refreshAll = useCallback(() => {
    refreshBalance();
    refreshLocks();
  }, [refreshBalance, refreshLocks]);

  const activeLock = locks?.find(([, l]) => l.status === "Locked");
  const progress = activeLock
    ? Math.min(
        1,
        (Date.now() / 1000 - Number(activeLock[1].created_at)) /
          (Number(activeLock[1].unlock_at) - Number(activeLock[1].created_at))
      )
    : 0;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-tight text-gold sm:text-3xl">
          Chronos
        </h1>
        <WalletButton
          publicKey={publicKey}
          onConnected={(pk) => {
            setPublicKey(pk);
            setWalletMissing(false);
          }}
          onDisconnected={() => setPublicKey(null)}
          onWalletMissing={() => setWalletMissing(true)}
        />
      </header>

      {walletMissing && <WalletMissingBanner />}

      <VaultHero progress={progress} />

      {!publicKey ? (
        <p className="mt-8 text-center text-sm text-silver/50">
          Connect a wallet to lock funds and view your vaults.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CreateLockForm
              publicKey={publicKey}
              balanceStroops={balance ?? 0n}
              onSuccess={refreshAll}
            />
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="mb-4 text-lg font-medium text-silver">
                Your locks
              </h2>
              {!locks && (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-lg bg-white/5"
                    />
                  ))}
                </div>
              )}
              {locks && locks.length === 0 && <EmptyVault />}
              <div className="flex flex-col gap-4">
                {locks?.map(([id, lock]) => (
                  <LockCard
                    key={id.toString()}
                    id={id}
                    lock={lock}
                    publicKey={publicKey}
                    onWithdrawn={refreshAll}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <ActivityTimeline />
          </div>
        </div>
      )}
    </main>
  );
}
