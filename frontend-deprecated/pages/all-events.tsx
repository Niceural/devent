import React, { FunctionComponent, useState, useEffect } from "react";
import { SOLANA_HOST } from "../utils/const";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import getProgramInstance from "../utils/get-program";
import Event from "../components/Event";

type PageProps = {};

const Home: FunctionComponent<PageProps> = ({}) => {
  const style = {
    wrapper: "",
    loading: "",
    allEvents: "",
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await getAllEventsData();
    }, 2000);
    getAllEventsData();
    return () => clearInterval(interval);
  }, []);

  const wallet = useWallet();
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState(null);

  const getAllEventsData = async () => {
    try {
      const connection = new anchor.web3.Connection(SOLANA_HOST);
      const program = getProgramInstance(connection, wallet);

      const data = await program.account.eventAccount.all();
      console.log(data);
      setEventsData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  // const getEventOffChainData = async (offChainPointer: string) => {
  //   let metadataUrl;
  //   if (offChainPointer.startsWith("https://")) {
  //     metadataUrl = offChainPointer;
  //   } else {
  //     metadataUrl = "https://gateway.pinata.cloud/ipfs/".concat(
  //       offChainPointer
  //     );
  //   }
  //   return await axios.get(metadataUrl);
  // };

  return (
    <div className={style.wrapper}>
      {loading ? (
        <div className={style.loading}>Loading...</div>
      ) : (
        <div className={style.allEvents}>
          {eventsData.map(async (eventData) => {
            <Event eventData={eventData} />;
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
