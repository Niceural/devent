import * as sdk from "@niceural/devent-sdk";
import * as anchor from "@project-serum/anchor";

export const createEventArgs: sdk.CreateEvent = {
  maxRegistration: new anchor.BN("73"),
  registrationPrice: new anchor.BN("1700000000"), // 1.7 SOL
  resellAllowed: true,
  maxResellPrice: new anchor.BN("1700000000"),
  mintNftOnRegistration: true,
  mintNftOnAttendance: true,
  paused: false,
  eventData: {
    title: "Milkshake, Ministry of Sound - The Official Return 2022",
    organizer: "Milkshake",
    description:
      "Milkshake, London's Biggest Student Night. Running 20 F*cking Years Strong, Since 2002 AND AFTER A MINISTRY OF SOUND REFURBISHMENT - WE BACK! Tuesday August 16th 2022 : On Sale Now. Ministry of Sound Club, 10:30pm-Late",
    imageUrl:
      "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F319134359%2F26253177781%2F1%2Foriginal.20220715-122927?w=800&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C25%2C768%2C384&s=810957612ec7d2eb9cc5eae100b7f1ac",
    location:
      "Ministry of Sound, 103 Gaunt Street, London, SE1 6DP, United Kingdom",
    startDate: "16/08/2022",
    startTime: "23:00",
    endDate: "17/08/2022",
    endTime: "04:00",
  },
};
