import axios from "axios";
import * as anchor from "@project-serum/anchor";

const API_URL = "http://localhost:1337/";

async function createUser(pubkey: string) {
  const url = API_URL.concat("users/create");
  try {
    const response = await axios.post(url, {
      pubkey: pubkey,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  const organizerKeypair = anchor.web3.Keypair.generate();

  // create user
  const response = await createUser(organizerKeypair.publicKey.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
