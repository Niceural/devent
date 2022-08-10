import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
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
  const resellerWallet: anchor.Wallet = new anchor.Wallet(resellerKeypair);
  const attendeeWallet: anchor.Wallet = new anchor.Wallet(attendeeKeypair);
  // creating providers
  const organizerProvider: anchor.AnchorProvider = new anchor.AnchorProvider(
    connection,
    organizerWallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const resellerProvider: anchor.AnchorProvider = new anchor.AnchorProvider(
    connection,
    resellerWallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const attendeeProvider: anchor.AnchorProvider = new anchor.AnchorProvider(
    connection,
    attendeeWallet,
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
      organizerProvider.publicKey
    }`
  );
  console.log(
    `Reseller:  ${lamportsToSol(resellerInitialBalance)} SOL, ${
      resellerProvider.publicKey
    }`
  );
  console.log(
    `Attendee:  ${lamportsToSol(attendeeInitialBalance)} SOL, ${
      attendeeProvider.publicKey
    }\n`
  );

  // get program instance
  const program: anchor.Program<Devent> = new anchor.Program(
    PROGRAM_IDL,
    PROGRAM_ID,
    organizerProvider
  ) as anchor.Program<Devent>;

  // get program state
  console.log("Getting program state...");
  const [stateAccountAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [utf8.encode("state")],
    program.programId
  );
  console.log(`StateAccount address: ${stateAccountAddress}\n`);
  const stateAccountData = await program.account.stateAccount.fetch(
    stateAccountAddress
  );

  // create event
  console.log("Creating event...");
  // getting event address
  const [eventAccountAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [
      utf8.encode("event"),
      stateAccountData.eventCount.toArrayLike(Buffer, "be", 8),
    ],
    program.programId
  );
  console.log(`EventAccount address: ${eventAccountAddress}`);
  // arguments
  const maxRegistration: anchor.BN = new anchor.BN("173");
  const registrationPrice: anchor.BN = new anchor.BN("1300000000");
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
      state: stateAccountAddress,
      event: eventAccountAddress,
      authority: organizerProvider.publicKey,
      ...DEFAULT_ACCOUNTS,
    })
    .rpc();
  // confirm transaction
  let latestBlockHash = await organizerProvider.connection.getLatestBlockhash();
  await organizerProvider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
  // get event account data
  const eventAccountData = await program.account.eventAccount.fetch(
    eventAccountAddress
  );
  console.log(
    `Event created by organizer with index ${eventAccountData.index}\n`
  );

  // purchase ticket
  console.log("Purchasing ticket...");
  // getting RegistrationAccount address
  const [registrationAccountAddress] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        utf8.encode("registration"),
        eventAccountData.index.toArrayLike(Buffer, "be", 8),
        eventAccountData.registrationCount.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );
  console.log(`RegistrationAccount address: ${registrationAccountAddress}`);
  // send transaction
  tx = await program.methods
    .createRegistration()
    .accounts({
      event: eventAccountAddress,
      registration: registrationAccountAddress,
      authority: resellerProvider.publicKey,
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
    await program.account.registrationAccount.fetch(registrationAccountAddress);
  // getting balances after
  const organizerBalanceAfterRegistration = new anchor.BN(
    await connection.getBalance(organizerProvider.publicKey)
  );
  const resellerBalanceAfterRegistration = new anchor.BN(
    await connection.getBalance(resellerProvider.publicKey)
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
  tx = await program.methods
    .updateRegistration(registrationPrice)
    .accounts({
      event: eventAccountAddress,
      registration: registrationAccountAddress,
      buyer: attendeeProvider.publicKey,
      seller: resellerProvider.publicKey,
      ...DEFAULT_ACCOUNTS,
    })
    .signers([attendeeKeypair])
    .rpc();
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
    await connection.getBalance(resellerProvider.publicKey)
  );
  const attendeeBalanceAfterResell = new anchor.BN(
    await connection.getBalance(attendeeProvider.publicKey)
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
