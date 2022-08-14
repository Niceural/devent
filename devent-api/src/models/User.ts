import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  pubkey: string;
  //   firstName: string;
  //   lastName: string;
  //   dateOfBirth: string;
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    pubkey: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IUserModel>("User", UserSchema);
