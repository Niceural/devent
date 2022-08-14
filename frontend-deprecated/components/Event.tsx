import React, { FunctionComponent, useState } from "react";
import * as anchor from "@project-serum/anchor";
import Image from "next/image";
import { EventAccount } from "@niceural/devent-sdk";

type EventProps = {
  eventAccount: EventAccount;
};

const Event: FunctionComponent<EventProps> = ({ eventAccount }) => {
  return (
    <div className="">
      <Image
        className=""
        alt="event image"
        src={eventAccount.eventData.imageUrl}
      />
      <div className="">Title: {eventAccount.eventData.title}</div>
      <div className="">Organizer: {eventData.organizer}</div>
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
