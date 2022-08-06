import * as anchor from "@project-serum/anchor";
import { assert, expect } from "chai";
import { Devent } from "../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("devent unit tests", () => {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);
  const program = anchor.workspace.Devent as anchor.Program<Devent>;

  describe("create_state()", () => {
    it("sets state.event_count to 0", async () => {
      const [stateSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("state")],
        program.programId
      );
      const stateData = await program.account.stateAccount.fetch(stateSigner);
      assert.equal(
        stateData.eventCount.toString(),
        new anchor.BN(0).toString(),
        "state.event_count not set to 0"
      );
      /*
      assert.equal(
        stateData.authority,
        stateSigner,
        "state.authority not signer"
      );
      */
    });
    it("initializes StateAccount correctly", async () => {
      const [stateSigner] = await anchor.web3.PublicKey.findProgramAddress(
        [anchor.utils.bytes.utf8.encode("state")],
        program.programId
      );
      console.log("before");
      await program.methods.createState();
      const tx = await program.methods
        .createState()
        .accounts({
          state: stateSigner,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      console.log("after");
      const stateData = await program.account.stateAccount.fetch(stateSigner);
      /*
      assert.equal(
        stateData.authority,
        stateSigner,
        "stateAccount.authority is invalid."
      );
      */
      assert.equal(
        stateData.eventCount.toString(),
        new anchor.BN(0).toString(),
        "stateAccount.eventCount is invalid."
      );
    });
  });

  describe("create_event()", () => {
    it("throws an exception if StateAccount is not created", async () => {});
    it("initializes EventAccount correctly", async () => {
      /*
      const registrationLimit = new anchor.BN("999");
      const minLamportsPrice = new anchor.BN("3456000000");
      const eventKeyPair = anchor.web3.Keypair.generate();
      const tx = await program.methods
        .createEvent("", registrationLimit, minLamportsPrice)
        .accounts({
          state: stateKeyPair.publicKey,
          event: eventKeyPair.publicKey,
        })
        .signers([eventKeyPair])
        .rpc();
      const eventData = await program.account.eventAccount.fetch(
        eventKeyPair.publicKey
      );
      assert.equal(registrationLimit, eventData.registrationLimit);
      assert.equal(minLamportsPrice, eventData.minLamportsPrice);
      */
    });
  });
  describe("attendee_registers()", () => {
    it("does not transfer lamports if Pubkey is already registered", async () => {});
  });
});
