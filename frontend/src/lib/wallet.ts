"use client";

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";
import { STELLAR_NETWORK } from "./env";

let kit: StellarWalletsKit | null = null;

export function getWalletKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network:
        STELLAR_NETWORK === "testnet"
          ? WalletNetwork.TESTNET
          : WalletNetwork.PUBLIC,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }
  return kit;
}

export function isWalletExtensionLikelyMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /not installed|not detected|no wallet|extension/i.test(message);
}

export function isUserRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /reject|declin|denied|cancel/i.test(message);
}
