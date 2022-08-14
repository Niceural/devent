import * as anchor from "@project-serum/anchor";
import { IDL } from "./devent";

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const CONNECTION = new anchor.web3.Connection(
  "https://api.devnet.solana.com"
);

export const PROGRAM_ID = new anchor.web3.PublicKey(
  "8sLvi7QKCyEyc7VtSGvGU1Vwos5GwmJ8q9wSRcNHhWNS"
);

export const PROGRAM_IDL = IDL as anchor.Idl;
