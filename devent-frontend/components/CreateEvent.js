import React, { useState } from "react";
import Image from "next/image";
import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { SOLANA_HOST } from "../utils/const";
import { getProgramInstance } from "../utils/get-program";
import FormData from "form-data";
import axios from "axios";
import { DEBUG_LOG as log } from "../utils/const";
// import pinataSDK from "@pinata/sdk";
// import fs from "fs";

// const pinataApiKey = process.env.PINATA_API_KEY || "";
// const pinataApiSecret = process.env.PINATA_API_SECRET || "";
// const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

const CreateEvent = ({
  setOnChainEventAddress,
  setSuccessOnChain,
  setSuccessOffChain,
}) => {
  const style = {
    wrapper: "flex flex-col grid-cols-1",
    submitButton: "h-6 w-6 text-white",
  };

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

  const handleSubmit = async (event) => {
    console.log("Creating a new event...");
    event.preventDefault();
    await saveFileToPinata();
    await saveMetadataToPinata();
    await createOnChainEvent();
    console.log("done.");
  };

  const saveFileToPinata = async () => {
    console.log("Saving image to Pinata...");
    try {
      if (image) {
        const data = new FormData();
        data.append("file", image.stream());
        // data.append("pinataOptions", '{"cidVersion": 1}');
        // data.append(
        //   "pinataMetadata",
        //   '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}'
        // );

        const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
        const pinataApiKey =
        const pinataSecretApiKey =
          process.env.REACT_APP_PINATA_API_SECRET ||

        const response = await axios.post(url, data, {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            pinata_secret_api_key:
          },
        });
        console.log(response);
        setImageUrl(response.IpfsHash);
        console.log("\tdone.");
      }
    } catch (error) {
      console.log(error);
    }
    setImageUrl(
      "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F319134359%2F26253177781%2F1%2Foriginal.20220715-122927?w=800&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C25%2C768%2C384&s=810957612ec7d2eb9cc5eae100b7f1ac"
    );
  };

  const saveMetadataToPinata = async () => {
    /*
    console.log("Saving metadata to Pinata...");
    const data = JSON.stringify({
      // pinataOptions: {
      //   cidVersion: 1,
      // },
      // pinataMetadata: {
      //   name: "testing",
      //   keyvalues: {
      //     customKey: "customValue",
      //     customKey2: "customValue2",
      //   },
      // },
      pinataContent: {
        title: title,
        organizer: organizer,
        imageUrl: imageUrl,
        description: description,
        location: location,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        registrationLimit: registrationLimit.toString(),
        minLamportsPrice: minLamportsPrice.toString(),
      },
    });
    console.log(data);

    const config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        pinata_secret_api_key:
      },
      data: data,
    };

    const response = await axios(config);
    console.log(response);
    setOffChainMetadataUrl(response.IpfsHash);
    setSuccessOffChain(true);
    console.log("\tdone.");
    */
    setOffChainMetadataUrl(
      "https://gateway.pinata.cloud/ipfs/QmZnffHm373A9A77Dcxq2JPrRQQRGbvWPCjywSF3BoTwwy"
    );
    setSuccessOffChain(true);
  };

  const createOnChainEvent = async () => {
    if (log) {
      console.log("Creating on chain event...");
    }

    // web3 config stuff
    const connection = new anchor.web3.Connection(SOLANA_HOST);
    const program = getProgramInstance(connection, wallet);

    console.log("Getting state signer...");
    let [stateSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("state")],
      program.programId
    );
    console.log(`State signer: ${stateSigner}`);
    let stateInfo;
    try {
      console.log("Getting state info...");
      stateInfo = await program.account.fetch(stateSigner);
    } catch (error) {
      console.log(error);
      console.log("State has not been created. Creating state...");
      await program.methods
        .createState()
        .accounts({ state: stateSigner, authority: wallet.publicKey })
        .signers([stateSigner])
        .rpc();
      // setSuccessOnChain(false);
      // return;
    }

    console.log("Getting event signer...");
    let [eventSigner] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("event"),
        stateInfo.eventCount.toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );
    console.log(`Event signer: ${eventSigner}`);
    try {
      console.log("Fetching EventAccount...");
      await program.account.eventAccount.fetch(eventSigner);
    } catch (error) {
      console.log("No EventAccount found. Creating event account...");
      console.log(error);
      await program.methods
        .createEvent(offChainMetadataUrl, registrationLimit, minLamportsPrice)
        .accounts({
          state: stateSigner,
          event: eventSigner,
          authority: wallet.publicKey,
        })
        .signers([eventSigner])
        .rpc();
    }

    setOnChainEventAddress(eventSigner);
    setSuccessOnChain(true);
    console.log("done.");
  };

  return (
    <div className={style.wrapper}>
      Create a new event:
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
