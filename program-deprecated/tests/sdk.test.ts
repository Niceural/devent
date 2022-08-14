import * as sdk from "@niceural/devent-sdk";
import * as anchor from "@project-serum/anchor";
import { createEventArgs } from "./assets/event1";

describe("sdk tests", () => {
  const provider = anchor.AnchorProvider.env();

  it("createEvent()", async () => {
    const expectedEventAccount: sdk.EventAccount = {};
    const actualEventAccount = await sdk.createEvent(provider, createEventArgs);
  });
  it("createRegistration()", async () => {
    sdk.createEvent();
  });
});
