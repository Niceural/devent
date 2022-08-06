import "../styles/globals.css";
import dynamic from "next/dynamic";
import Head from "next/head";
// import { WalletBalanceProvider } from "../context/useWalletBalance";
import { ModalProvider } from "react-simple-hook-modal";
import Header from "../components/Header";

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  { ssr: false }
);

function MyApp({ Component, pageProps }) {
  const style = { appWrapper: "bg-slate-900 text-amber-600" };

  return (
    <div className={style.appWrapper}>
      <Head>
        <title>devent</title>
        <meta name="description" content="devent" />
      </Head>
      <WalletConnectionProvider>
        {/* <WalletBalanceProvider> */}
        <ModalProvider>
          <Header />
          <Component {...pageProps} />
        </ModalProvider>
        {/* </WalletBalanceProvider> */}
      </WalletConnectionProvider>
    </div>
  );
}

export default MyApp;
