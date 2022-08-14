import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  pubkey: string;
  // firstName: string;
  // lastName: string;
  // profileImageUrl: string;
  // dateOfBirth: string;
  // mobilePhone: string;
  // jobTitle: string;
  // homeAddress: string;
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    pubkey: { type: String, required: true },
    // firstName: { type: String },
    // lastName: { type: String },
    // profileImageUrl: { type: String },
    // dateOfBirth: { type: String },
    // mobilePhone: { type: String },
    // jobTitle: { type: String },
    // homeAddress: { type: String },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IUserModel>("User", UserSchema);
