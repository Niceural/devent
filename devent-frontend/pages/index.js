import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import MainView from "../components/MainView";

const style = {
  wrapper: `bg-[#18191a] min-h-screen duration-[0.5s]`,
  homeWrapper: `flex`,
  center: `flex-1`,
  main: `flex-1 flex justify-center`,
  signupContainer: `flex items-center justify-center w-screen h-[70vh]`,
};

export default function Home() {
  const wallet = useWallet();

  return (
    <div>
      <MainView />
    </div>
  );
}
