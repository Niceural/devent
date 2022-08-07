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
  setEventData: any;
};

const CreateEvent: FunctionComponent<CreateEventProps> = ({
  setOnChainSuccess,
  setOffChainSuccess,
  setEventData,
}) => {
  // component styling
  const style = {
    wrapper: "",
  };

  // states
  const wallet = useWallet();
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

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Creating a new event...");
    await saveFileToPinata();
    await saveMetadataToPinata();
    await createOnchainEvent();
    console.log("done.");
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
        authority: wallet.publicKey as anchor.Address,
        ...defaultAccounts,
      })
      .rpc();

    const eventData = await program.account.eventAccount.fetch(eventPda);
    setEventData(eventData);
    setOnChainSuccess(true);
  };

  return (
    <div className={style.wrapper}>
      Create a new Event:
      <form className={style.form}>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={style.formInput}
          placeholder={"Title"}
        />
        Organizer
        <input
          value={organizer}
          onChange={(event) => setOrganizer(event.target.value)}
          className={style.formInput}
          placeholder={"Organizer"}
        />
        Description
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={style.formInput}
          placeholder={"Description"}
        />
        Image
        <input
          type="file"
          // value={image}
          onChange={(event) => {
            setImage(event.target.files[0]);
            // const file = event.target.files[0];
            // if (file) {
            //   const data = new FormData();
            //   data.append("file", file);
            //   setImage(data);
            // }
          }}
          className={style.formInput}
          placeholder={"Event image"}
        />
        Location
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className={style.formInput}
          placeholder={"Location"}
        />
        Start Date
        <input
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className={style.formInput}
          placeholder={"Start date"}
        />
        Start Time
        <input
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className={style.formInput}
          placeholder={"Start time"}
        />
        End Date
        <input
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className={style.formInput}
          placeholder={"End date"}
        />
        End time
        <input
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          className={style.formInput}
          placeholder={"End time"}
        />
        Registration Limit
        <input
          value={registrationLimit.toString()}
          onChange={(event) => {
            setRegistrationLimit(new anchor.BN(event.target.value));
          }}
          className={style.formInput}
          placeholder={"Maximum number of people allowed to register"}
        />
        Price in lamports
        <input
          value={minLamportsPrice
            // .div(anchor.web3.LAMPORTS_PER_SOL)
            .toString()}
          onChange={(event) => {
            const val = new anchor.BN(event.target.value);
            setMinLamportsPrice(val); // .mul(anchor.web3.LAMPORTS_PER_SOL));
          }}
          className={style.formInput}
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
