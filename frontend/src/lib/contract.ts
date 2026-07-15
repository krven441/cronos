"use client";

import {
  Account,
  Address,
  Contract,
  nativeToScVal,
  scValToNative,
  rpc as RpcApi,
  TransactionBuilder,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import {
  VAULT_CONTRACT_ADDRESS,
  STELLAR_RPC_URL,
  NETWORK_PASSPHRASE,
  STELLAR_NETWORK,
  assertContractsConfigured,
} from "./env";
import { getWalletKit } from "./wallet";

export type LockStatus = "Locked" | "Withdrawn";

export interface Lock {
  owner: string;
  recipient: string;
  token: string;
  amount: bigint;
  created_at: bigint;
  unlock_at: bigint;
  status: LockStatus;
  label: string;
}

function server() {
  return new RpcApi.Server(STELLAR_RPC_URL);
}

function parseLock(val: xdr.ScVal): Lock {
  const obj = scValToNative(val) as Record<string, unknown>;
  const statusRaw = obj.status;
  const status = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw;
  return {
    owner: String(obj.owner),
    recipient: String(obj.recipient),
    token: String(obj.token),
    amount: BigInt(obj.amount as string | number | bigint),
    created_at: BigInt(obj.created_at as string | number | bigint),
    unlock_at: BigInt(obj.unlock_at as string | number | bigint),
    status: status as LockStatus,
    label: String(obj.label ?? ""),
  };
}

async function simulateRead<T>(
  method: string,
  args: xdr.ScVal[],
  parse: (v: xdr.ScVal) => T
): Promise<T> {
  assertContractsConfigured();
  const rpc = server();
  const contract = new Contract(VAULT_CONTRACT_ADDRESS);
  // Valid, unfunded, checksummed keypair used only as a simulation source —
  // read-only calls don't need a real or funded account.
  const DUMMY_ACCOUNT =
    "GCSX3V6YFARVTIBGUW5IT5DPP4D3INET5MCZBR3F3UYTBUBK4T653UL7";
  const account = await rpc.getAccount(DUMMY_ACCOUNT).catch(() => null);
  const source = account ?? new Account(DUMMY_ACCOUNT, "0");
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await rpc.simulateTransaction(tx);
  if (RpcApi.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  const retval = (sim as RpcApi.Api.SimulateTransactionSuccessResponse)
    .result?.retval;
  if (!retval) throw new Error("no simulation result");
  return parse(retval);
}

export async function getLock(id: bigint): Promise<Lock> {
  return simulateRead(
    "get_lock",
    [nativeToScVal(id, { type: "u64" })],
    parseLock
  );
}

export async function getLocksFor(who: string): Promise<bigint[]> {
  return simulateRead(
    "get_locks_for",
    [new Address(who).toScVal()],
    (v) => (scValToNative(v) as (string | number | bigint)[]).map(BigInt)
  );
}

export async function timeRemaining(id: bigint): Promise<bigint> {
  return simulateRead(
    "time_remaining",
    [nativeToScVal(id, { type: "u64" })],
    (v) => BigInt(scValToNative(v) as string | number | bigint)
  );
}

async function submitInvoke(
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string
): Promise<{ hash: string }> {
  assertContractsConfigured();
  const rpc = server();
  const contract = new Contract(VAULT_CONTRACT_ADDRESS);
  const account = await rpc.getAccount(sourcePublicKey);
  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (RpcApi.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  tx = RpcApi.assembleTransaction(tx, sim).build();

  const kit = getWalletKit();
  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourcePublicKey,
  });

  if (!signedTxXdr) {
    throw new Error("Wallet returned an empty signed transaction.");
  }

  let signedTx: ReturnType<typeof TransactionBuilder.fromXDR>;
  try {
    signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  } catch (err) {
    throw new Error(
      `Wallet returned a transaction the SDK could not decode (${
        err instanceof Error ? err.message : String(err)
      }). Confirm your wallet is set to the ${STELLAR_NETWORK} network and try again.`
    );
  }
  const sendResult = await rpc.sendTransaction(signedTx);
  if (sendResult.status === "ERROR") {
    throw new Error("transaction submission failed");
  }

  let getResult = await rpc.getTransaction(sendResult.hash);
  const start = Date.now();
  while (getResult.status === "NOT_FOUND" && Date.now() - start < 30_000) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await rpc.getTransaction(sendResult.hash);
  }
  if (getResult.status !== "SUCCESS") {
    throw new Error(`transaction failed: ${getResult.status}`);
  }

  return { hash: sendResult.hash };
}

export async function deposit(params: {
  owner: string;
  recipient: string;
  token: string;
  amountStroops: bigint;
  unlockAt: bigint;
  label: string;
}): Promise<{ hash: string }> {
  return submitInvoke(
    "deposit",
    [
      new Address(params.owner).toScVal(),
      new Address(params.recipient).toScVal(),
      new Address(params.token).toScVal(),
      nativeToScVal(params.amountStroops, { type: "i128" }),
      nativeToScVal(params.unlockAt, { type: "u64" }),
      nativeToScVal(params.label, { type: "string" }),
    ],
    params.owner
  );
}

export async function withdraw(
  id: bigint,
  recipientPublicKey: string
): Promise<{ hash: string }> {
  return submitInvoke(
    "withdraw",
    [nativeToScVal(id, { type: "u64" })],
    recipientPublicKey
  );
}
