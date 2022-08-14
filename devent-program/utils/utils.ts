import * as anchor from "@project-serum/anchor";
import fs from "fs";
import { TOKEN_METADATA_PROGRAM_ID } from "./const";

export async function getTokenAddress(
  mintAddress: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const tokenAddress = await anchor.utils.token.associatedAddress({
    mint: mintAddress,
    owner: walletAddress,
  });
  return tokenAddress;
}

export async function getMetadataPda(
  mintAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [metadataPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadataPda;
}

export async function getMasterEditionPda(
  mintAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [masterEditionPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return masterEditionPda;
}

export function createKeypairFromFile(filePath: string): anchor.web3.Keypair {
  const secretKeyString = fs.readFileSync(filePath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return anchor.web3.Keypair.fromSecretKey(secretKey);
}

export function lamportsToSol(lamports: anchor.BN): number {
  return lamports.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
}
