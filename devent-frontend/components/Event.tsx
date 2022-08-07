import React, { FunctionComponent } from "react";

type EventProps = {
  eventData: any;
};

const Event: FunctionComponent<EventProps> = ({ eventData }) => {
  const style = {
    wrapper: "",
  };

  return <div className={style.wrapper}>Event:</div>;
};

export default Event;
