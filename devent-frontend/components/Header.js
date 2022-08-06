import React from "react";
import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

const Header = () => {
  const style = {
    wrapper: "p-1 border-b-2 flex flex-row justify-between items-center",
    headerLeft: "py-2 px-4 font-bold text-3xl",
    // webSiteName: "pb-5",
    headerRight: "p-2 flex flex-row items-center",
    page: "p-5",
  };

  return (
    <nav className={style.wrapper}>
      <div className={style.headerLeft}>
        <Link href="/">
          <a>
            <Image
              alt="logo"
              src="/../public/devent-logo.png"
              width={60}
              height={60}
            />
          </a>
        </Link>
        <div className={style.websiteName}>
          <Link href="/">
            <a>devent</a>
          </Link>
        </div>
      </div>
      <div className={style.headerRight}>
        <div className={style.page}>
          <Link href="/all-events">
            <a>All Events</a>
          </Link>
        </div>
        <div className={style.page}>
          <Link href="/create-event">
            <a>Create an Event</a>
          </Link>
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default Header;
