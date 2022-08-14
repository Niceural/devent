import * as anchor from "@project-serum/anchor";
import fs from "fs";
import {
  TOKEN_METADATA_PROGRAM_ID,
  CONNECTION as connection,
  PROGRAM_IDL,
  PROGRAM_ID,
} from "./const";

export async function mintCollectionNft(
  wallet: anchor.Wallet,
  name: string,
  symbol: string,
  uri: string
) {
  // config
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(PROGRAM_IDL, PROGRAM_ID, provider);

  // get addresses
  const mintKeypair = anchor.web3.Keypair.generate();
  const tokenAddress = await getTokenAddress(
    mintKeypair.publicKey,
    wallet.publicKey
  );
  const metadataPda = await getMetadataPda(mintKeypair.publicKey);
  const masterEditionPda = await getMasterEditionPda(mintKeypair.publicKey);

  // send and sign transaction
  const tx = await program.methods
    .mintCollectionNft(name, symbol, uri)
    .accounts({
      metadata: metadataPda,
      tokenMetadaProgram: TOKEN_METADATA_PROGRAM_ID,
      masterEdition: masterEditionPda,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAddress,
      mintAuthority: wallet.publicKey,
    })
    .signers([mintKeypair])
    .rpc();

  // confirm transaction
  let latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
}

async function getTokenAddress(
  mintAddress: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const tokenAddress = await anchor.utils.token.associatedAddress({
    mint: mintAddress,
    owner: walletAddress,
  });
  return tokenAddress;
}

async function getMetadataPda(
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

async function getMasterEditionPda(
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

function createKeypairFromFile(filePath: string): anchor.web3.Keypair {
  const secretKeyString = fs.readFileSync(filePath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return anchor.web3.Keypair.fromSecretKey(secretKey);
}

function lamportsToSol(lamports: anchor.BN): number {
  return lamports.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
}
