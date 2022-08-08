import React, { FunctionComponent, useState } from "react";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import Image from "next/image";

type EventData = {
  title: string;
  organizer: string;
  imageUrl: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  authority: anchor.Address;
  index: anchor.BN;
  maxRegistered: anchor.BN;
  registrationCount: anchor.BN;
  lamportsPrice: anchor.BN;
};

type EventProps = {
  eventData: EventData;
};

const Event: FunctionComponent<EventProps> = ({ eventData }) => {
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
    tickets: "",
  };

  return (
    <div className={style.wrapper}>
      <div className={style.title}>Title: {eventData.title}</div>
      <Image
        className={style.image}
        alt="Event image"
        src={eventData.imageUrl}
      />
      <div className={style.organizer}>Organizer: {eventData.organizer}</div>
      <div className={style.description}>
        Description: {eventData.description}
      </div>
      <div className={style.location}>Location: {eventData.location}</div>
      <div className={style.startDate}>Start date: {eventData.startDate}</div>
      <div className={style.startTime}>Start time: {eventData.startTime}</div>
      <div className={style.endDate}>End date: {eventData.endDate}</div>
      <div className={style.endTime}>End time: {eventData.endTime}</div>
      <div className={style.price}>
        Price: {eventData.lamportsPrice.toString()}
      </div>
      <div className={style.tickets}>Tickets left:</div>
    </div>
  );
};

export default Event;
