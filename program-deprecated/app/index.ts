import * as anchor from "@project-serum/anchor";
import {
  PROGRAM_ID,
  PROGRAM_IDL,
  SOLANA_HOST,
  Devent,
  DEFAULT_ACCOUNTS,
} from "./utils/const";
import { createKeypairFromFile, lamportsToSol } from "./utils/utils";
const utf8 = anchor.utils.bytes.utf8;

async function main() {
  console.log("Initializing...");
  // connection
  const connection: anchor.web3.Connection = new anchor.web3.Connection(
    SOLANA_HOST
  );
  // loading keypairs
  const organizerKeypair: anchor.web3.Keypair = createKeypairFromFile(
    "./app/keypairs/organizer.json"
  );
  const resellerKeypair: anchor.web3.Keypair = createKeypairFromFile(
    "./app/keypairs/reseller.json"
  );
  const attendeeKeypair: anchor.web3.Keypair = createKeypairFromFile(
    "./app/keypairs/attendee.json"
  );
  // creating wallets
  const organizerWallet: anchor.Wallet = new anchor.Wallet(organizerKeypair);
  // creating providers
  const organizerProvider: anchor.AnchorProvider = new anchor.AnchorProvider(
    connection,
    organizerWallet,
    anchor.AnchorProvider.defaultOptions()
  );
  // initial SOL balances
  const organizerInitialBalance = new anchor.BN(
    await connection.getBalance(organizerKeypair.publicKey)
  );
  const resellerInitialBalance = new anchor.BN(
    await connection.getBalance(resellerKeypair.publicKey)
  );
  const attendeeInitialBalance = new anchor.BN(
    await connection.getBalance(attendeeKeypair.publicKey)
  );
  console.log(
    `Organizer: ${lamportsToSol(organizerInitialBalance)} SOL, ${
      organizerWallet.publicKey
    }`
  );
  console.log(
    `Reseller:  ${lamportsToSol(resellerInitialBalance)} SOL, ${
      resellerKeypair.publicKey
    }`
  );
  console.log(
    `Attendee:  ${lamportsToSol(attendeeInitialBalance)} SOL, ${
      attendeeKeypair.publicKey
    }\n`
  );

  // get program instance
  let program: anchor.Program<Devent> = new anchor.Program(
    PROGRAM_IDL,
    PROGRAM_ID,
    organizerProvider
  ) as anchor.Program<Devent>;

  // get program state
  console.log("Getting program state...");
  const [statePda] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode("state")],
    program.programId
  );
  console.log(`State pda: ${statePda}\n`);
  const stateAccountData = await program.account.stateAccount.fetch(statePda);

  // create event
  console.log("Creating event...");
  // getting event address
  const [eventPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      utf8.encode("event"),
      stateAccountData.eventCount.toArrayLike(Buffer, "be", 8),
    ],
    program.programId
  );
  console.log(`EventAccount address: ${eventPda}`);
  // arguments
  const maxRegistration: anchor.BN = new anchor.BN("173");
  const registrationPrice: anchor.BN = new anchor.BN("130000000");
  const resellAllowed: boolean = true;
  const maxResellPrice: anchor.BN = registrationPrice;
  const mintNftOnRegistration: boolean = true;
  const mintNftOnAttendance: boolean = true;
  const paused: boolean = false;
  // send transaction
  let tx = await program.methods
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
      authority: organizerWallet.publicKey,
      ...DEFAULT_ACCOUNTS,
    })
    .signers([organizerKeypair])
    .rpc();
  // confirm transaction
  let latestBlockHash = await organizerProvider.connection.getLatestBlockhash();
  await organizerProvider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
  // get event account data
  const eventAccountData = await program.account.eventAccount.fetch(eventPda);
  console.log(
    `Event created by organizer with index ${eventAccountData.index}\n`
  );

  // purchase ticket
  console.log("Purchasing ticket...");
  // getting RegistrationAccount address
  const [registrationPda] = await anchor.web3.PublicKey.findProgramAddress(
    [
      utf8.encode("registration"),
      eventAccountData.index.toArrayLike(Buffer, "be", 8),
      eventAccountData.registrationCount.toArrayLike(Buffer, "be", 8),
    ],
    program.programId
  );
  console.log(`RegistrationAccount address: ${registrationPda}`);
  // send transaction
  tx = await program.methods
    .createRegistration()
    .accounts({
      event: eventPda,
      registration: registrationPda,
      authority: resellerKeypair.publicKey,
      organizer: eventAccountData.authority,
      ...DEFAULT_ACCOUNTS,
    })
    .signers([resellerKeypair])
    .rpc();
  // confirm transaction
  latestBlockHash = await organizerProvider.connection.getLatestBlockhash();
  await organizerProvider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
  // get RegistrationAccount data
  const registrationAccountData =
    await program.account.registrationAccount.fetch(registrationPda);
  // getting balances after
  const organizerBalanceAfterRegistration = new anchor.BN(
    await connection.getBalance(organizerWallet.publicKey)
  );
  const resellerBalanceAfterRegistration = new anchor.BN(
    await connection.getBalance(resellerKeypair.publicKey)
  );
  console.log(
    `Ticket purchased successfully for ${lamportsToSol(registrationPrice)} SOL`
  );
  console.log(
    `Organizer balance: before = ${lamportsToSol(
      organizerInitialBalance
    )} SOL, after = ${lamportsToSol(organizerBalanceAfterRegistration)} SOL`
  );
  console.log(
    `Reseller balance: before = ${lamportsToSol(
      resellerInitialBalance
    )} SOL, after = ${lamportsToSol(resellerBalanceAfterRegistration)} SOL\n`
  );

  // resell ticket
  console.log("Reselling ticket...");
  // send transaction
  try {
    tx = await program.methods
      .updateRegistration(registrationPrice)
      .accounts({
        event: eventPda,
        registration: registrationPda,
        buyer: attendeeKeypair.publicKey,
        seller: resellerKeypair.publicKey,
        systemProgram: DEFAULT_ACCOUNTS.systemProgram,
      })
      .signers([attendeeKeypair])
      .rpc();
  } catch (error) {
    console.log(error);
  }
  // sign transaction
  latestBlockHash = await organizerProvider.connection.getLatestBlockhash();
  await organizerProvider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
  console.log(
    `Ticket resold successfully for ${lamportsToSol(registrationPrice)} SOL`
  );
  // getting balances after
  const resellerBalanceAfterResell = new anchor.BN(
    await connection.getBalance(resellerKeypair.publicKey)
  );
  const attendeeBalanceAfterResell = new anchor.BN(
    await connection.getBalance(attendeeKeypair.publicKey)
  );
  console.log(
    `Reseller balance: before = ${lamportsToSol(
      resellerBalanceAfterRegistration
    )} SOL, after = ${lamportsToSol(resellerBalanceAfterResell)} SOL`
  );
  console.log(
    `Attendee balance: before = ${lamportsToSol(
      attendeeInitialBalance
    )} SOL, after = ${lamportsToSol(attendeeBalanceAfterResell)} SOL\n`
  );
}

main();
