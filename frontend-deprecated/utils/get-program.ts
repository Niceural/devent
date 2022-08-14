import * as anchor from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { PROGRAM_IDL, PROGRAM_ID } from "./const";

export default function getProgramInstance(
  connection: anchor.web3.Connection,
  wallet: any
) {
  console.log("Getting program instance...");
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );

  const idl = PROGRAM_IDL as anchor.Idl;
  const programId = PROGRAM_ID;

  const program = new anchor.Program(idl, programId, provider);

  return program;
}
