import * as anchor from "@project-serum/anchor";
import { assert, expect } from "chai";
import { Devent } from "../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("devent unit tests", () => {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);
  const program = anchor.workspace.Devent as anchor.Program<Devent>;
  const utf8 = anchor.utils.bytes.utf8;
  const defaultAccounts = {
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  describe("state", () => {
    it("creates state successfully", async () => {
      const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode("state")],
        program.programId
      );
      try {
        // if not created, create state
        await program.methods
          .createState()
          .accounts({
            state: statePda,
            authority: wallet.publicKey,
            ...defaultAccounts,
          })
          .rpc();
        // fetch StateAccount values
        const stateData = await program.account.stateAccount.fetch(statePda);
        // check initial values
        assert(
          stateData.authority.equals(wallet.publicKey),
          "authority is invalid"
        );
        assert(
          stateData.eventCount.eq(new anchor.BN("0")),
          "event_count is invalid"
        );
      } catch (error) {
        // if already created, throws an exception
        assert(error instanceof anchor.web3.SendTransactionError);
        assert(() => {
          error.logs.forEach((element) => {
            if (element.includes("already in use")) {
              return true;
            }
          });
          return false;
        });
      }
    });
    it("state variables are valid", async () => {
      const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode("state")],
        program.programId
      );
      const stateData = await program.account.stateAccount.fetch(statePda);
      assert(
        stateData.authority.equals(wallet.publicKey),
        "authority is invalid"
      );
      assert(
        new anchor.BN("0") <= stateData.eventCount,
        "event_count is invalid"
      );
    });
  });

  /*
  describe("event", () => {
    const metadataUrl =
      "https://raw.githubusercontent.com/Niceural/devent/main/devent-program/tests/event1.json";
    const registrationLimit = new anchor.BN(190);
    const minLamportsPrice = new anchor.BN("3450000000");

    it("creates a new event with off chain metadata correctly", async () => {
      const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode("state")],
        program.programId
      );
      const stateData = await program.account.stateAccount.fetch(statePda);
      const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
        [
          utf8.encode("event"),
          stateData.eventCount.toArrayLike(Buffer, "be", 8),
        ],
        program.programId
      );
      const tx = await program.methods
        .createEvent(metadataUrl, registrationLimit, minLamportsPrice)
        .accounts({
          state: statePda,
          event: eventPda,
          authority: wallet.publicKey,
          ...defaultAccounts,
        })
        .rpc();
      const eventData = await program.account.eventAccount.fetch(eventPda);
      assert(
        eventData.authority.equals(wallet.publicKey),
        "authority is invalid"
      );
      assert(eventData.index.eq(stateData.eventCount), "index is invalid");
      assert.equal(
        eventData.metadataUrl,
        metadataUrl,
        "metadata_url is invalid"
      );
      assert(
        eventData.registrationLimit.eq(registrationLimit),
        "registration_limit is invalid"
      );
      assert(
        eventData.registrationCount.eq(new anchor.BN("0")),
        "registration_count is invalid"
      );
      assert(
        eventData.minLamportsPrice.eq(minLamportsPrice),
        "min_lamports_price is invalid"
      );
    });
  });
  */

  describe("registration", () => {
    it("registers PublicKey and transfers lamports", async () => {});
  });
});
