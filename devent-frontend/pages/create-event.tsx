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

  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState();

  return (
    <div className={style.wrapper}>
      {success ? (
        <div className={style.event}>
          <Event eventData={eventData} />
        </div>
      ) : (
        <div className={style.createEvent}>
          <CreateEvent setSuccess={setSuccess} setEventData={setEventData} />
        </div>
      )}
    </div>
  );
};

export default Home;
