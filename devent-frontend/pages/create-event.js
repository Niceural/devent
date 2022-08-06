import * as anchor from "@project-serum/anchor";
import React, { useEffect, useState } from "react";
import CreateEvent from "../components/CreateEvent";
import Event from "../components/Event";

export default function Home() {
  const style = { formWrapper: "flex flex-row", submitButton: "invisible" };

  const [successOnChain, setSuccessOnChain] = useState(false);
  const [successOffChain, setSuccessOffChain] = useState(false);
  const [onChainEventAddress, setOnChainEventAddress] = useState(
    anchor.web3.PublicKey.default
  );

  return (
    <div className={style.wrapper}>
      {successOnChain && successOffChain ? (
        <div>
          <Event onChainEventAddress={onChainEventAddress} />
        </div>
      ) : (
        <div>
          <CreateEvent
            setOnChainEventAddress={setOnChainEventAddress}
            setSuccessOnChain={setSuccessOnChain}
            setSuccessOffChain={setSuccessOffChain}
          />
        </div>
      )}
    </div>
  );
}
