import React, { FunctionComponent, useState } from "react";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import Image from "next/image";

type OnChainData = {
  authority: anchor.Address;
  index: anchor.BN;
  metadataPointer: string;
  registrationLimit: anchor.BN;
  registrationCount: anchor.BN;
  minLamportsPrice: anchor.BN;
};

type OffChainData = {
  title: string;
  organizer: string;
  imageUrl: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

type EventProps = {
  onChainData: OnChainData;
  offChainData: OffChainData;
};

const Event: FunctionComponent<EventProps> = ({
  onChainData,
  offChainData,
}) => {
  const style = {
    wrapper: "",
    title: "",
    image: "",
    organizer: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    price: "",
  };

  return (
    <div className={style.wrapper}>
      <div className={style.title}>Title: {offChainData.title}</div>
      <Image
        className={style.image}
        alt="Event image"
        src={offChainData.imageUrl}
      />
      <div className={style.organizer}>Organizer: {offChainData.organizer}</div>
      <div className={style.description}>
        Description: {offChainData.description}
      </div>
      <div className={style.location}>Location: {offChainData.location}</div>
      <div className={style.startDate}>
        Start date: {offChainData.startDate}
      </div>
      <div className={style.startTime}>
        Start time: {offChainData.startTime}
      </div>
      <div className={style.endDate}>End date: {offChainData.endDate}</div>
      <div className={style.endTime}>End time: {offChainData.endTime}</div>
      <div className={style.price}>
        Price: {onChainData.minLamportsPrice.toString()}
      </div>
    </div>
  );
};

export default Event;
