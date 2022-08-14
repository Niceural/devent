import * as anchor from "@project-serum/anchor";
import { DEFAULT_ACCOUNTS, PROGRAM_ID, PROGRAM_IDL } from "../utils/const";
const utf8 = anchor.utils.bytes.utf8;

export async function resellTicket(
  provider: anchor.Provider,
  event: anchor.Address,
  registration: anchor.Address,
  buyer: anchor.Address,
  price: anchor.BN
) {
  // get program instance
  const program = new anchor.Program(PROGRAM_IDL, PROGRAM_ID, provider);

  // send resell ticket transaction
  const tx = await program.methods
    .resellTicket(price)
    .accounts({
      event: event,
      registration: registration,
      from: provider.publicKey,
      to: buyer,
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

  return true;
}
