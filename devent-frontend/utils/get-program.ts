import * as anchor from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { STABLE_POOL_IDL, STABLE_POOL_PROGRAM_ID } from "./const";

export default function getProgramInstance(
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet
) {
  console.log("Getting program instance...");
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  const program = new anchor.Program(
    STABLE_POOL_IDL,
    STABLE_POOL_PROGRAM_ID,
    provider
  );

  return program;
}
