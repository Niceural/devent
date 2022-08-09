import React, { FunctionComponent } from "react";
import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

type HeaderProps = {};

const Header: FunctionComponent<HeaderProps> = ({}) => {
  const style = {
    wrapper: "p-5 bg-dark shadow",
  };

  return (
    <nav className={style.wrapper}>
      <div className={style.headerLeft}>
        <Link href="/">
          <a>
            <Image
              alt="logo"
              src="/images/devent-logo.png"
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
