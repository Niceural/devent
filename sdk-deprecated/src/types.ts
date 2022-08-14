import * as anchor from "@project-serum/anchor";

export interface StateAccount {
  authority: anchor.Address;
  eventCount: anchor.BN;
}

export interface EventData {
  title: string;
  organizer: string;
  description: string;
  imageUrl: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface EventAccount {
  authority: anchor.Address;
  index: anchor.BN;
  maxRegistration: anchor.BN;
  registrationCount: anchor.BN;
  registrationPrice: anchor.BN;
  resellAllowed: boolean;
  maxResellPrice: anchor.BN;
  mintNftOnRegistration: boolean;
  mintNftOnAttendance: boolean;
  paused: boolean;
  eventData: EventData;
}

export interface CreateEvent {
  maxRegistration: anchor.BN;
  registrationPrice: anchor.BN;
  resellAllowed: boolean;
  maxResellPrice: anchor.BN;
  mintNftOnRegistration: boolean;
  mintNftOnAttendance: boolean;
  paused: boolean;
  eventData: EventData;
}
