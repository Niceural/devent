import React, { useEffect, useState } from "react";
// import {TOKEN_PROGRAM_ID} from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react";
import { SOLANA_HOST } from "../utils/const";
import { getProgramInstance } from "../utils/get-program";
import Event from "../components/Event";

const anchor = require("@project-serum/anchor");
const { BN, web3 } = anchor;
const utf8 = anchor.utils.bytes.utf8;
const { SystemProgram } = web3;

export default function Home() {
  const style = {};

  const wallet = useWallet();
  const connection = new web3.Connection(SOLANA_HOST);
  const program = getProgramInstance(connection, wallet);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      await getAllEvents();
    }, 2000);
    getAllEvents();
    return () => clearInterval(interval);
  }, [getAllEvents]);

  const getAllEvents = async () => {
    try {
      const eventsData = await program.account.eventAccount.all();
      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={style.wrapper}>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {events.map((event) => (
              <Event key={event.account.index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
