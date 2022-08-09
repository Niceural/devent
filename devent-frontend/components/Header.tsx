import React, { FunctionComponent } from "react";
import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

type HeaderProps = {};

const Header: FunctionComponent<HeaderProps> = ({}) => {
  const style = {
    nav: "bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900 border-b-2",
    wrapper: "container flex flex-wrap justify-between items-center mx-auto",
    left: "flex items-center",
    logo: "mr-3 h-6 sm:h-9",
    websiteName:
      "self-center pl-3 text-xl font-semibold whitespace-nowrap dark:text-white",
    leftButton:
      "inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600",
    right: "hidden w-full md:block md:w-auto",
    listRight:
      "flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700",
    home: "block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white",
    createEvent:
      "block py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent",
    allEvents:
      "block py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent",
    about:
      "block py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent",
  };

  return (
    <nav className={style.nav}>
      <div className={style.wrapper}>
        <a href="/" className={style.left}>
          <Image
            className={style.logo}
            alt="logo"
            src="/images/devent-logo.png"
            width={50}
            height={50}
          />
          <span className={style.websiteName}>Devent</span>
        </a>
        {/* <button
          data-collapse-toggle="navbar-default"
          type="button"
          className={style.leftButton}
          aria-controls="navbar-default"
          aria-expanded="false"
        >
          <span className={style.}>Open main menu</span>
          <svg className={style.} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path</svg>
        </button> */}
        <div className={style.right} id="navbar-default">
          <ul className={style.listRight}>
            <li>
              <a href="/create-event/" className={style.createEvent}>
                Create a new Event
              </a>
            </li>
            <li>
              <a href="/all-events/" className={style.allEvents}>
                All Events
              </a>
            </li>
            <li>
              <a href="/" className={style.about}>
                About
              </a>
            </li>
            <li>
              <WalletMultiButton />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
