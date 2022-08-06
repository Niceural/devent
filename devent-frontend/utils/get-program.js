import * as anchor from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { STABLE_POOL_IDL, STABLE_POOL_PROGRAM_ID } from "./const";
import { DEBUG_LOG as log } from "../utils/const";

export function getProgramInstance(connection, wallet) {
  if (log) {
    console.log("Getting program instance...");
  }
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  const idl = STABLE_POOL_IDL;

  const programId = STABLE_POOL_PROGRAM_ID;

  const program = new anchor.Program(idl, programId, provider);

  return program;
}
