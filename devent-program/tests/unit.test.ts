import * as anchor from "@project-serum/anchor";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";
import { Devent } from "../target/types/devent";
import { TOKEN_METADATA_PROGRAM_ID } from "../utils/const";
import {
  getMetadataPda,
  getMasterEditionPda,
  getTokenAddress,
  createKeypairFromFile,
} from "../utils/utils";
import { assert } from "chai";

describe("devent unit tests", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet;
  anchor.setProvider(provider);
  const userKeypair = createKeypairFromFile("./utils/keypairs/user.json");
  // get program instance
  const program = anchor.workspace.Devent as Program<Devent>;
  const metaplex = Metaplex.make(provider.connection)
    .use(keypairIdentity(userKeypair))
    .use(bundlrStorage());

  describe("mint_collection_nft()", () => {
    const userName = "Niceural";
    const userSymbol = "NIC";
    const userUri = "";

    it("doesn't throw", async () => {
      // getting Account addresses
      const mintKeypair = anchor.web3.Keypair.generate();
      const tokenAddress = await getTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
      const metadataPda = await getMetadataPda(mintKeypair.publicKey);
      const masterEditionPda = await getMasterEditionPda(mintKeypair.publicKey);
      // creating user
      const tx = await program.methods
        .mintCollectionNft(userName, userSymbol, userUri)
        .accounts({
          metadata: metadataPda,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          masterEdition: masterEditionPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAddress,
          mintAuthority: wallet.publicKey,
        })
        .signers([mintKeypair])
        .rpc();
      const nft = await metaplex.nfts().findByMint(mintKeypair.publicKey).run();
    });
    it("sets the CollectionDetails field", async () => {
      // a set CollectionDetails field is required for collection NFTs
      // getting Account addresses
      const mintKeypair = anchor.web3.Keypair.generate();
      const tokenAddress = await getTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
      const metadataPda = await getMetadataPda(mintKeypair.publicKey);
      const masterEditionPda = await getMasterEditionPda(mintKeypair.publicKey);
      // creating user
      const tx = await program.methods
        .mintCollectionNft(userName, userSymbol, userUri)
        .accounts({
          metadata: metadataPda,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          masterEdition: masterEditionPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAddress,
          mintAuthority: wallet.publicKey,
        })
        .signers([mintKeypair])
        .rpc();
      const nft = await metaplex.nfts().findByMint(mintKeypair.publicKey).run();
      assert.equal(
        nft.collectionDetails["version"],
        "V1",
        "CollectionDetails version is not valid"
      );
      assert(
        nft.collectionDetails["size"].eq(new anchor.BN("0")),
        "CollectionDetails size is not valid"
      );
    });
  });

  describe("mint_regular_nft()", () => {
    const userName = "Niceural";
    const userSymbol = "NIC";
    const userUri = "";

    it("doesn't throw", async () => {
      // getting Account addresses
      const mintKeypair = anchor.web3.Keypair.generate();
      const tokenAddress = await getTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );
      const metadataPda = await getMetadataPda(mintKeypair.publicKey);
      const masterEditionPda = await getMasterEditionPda(mintKeypair.publicKey);
      // creating user
      const tx = await program.methods
        .mintCollectionNft(userName, userSymbol, userUri)
        .accounts({
          metadata: metadataPda,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          masterEdition: masterEditionPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAddress,
          mintAuthority: wallet.publicKey,
        })
        .signers([mintKeypair])
        .rpc();
      const nft = await metaplex.nfts().findByMint(mintKeypair.publicKey).run();
    });
    it("sets and verifies Collection", async () => {
      throw new Error("Not implemented");
    });
  });

  describe("sell_nft()", () => {
    it("sells a Collection NFT", async () => {
      throw new Error("Not implemented");
    });
    it("sells a Regular NFT", async () => {
      throw new Error("Not implemented");
    });
  });
});
