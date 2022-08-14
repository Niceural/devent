import { Idl, web3 } from "@project-serum/anchor";
import { IDL, Devent as DeventType } from "../../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const SOLANA_HOST = "https://api.devnet.solana.com";

export const PROGRAM_ID: web3.PublicKey = new web3.PublicKey(
  "59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE"
);

export const PROGRAM_IDL: Idl = IDL;

export type Devent = DeventType;

export const DEFAULT_ACCOUNTS = {
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: web3.SystemProgram.programId,
};
