import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import dynamic from "next/dynamic";
import { ModalProvider } from "react-simple-hook-modal";
import Header from "../components/Header";

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  const style = {
    wrapper: "bg-black",
  };

  return (
    <div className={style.wrapper}>
      <Head>
        <title>devent</title>
        <meta name="description" content="devent" />
      </Head>
      <WalletConnectionProvider>
        <ModalProvider>
          <Header />
          <Component {...pageProps} />
        </ModalProvider>
      </WalletConnectionProvider>
    </div>
  );
}

export default MyApp;
