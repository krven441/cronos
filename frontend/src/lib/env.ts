export const VAULT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS ?? "";
export const TOKEN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS ?? "";
export const STELLAR_NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org:443";
export const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "testnet"
    ? "Test SDF Network ; September 2015"
    : "Public Global Stellar Network ; September 2015";
export const STELLAR_EXPERT_BASE = `https://stellar.expert/explorer/${STELLAR_NETWORK}`;

export function assertContractsConfigured(): void {
  if (!VAULT_CONTRACT_ADDRESS || !TOKEN_CONTRACT_ADDRESS) {
    throw new Error(
      "Contract addresses are not configured. Set NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS and " +
        "NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS in frontend/.env.local, then restart `npm run dev` " +
        "(Next.js only reads NEXT_PUBLIC_* env vars at server start, not on hot reload)."
    );
  }
}
