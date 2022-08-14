import * as anchor from "@project-serum/anchor";
import { assert, expect } from "chai";
import { Devent } from "../target/types/devent";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AnchorError } from "@project-serum/anchor";

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
  async function getStatePda(): Promise<anchor.web3.PublicKey> {
    const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode("state")],
      program.programId
    );
    return statePda;
  }
  async function getEventPda(index: anchor.BN): Promise<anchor.web3.PublicKey> {
    const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode("event"), index.toArrayLike(Buffer, "be", 8)],
      program.programId
    );
    return eventPda;
  }
  async function getRegistrationPda(
    eventIndex: anchor.BN,
    registrationIndex: anchor.BN
  ): Promise<anchor.web3.PublicKey> {
    const [registrationPda] = await anchor.web3.PublicKey.findProgramAddress(
      [
        utf8.encode("registration"),
        eventIndex.toArrayLike(Buffer, "be", 8),
        registrationIndex.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );
    return registrationPda;
  }

  describe("create_state", () => {
    it("creates state successfully", async () => {
      const statePda = await getStatePda();
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
    it("state variables types are valid", async () => {
      const statePda = await getStatePda();
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
  describe("create_event", () => {
    const title = "Milkshake, Ministry of Sound - The Official Return 2022";
    const organizer = "Milkshake";
    const description =
      "Milkshake, London's Biggest Student Night. Running 20 F*cking Years Strong, Since 2002 AND AFTER A MINISTRY OF SOUND REFURBISHMENT - WE BACK! Tuesday August 16th 2022 : On Sale Now. Ministry of Sound Club, 10:30pm-Late";
    const location =
      "Ministry of Sound, 103 Gaunt Street, London, SE1 6DP, United Kingdom";
    const imageUrl =
      "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F319134359%2F26253177781%2F1%2Foriginal.20220715-122927?w=800&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C25%2C768%2C384&s=810957612ec7d2eb9cc5eae100b7f1ac";
    const startDate = "16/08/2022";
    const startTime = "23:00";
    const endDate = "17/08/2022";
    const endTime = "04:00";
    const maxRegistration = new anchor.BN(190);
    const lamportsPrice = new anchor.BN("3500000000");

    it("successfully creates a new event", async () => {
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
      await program.methods
        .createEvent(
          title,
          organizer,
          description,
          imageUrl,
          location,
          startDate,
          startTime,
          endDate,
          endTime,
          maxRegistration,
          lamportsPrice
        )
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
      assert(
        eventData.maxRegistration.eq(maxRegistration),
        "max_registration is invalid"
      );
      assert(
        eventData.registrationCount.eq(new anchor.BN("0")),
        "registration_count is invalid"
      );
      assert(
        eventData.lamportsPrice.eq(lamportsPrice),
        "min_lamports_price is invalid"
      );
      assert.equal(eventData.title, title, "title is invalid");
      assert.equal(eventData.organizer, organizer, "organizer is invalid");
      assert.equal(
        eventData.description,
        description,
        "description is invalid"
      );
      assert.equal(eventData.imageUrl, imageUrl, "image_url is invalid");
      assert.equal(eventData.location, location, "location is invalid");
      assert.equal(eventData.startDate, startDate, "start_date is invalid");
      assert.equal(eventData.startTime, startTime, "start_time is invalid");
      assert.equal(eventData.endDate, endDate, "end_date is invalid");
      assert.equal(eventData.endTime, endTime, "end_time is invalid");
    });
    it("throws if tries to recreate an event", async () => {
      const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode("state")],
        program.programId
      );
      const stateData = await program.account.stateAccount.fetch(statePda);
      const eventIndex = stateData.eventCount.sub(new anchor.BN("1"));
      const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
        [utf8.encode("event"), eventIndex.toArrayLike(Buffer, "be", 8)],
        program.programId
      );
      const eventDataBefore = await program.account.eventAccount.fetch(
        eventPda
      );
      try {
        await program.methods
          .createEvent(
            "title modified",
            organizer,
            description,
            imageUrl,
            location,
            startDate,
            startTime,
            endDate,
            endTime,
            maxRegistration,
            lamportsPrice
          )
          .accounts({
            state: statePda,
            event: eventPda,
            authority: wallet.publicKey,
            ...defaultAccounts,
          })
          .rpc();
        assert(false, "no exceptions were thrown");
      } catch (error) {
        const eventDataAfter = await program.account.eventAccount.fetch(
          eventPda
        );
        assert.equal(
          eventDataBefore.title,
          eventDataAfter.title,
          "event data was modified"
        );
      }
    });
    it("gets all events", async () => {
      const events = await program.account.eventAccount.all();
      console.log(events);
    });
  });
  */

  describe("create_registration", async () => {
    const statePda = await getStatePda();
    let stateData, eventPda, eventData;

    // create_event arguments
    const maxRegistration: anchor.BN = new anchor.BN("2");
    const registrationPrice: anchor.BN = new anchor.BN("130000000");
    const resellAllowed: boolean = true;
    const maxResellPrice: anchor.BN = registrationPrice;
    const mintNftOnRegistration: boolean = true;
    const mintNftOnAttendance: boolean = true;
    const paused: boolean = false;

    beforeEach(async () => {
      // create an event
      stateData = await program.account.stateAccount.fetch(statePda);
      eventPda = await getEventPda(stateData.eventCount);
      await program.methods
        .createEvent(
          maxRegistration,
          registrationPrice,
          resellAllowed,
          maxResellPrice,
          mintNftOnRegistration,
          mintNftOnAttendance,
          paused
        )
        .accounts({
          state: statePda,
          event: eventPda,
          organizer: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      eventData = await program.account.eventAccount.fetch(eventPda);
    });

    it("throws if event is paused", async () => {
      // pause the event
    });
    it("registers PublicKey and transfers lamports", async () => {});
    it("throws if organizer is incorrect", async () => {});
    it("throws if event is full", async () => {});
  });
});
