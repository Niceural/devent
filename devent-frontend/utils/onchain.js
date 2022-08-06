import * as anchor from "@project-serum/anchor";
import { SOLANA_HOST } from "../utils/const";
import { getProgramInstance } from "../utils/get-program";

async function createOcEvent(
  wallet,
  metadataUrl,
  registrationLimit,
  minLamportsPrice
) {
  console.log("Creating on chain event...");
  const connection = new anchor.web3.Connection(SOLANA_HOST);
  const program = getProgramInstance(connection, wallet);

  console.log("Getting state signer...");
  let [stateSigner] = await anchor.web3.PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode("state")],
    program.programId
  );
  let stateInfo;
  try {
    console.log("Getting state info...");
    stateInfo = await program.account.fetch(stateSigner);
  } catch (error) {
    console.log(error);
    await program.methods
      .createState()
      .accounts({ state: stateSigner.publicKey, authority: wallet.publicKey })
      .signers([stateSigner])
      .rpc();
    return false;
  }

  console.log("Getting event signer...");
  let [eventSigner] = await anchor.web3.PublicKey.findProgramAddress([
    anchor.utils.bytes.utf8.encode("event"),
    stateInfo.eventCount.toArrayLike(Buffer, "be", 8),
  ]);
  try {
    await program.account.eventAccount.fetch(eventSigner);
  } catch (error) {
    console.log(error);
    await program.methods
      .createEvent(metadataUrl, registrationLimit, minLamportsPrice)
      .accounts({
        state: stateSigner.publicKey,
        event: eventSigner.publicKey,
        authority: wallet.publicKey,
      })
      .signers([eventSigner])
      .rpc();
  }
  return true;
}

// This function fetches all the on chain events stored in EventAccount-s
async function getAllOcEvents(wallet) {
  console.log("Getting all on chain events...");
  const connection = new anchor.web3.Connection(SOLANA_HOST);
  const program = getProgramInstance(connection, wallet);

  let eventsData;
  try {
    eventsData = await program.account.eventAccount.all();
  } catch (error) {
    console.log(error);
  }
  return eventsData;
}

module.exports = {
  createOcEvent,
  getAllOcEvents,
};
