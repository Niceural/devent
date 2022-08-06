// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

// const anchor = require("@project-serum/anchor");
import * as anchor from "@project-serum/anchor";
import { Devent } from "../target/types/devent";
import fs from "fs";

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Devent as anchor.Program<Devent>;

  // creating the state
  const stateKeyPair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const tx = await program.methods
    .createState()
    .accounts({
      state: stateKeyPair.publicKey,
      authority: wallet.publicKey,
    })
    .signers([stateKeyPair])
    .rpc();
  console.log(tx);

  // saving variables to file
  const walletJson = JSON.stringify(wallet);
  const stateKeyPairJson = JSON.stringify(stateKeyPair);
  const txJson = JSON.stringify(tx);
  const saveJson = walletJson + ",\n" + stateKeyPairJson + ",\n" + txJson;
  fs.appendFile("./deploymentData.txt", saveJson, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
