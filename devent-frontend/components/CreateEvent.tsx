import React, { FunctionComponent, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SOLANA_HOST } from "../utils/const";
import getProgramInstance from "../utils/get-program";
const utf8 = anchor.utils.bytes.utf8;
import Image from "next/image";

type CreateEventProps = {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setEventData: any;
};

const CreateEvent: FunctionComponent<CreateEventProps> = ({
  setSuccess,
  setEventData,
}) => {
  // component styling
  const style = {
    wrapper: "",
    form: "",
    title: "",
    organizer: "",
    description: "",
    imageUrl: "",
    image: "",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxRegistered: "",
    price: "",
    submitButton: "",
  };

  // states
  const wallet = useWallet();
  // data
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxRegistered, setMaxRegistered] = useState(new anchor.BN("0"));
  const [lamportsPrice, setLamportsPrice] = useState(new anchor.BN("0"));

  const defaultAccounts = {
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Creating a new event...");
    await createEvent();
    console.log("done.");
  };

  // const saveFileToPinata = async () => {};

  // const saveMetadataToPinata = async () => {
  //   setOffChainMetadataUrl(
  //     "https://raw.githubusercontent.com/Niceural/devent/main/devent-program/tests/event1.json"
  //   );
  //   setOffChainSuccess(true);
  // };

  const createEvent = async () => {
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
        maxRegistered,
        lamportsPrice
      )
      .accounts({
        state: statePda,
        event: eventPda,
        authority: wallet.publicKey as anchor.Address,
        ...defaultAccounts,
      })
      .rpc();
    await program.provider.connection.confirmTransaction(tx);

    const eventData = await program.account.eventAccount.fetch(eventPda);
    setEventData(eventData);
    setSuccess(true);
  };

  return (
    <div className={style.wrapper}>
      Create a new Event:
      <form className={style.form}>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={style.title}
          placeholder={"Title"}
        />
        Organizer
        <input
          value={organizer}
          onChange={(event) => setOrganizer(event.target.value)}
          className={style.organizer}
          placeholder={"Organizer"}
        />
        Description
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={style.description}
          placeholder={"Description"}
        />
        Image
        <Image className={style.image} alt="Event image" src={imageUrl} />
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className={style.imageUrl}
          placeholder={"Event image"}
        />
        Location
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className={style.location}
          placeholder={"Location"}
        />
        Start Date
        <input
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className={style.startDate}
          placeholder={"Start date"}
        />
        Start Time
        <input
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className={style.startTime}
          placeholder={"Start time"}
        />
        End Date
        <input
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className={style.endDate}
          placeholder={"End date"}
        />
        End time
        <input
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          className={style.endTime}
          placeholder={"End time"}
        />
        Registration Limit
        <input
          value={maxRegistered.toString()}
          onChange={(event) => {
            setMaxRegistered(new anchor.BN(event.target.value));
          }}
          className={style.maxRegistered}
          placeholder={"Maximum number of people allowed to register"}
        />
        Price in lamports
        <input
          value={lamportsPrice
            // .div(anchor.web3.LAMPORTS_PER_SOL)
            .toString()}
          onChange={(event) => {
            const val = new anchor.BN(event.target.value);
            setLamportsPrice(val); // .mul(anchor.web3.LAMPORTS_PER_SOL));
          }}
          className={style.price}
          placeholder={"Minimum price in lamports"}
        />
        <button
          className={style.submitButton}
          type="submit"
          onClick={handleSubmit}
          value="Create"
        />
      </form>
    </div>
  );
};

export default CreateEvent;
