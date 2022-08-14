import * as anchor from "@project-serum/anchor";
import { DEFAULT_ACCOUNTS, PROGRAM_ID, PROGRAM_IDL } from "../utils/const";
import { EventCreationError, StateNotCreatedError } from "./errors";
import { EventAccount, CreateEvent } from "./types";
const utf8 = anchor.utils.bytes.utf8;

export async function createEvent(
  provider: anchor.Provider,
  event: CreateEvent
): Promise<EventAccount> {
  // get program instance
  const program = new anchor.Program(PROGRAM_IDL, PROGRAM_ID, provider);

  // get state address
  const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode("state")],
    program.programId
  );

  // get state data
  let stateData;
  try {
    stateData = await program.account.stateAccount.fetch(statePda);
  } catch (error) {
    throw new StateNotCreatedError(error);
  }

  // get event address
  const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode("event"), stateData.eventCount.toArrayLike(Buffer, "be", 8)],
    program.programId
  );

  // send create event transaction
  let tx;
  try {
    tx = await program.methods
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
        ...DEFAULT_ACCOUNTS,
      })
      .rpc();
  } catch (error) {
    throw new EventCreationError(error);
  }

  // confirm transaction
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });

  // get EventAccount data
  const eventInfo = await program.account.eventAccount.fetch(eventPda);

  return eventInfo as EventAccount;
}
