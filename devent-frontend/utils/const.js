import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import devent from "./devent.json";

export const DEBUG_LOG = true;

export const CLUSTER =
  process.env.REACT_APP_CLUSTER === "mainnet"
    ? "mainnet"
    : process.env.REACT_APP_CLUSTER === "testnet"
    ? "testnet"
    : "devnet";

export const SOLANA_HOST = process.env.REACT_APP_SOLANA_API_URL
  ? process.env.REACT_APP_SOLANA_API_URL
  : CLUSTER === "mainnet"
  ? clusterApiUrl("mainnet-beta")
  : CLUSTER === "testnet"
  ? clusterApiUrl("devnet")
  : "https://api.devnet.solana.com";

export const STABLE_POOL_PROGRAM_ID = new PublicKey(
  "59sCeP718NpdHv3Xj6kjgrmGNEt67BNXFcy5VUBUDhJE"
);

export const STABLE_POOL_IDL = devent;
