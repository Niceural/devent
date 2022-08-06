import { createContext } from "react";

export const DeventContext = createContext();

export const DeventProvider = ({ children }) => {
  const requestToCreateUserProfile = async (walletAddress, name) => {
    try {
      await fetch(`/api/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWalletAddress: walletAddress,
          name: name,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DeventContext.Provider
      value={{
        requestToCreateUserProfile,
      }}
    >
      {children}
    </DeventContext.Provider>
  );
};
