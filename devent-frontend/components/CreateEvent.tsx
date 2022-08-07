import React, { FunctionComponent, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SOLANA_HOST } from "../utils/const";
import getProgramInstance from "../utils/get-program";
const utf8 = anchor.utils.bytes.utf8;

type CreateEventProps = {
  setOnChainSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setOffChainSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setEventIndex: React.Dispatch<React.SetStateAction<anchor.BN>>;
};

const CreateEvent: FunctionComponent<CreateEventProps> = ({
  setOnChainSuccess,
  setOffChainSuccess,
  setEventIndex,
}) => {
  // component styling
  const style = {
    wrapper: "",
  };

  // states
  const wallet = useWallet;
  // off chain data
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  // on chain data
  const [offChainMetadataUrl, setOffChainMetadataUrl] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState(
    new anchor.BN("0")
  );
  const [minLamportsPrice, setMinLamportsPrice] = useState(new anchor.BN("0"));

  const defaultAccounts = {
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Creating a new event...");
    await saveFileToPinata();
    await saveMetadataToPinata();
    await createOnchainEvent();
    console.log(`New event created with index: ${0}`);
  };

  const saveFileToPinata = async () => {};

  const saveMetadataToPinata = async () => {
    setOffChainMetadataUrl(
      "https://raw.githubusercontent.com/Niceural/devent/main/devent-program/tests/event1.json"
    );
    setOffChainSuccess(true);
  };

  const createOnchainEvent = async () => {
    console.log("Calling devent.create_event...");

    // web3 config stuff
    const connection = new anchor.web3.Connection(SOLANA_HOST);
    const program = getProgramInstance(connection, wallet);

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
      .createEvent(offChainMetadataUrl, registrationLimit, minLamportsPrice)
      .accounts({
        state: statePda,
        event: eventPda,
        authority: wallet.publicKey,
        ...defaultAccounts,
      })
      .rpc();

    setEventIndex(stateData.eventCount);
    setOnChainSuccess(true);
  };

  return <div className={style.wrapper}>Create a new Event</div>;
};

export default CreateEvent;
