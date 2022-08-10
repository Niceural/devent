import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { Devent } from "../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createKeypairFromFile } from "./utils";

describe("devent integration tests", () => {
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);
  const program = anchor.workspace.Devent as anchor.Program<Devent>;
  const utf8 = anchor.utils.bytes.utf8;
  const defaultAccounts = {
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  it("create registration", async () => {
    // create event
    const event = {
      maxRegistration: new anchor.BN("73"),
      registrationPrice: new anchor.BN("1700000000"), // 1.7 SOL
      resellAllowed: true,
      maxResellPrice: new anchor.BN("6700000000"),
      mintNftOnRegistration: true,
      mintNftOnAttendance: true,
      paused: false,
      eventData: {
        title: "test",
        organizer: "test",
        description: "test",
        imageUrl: "test",
        location: "test",
        startDate: "test",
        startTime: "test",
        endDate: "test",
        endTime: "test",
      },
    };
    const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode("state")],
      program.programId
    );
    const stateData = await program.account.stateAccount.fetch(statePda);
    const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode("event"), stateData.eventCount.toArrayLike(Buffer, "be", 8)],
      program.programId
    );
    const tx = await program.methods
      .createEvent(
        event.maxRegistration,
        event.registrationPrice,
        event.resellAllowed,
        event.maxResellPrice,
        event.mintNftOnRegistration,
        event.mintNftOnAttendance,
        event.paused,
        event.eventData
      )
      .accounts({
        state: statePda,
        event: eventPda,
        authority: provider.publicKey,
        ...defaultAccounts,
      })
      .rpc();
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    });
    const eventData = await program.account.eventAccount.fetch(eventPda);

    // create registration
    const buyer: anchor.web3.Keypair = await createKeypairFromFile(
      "/home/nic/Documents/solana-dev/devent/devent-program/tests/keypairs/buyer1.json"
    );
    const [registrationPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        utf8.encode("registration"),
        eventData.index.toArrayLike(Buffer, "be", 8),
        eventData.registrationCount.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );
    console.log(registrationPda);
    const tx1 = await program.methods
      .createRegistration()
      .accounts({
        event: eventPda,
        registration: registrationPda,
        authority: buyer.publicKey,
        organizer: eventData.authority,
        ...defaultAccounts,
      })
      .signers([buyer])
      .rpc();
  });
});
