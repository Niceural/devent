import * as anchor from "@project-serum/anchor";
import { DEFAULT_ACCOUNTS, PROGRAM_ID, PROGRAM_IDL } from "../utils/const";
const utf8 = anchor.utils.bytes.utf8;

export async function attendeeRegisters(
  provider: anchor.Provider,
  eventAddress: anchor.Address
) {
  // get program instance
  const program = new anchor.Program(PROGRAM_IDL, PROGRAM_ID, provider);

  // get event data
  const eventData = await program.account.eventAccount.fetch(eventAddress);

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
  const tx = await program.methods
    .attendeeRegisters()
    .accounts({
      event: eventAddress,
      registration: registrationPda,
      authority: provider.publicKey,
      organizer: eventData.authority,
      ...DEFAULT_ACCOUNTS,
    })
    .rpc();

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
