import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import devent from "../../devent-program/target/idl/devent.json";
// import { Devent as DeventType } from "../../devent-program/target/types/devent";

export const DEFAULT_ACCOUNTS = {
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: anchor.web3.SystemProgram.programId,
};

export const PROGRAM_ID = new anchor.web3.PublicKey(
  "59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE"
);

export const PROGRAM_IDL = devent as anchor.Idl;
