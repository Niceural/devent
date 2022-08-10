import * as anchor from "@project-serum/anchor";
import fs from "fs";

export function createKeypairFromFile(filePath: string): anchor.web3.Keypair {
  const secretKeyString = fs.readFileSync(filePath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return anchor.web3.Keypair.fromSecretKey(secretKey);
}

export function lamportsToSol(lamports: anchor.BN): number {
  return lamports.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
}
