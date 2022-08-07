import * as anchor from "@project-serum/anchor";
import React, { useState, FunctionComponent } from "react";
import CreateEvent from "../components/CreateEvent";
import Event from "../components/Event";

type PageProps = {};

const Home: FunctionComponent<PageProps> = ({}) => {
  const style = { wrapper: "", event: "", createEvent: "" };

  const [onChainSuccess, setOnChainSuccess] = useState(false);
  const [offChainSuccess, setOffChainSuccess] = useState(false);
  const [eventIndex, setEventIndex] = useState(new anchor.BN("0"));

  return (
    <div className={style.wrapper}>
      {onChainSuccess && offChainSuccess ? (
        <div className={style.event}>
          <Event eventIndex={eventIndex} />
        </div>
      ) : (
        <div className={style.createEvent}>
          <CreateEvent
            setOnChainSuccess={setOnChainSuccess}
            setOffChainSuccess={setOffChainSuccess}
            setEventIndex={setEventIndex}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
