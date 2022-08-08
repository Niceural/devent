import { program } from "@project-serum/anchor/dist/cjs/spl/associated-token";
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
      await getAllEventsOnChainData();
    }, 2000);
    getAllEventsOnChainData();
    return () => clearInterval(interval);
  }, []);

  const wallet = useWallet();
  const [loading, setLoading] = useState(true);
  const [eventsOnChainData, setEventsOnChainData] = useState();

  const getAllEventsOnChainData = async () => {
    try {
      const connection = new anchor.web3.Connection(SOLANA_HOST);
      const program = getProgramInstance(connection, wallet);

      const data = await program.account.eventAccount.all();
      setEventsOnChainData(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getEventOffChainData = async (offChainPointer: string) => {
    let metadataUrl;
    if (offChainPointer.startsWith("https://")) {
      metadataUrl = offChainPointer;
    } else {
      metadataUrl = "https://gateway.pinata.cloud/ipfs/".concat(
        offChainPointer
      );
    }
    return await axios.get(metadataUrl);
  };

  return (
    <div className={style.wrapper}>
      {loading ? (
        <div className={style.loading}>Loading...</div>
      ) : (
        <div className={style.allEvents}>
          {eventsOnChainData.map(async (eventOnChainData) => {
            const eventOffChainData = await getEventOffChainData(
              eventOnChainData.offChainPointer
            );
            <Event
              onChainData={eventOnChainData}
              offChainData={eventOffChainData}
            />;
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
