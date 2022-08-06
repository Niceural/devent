import React, { useState, useEffect } from "react";
import Image from "next/image";

const Event = ({ onChainEventAddress }) => {
  const style = {};

  const [loading, setLoading] = useState(true);
  const wallet = useWallet();
  // off chain data
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  // const [image, setImage] = useState(new FormData());
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

  const getEventData = async () => {
    console.log("Getting event data...");
    const connection = new anchor.web3.Connection(SOLANA_HOST);
    const program = getProgramInstance(connection, wallet);

    let eventData;
    try {
      eventData = await program.account.eventAccount.fetch(onChainEventAddress);
    } catch (error) {
      console.log(error);
    }
    setOffChainMetadataUrl(eventData.metadataUrl);
    setRegistrationLimit(eventData.registrationLimit);
    setMinLamportsPrice(eventData.minLamportsPrice);

    setLoading(true);
    console.log("done.");
  };

  return (
    <div className={style.wrapper}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Image
            src={imageUrl}
            className={style.eventImage}
            height={44}
            width={44}
            alt="event image"
          />
          <div className={style.title}>{title}</div>
          <div className={style.description}>{description}</div>
          <div className={style.index}>{index}</div>
        </div>
      )}
    </div>
  );
};

export default Event;
