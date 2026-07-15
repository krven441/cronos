import { describe, expect, it, vi } from "vitest";

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: class {},
  WalletNetwork: { TESTNET: "TESTNET", PUBLIC: "PUBLIC" },
  allowAllModules: () => [],
  FREIGHTER_ID: "freighter",
}));

const { isWalletExtensionLikelyMissing, isUserRejection } = await import(
  "../wallet"
);

describe("isWalletExtensionLikelyMissing", () => {
  it("matches common 'no extension' wallet errors", () => {
    expect(isWalletExtensionLikelyMissing(new Error("Freighter is not installed"))).toBe(true);
    expect(isWalletExtensionLikelyMissing(new Error("wallet not detected"))).toBe(true);
    expect(isWalletExtensionLikelyMissing("no wallet found in browser")).toBe(true);
    expect(isWalletExtensionLikelyMissing(new Error("extension unavailable"))).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isWalletExtensionLikelyMissing(new Error("insufficient balance"))).toBe(false);
    expect(isWalletExtensionLikelyMissing(new Error("still locked"))).toBe(false);
  });
});

describe("isUserRejection", () => {
  it("matches common signature-rejection error phrasing", () => {
    expect(isUserRejection(new Error("User rejected the request"))).toBe(true);
    expect(isUserRejection(new Error("Transaction declined"))).toBe(true);
    expect(isUserRejection(new Error("Request denied by user"))).toBe(true);
    expect(isUserRejection("user cancelled")).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isUserRejection(new Error("network timeout"))).toBe(false);
    expect(isUserRejection(new Error("still locked"))).toBe(false);
  });

  it("handles non-Error thrown values", () => {
    expect(isUserRejection("declined by user")).toBe(true);
    expect(isUserRejection({ weird: "object" })).toBe(false);
  });
});
