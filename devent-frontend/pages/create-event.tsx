import React, { useState, FunctionComponent } from "react";
import CreateEvent from "../components/CreateEvent";
import Event from "../components/Event";

type PageProps = {};

const Home: FunctionComponent<PageProps> = ({}) => {
  const style = {
    wrapper: "",
    event: "",
    createEvent: "",
  };

  const [onChainSuccess, setOnChainSuccess] = useState(false);
  const [offChainSuccess, setOffChainSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);

  return (
    <div className={style.wrapper}>
      {onChainSuccess && offChainSuccess ? (
        <div className={style.event}>
          <Event eventData={eventData} />
        </div>
      ) : (
        <div className={style.createEvent}>
          <CreateEvent
            setOnChainSuccess={setOnChainSuccess}
            setOffChainSuccess={setOffChainSuccess}
            setEventData={setEventData}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
