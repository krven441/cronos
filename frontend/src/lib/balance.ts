"use client";

import { rpc as RpcApi, Contract, TransactionBuilder, BASE_FEE, Account, scValToNative, Address } from "@stellar/stellar-sdk";
import { STELLAR_RPC_URL, NETWORK_PASSPHRASE, TOKEN_CONTRACT_ADDRESS } from "./env";

export async function getXlmBalance(publicKey: string): Promise<bigint> {
  const rpc = new RpcApi.Server(STELLAR_RPC_URL);
  const contract = new Contract(TOKEN_CONTRACT_ADDRESS);
  const source = new Account(publicKey, "0");
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("balance", new Address(publicKey).toScVal()))
    .setTimeout(30)
    .build();
  const sim = await rpc.simulateTransaction(tx);
  if (RpcApi.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  const retval = (sim as RpcApi.Api.SimulateTransactionSuccessResponse).result?.retval;
  if (!retval) return 0n;
  return BigInt(scValToNative(retval) as string | number | bigint);
}

export function stroopsToXlm(stroops: bigint): number {
  return Number(stroops) / 10_000_000;
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}
