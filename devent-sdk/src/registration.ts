import * as anchor from "@project-serum/anchor";
import { DEFAULT_ACCOUNTS, PROGRAM_ID, PROGRAM_IDL } from "../utils/const";
import { EventNotCreatedError, RegistrationCreationError } from "./errors";
const utf8 = anchor.utils.bytes.utf8;

export async function createRegistration(
  provider: anchor.Provider,
  eventAddress: anchor.Address
) {
  // get program instance
  const program = new anchor.Program(PROGRAM_IDL, PROGRAM_ID, provider);

  // get event data
  let eventData;
  try {
    eventData = await program.account.eventAccount.fetch(eventAddress);
  } catch (error) {
    throw new EventNotCreatedError(error);
  }

  // get registration address
  const [registrationPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      utf8.encode("registration"),
      eventData.index.toArrayLike(Buffer, "be", 8),
      eventData.registrationCount.toArrayLike(Buffer, "be", 8),
    ],
    program.programId
  );

  // send registration transaction
  let tx;
  try {
    tx = await program.methods
      .createRegistration()
      .accounts({
        event: eventAddress,
        registration: registrationPda,
        authority: provider.publicKey,
        organizer: eventData.authority,
        ...DEFAULT_ACCOUNTS,
      })
      .rpc();
  } catch (error) {
    throw new RegistrationCreationError(error);
  }

  // confirm transaction
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });

  // get RegistrationAccount data
  const registrationData = await program.account.registrationAccount.fetch(
    registrationPda
  );
  return registrationData;
}
