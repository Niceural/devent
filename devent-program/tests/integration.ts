import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { Devent } from "../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountClient } from "@project-serum/anchor";
import { BN } from "bn.js";

describe("devent integration tests", () => {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);
  const program = anchor.workspace.Devent as anchor.Program<Devent>;
  const defaultAccounts = {
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  let eventIndex: anchor.BN;

  it("createOnChainEvent()", async () => {
    // arrange
    const metadataUrl =
      "https://raw.githubusercontent.com/Niceural/devent/main/devent-program/tests/event1.json";
    const registrationLimit = new anchor.BN(190);
    const minLamportsPrice = new anchor.BN("3450000000");

    const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("state")],
      program.programId
    );
    const stateData = await program.account.stateAccount.fetch(statePda);

    const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("event"),
        stateData.eventCount.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );

    // act
    const tx = await program.methods
      .createEvent(metadataUrl, registrationLimit, minLamportsPrice)
      .accounts({
        state: statePda,
        event: eventPda,
        authority: wallet.publicKey,
        ...defaultAccounts,
      })
      .rpc();

    // assert
    const eventData = await program.account.eventAccount.fetch(eventPda);
    //   assert.equal(
    //     eventData.authority,
    //     wallet.publicKey,
    //     "event.authority is incorrect"
    //   );
    assert.equal(
      eventData.index.toString(),
      stateData.eventCount.toString(),
      "event.index is invalid"
    );
    assert.equal(
      eventData.metadataUrl,
      metadataUrl,
      "event.metadata_url is invalid"
    );
    assert.equal(
      eventData.registrationLimit.toString(),
      registrationLimit.toString(),
      "event.registration_limit is invalid"
    );
    assert.equal(
      eventData.amountRegistered.toString(),
      new anchor.BN("0").toString(),
      "event.amount_registered is invalid"
    );
    assert.equal(
      eventData.minLamportsPrice.toString(),
      minLamportsPrice.toString(),
      "event.min_lamports_price is invalid"
    );
    eventIndex = eventData.index;
  });

  it("registerAttendeeOnChain()", async () => {
    // arrange
    const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("event"),
        eventIndex.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );

    const [registrationPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("registration"),
        eventIndex.toArrayLike(Buffer, "be", 8),
        // registration index
      ],
      program.programId
    );
    const tx = await program.methods
      .attendeeRegisters()
      .accounts({ event: eventPda });
  });
});
