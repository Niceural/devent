import React, { FunctionComponent, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Event, EventData, createEvent } from "@niceural/devent-sdk";
import { SOLANA_HOST } from "../utils/const";

type CreateEventProps = {
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setEventData: any;
};

const CreateEvent: FunctionComponent<CreateEventProps> = ({
  setSuccess,
  setEventData,
}) => {
  // states
  const wallet = useWallet();
  wallet.sign;
  // data
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxRegistration, setMaxRegistration] = useState(new anchor.BN("0"));
  const [registrationPrice, setRegistrationPrice] = useState(
    new anchor.BN("0")
  );
  const [resellAllowed, setResellAllowed] = useState(true);
  const [maxResellPrice, setMaxResellPrice] = useState(new anchor.BN("0"));
  const [mintNftOnRegistration, setMintNftOnRegistration] = useState(true);
  const [mintNftOnAttendance, setMintNftOnAttendance] = useState(true);
  const [paused, setPaused] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Creating a new event...");

    // web3 config stuff
    const connection = new anchor.web3.Connection(SOLANA_HOST);
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      anchor.AnchorProvider.defaultOptions()
    );

    // function arguments
    const eventData: EventData = {
      title: title,
      organizer: organizer,
      description: description,
      imageUrl: imageUrl,
      location: location,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
    };
    const ocEvent: Event = {
      maxRegistration: maxRegistration,
      registrationPrice: registrationPrice,
      resellAllowed: resellAllowed,
      maxResellPrice: maxResellPrice,
      mintNftOnRegistration: mintNftOnRegistration,
      mintNftOnAttendance: mintNftOnAttendance,
      paused: paused,
      eventData: eventData,
    };
    const eventInfo = await createEvent(provider, ocEvent);

    setEventData(eventInfo);
    setSuccess(true);
    console.log("done.");
  };

  // const saveFileToPinata = async () => {};

  // const saveMetadataToPinata = async () => {
  //   setOffChainMetadataUrl(
  //     "https://raw.githubusercontent.com/Niceural/devent/main/devent-program/tests/event1.json"
  //   );
  //   setOffChainSuccess(true);
  // };

  /*
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
  */

  return (
    <div className="p-3">
      <div className="pb-3 text-lg font-medium">Create a new Event</div>
      <form>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingTitle"
            id="floatingTitle"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label
            htmlFor="floatingTitle"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Title
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingOrganizer"
            id="floatingOrganizer"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={organizer}
            onChange={(event) => setOrganizer(event.target.value)}
          />
          <label
            htmlFor="floatingOrganizer"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Organizer
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingDescription"
            id="floatingDescription"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <label
            htmlFor="floatingDescription"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Description
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingImageUrl"
            id="floatingImageUrl"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <label
            htmlFor="floatingImageUrl"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Image URL
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingLocation"
            id="floatingLocation"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <label
            htmlFor="floatingLocation"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Location
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingStartDate"
            id="floatingStartDate"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <label
            htmlFor="floatingStartDate"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Start date
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingStartTime"
            id="floatingStartTime"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
          <label
            htmlFor="floatingStartTime"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Start time
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingEndDate"
            id="floatingEndDate"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <label
            htmlFor="floatingEndDate"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            End date
          </label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="floatingEndTime"
            id="floatingEndTime"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder={" "}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
          <label
            htmlFor="floatingEndTime"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            End time
          </label>
        </div>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          type="submit"
          onClick={handleSubmit}
          value="Create new event"
        />
      </form>
    </div>
  );
};

export default CreateEvent;
