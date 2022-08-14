import mongoose, { Document, Schema } from "mongoose";

export interface ITicketBatch {
  name: String;
  symbol: String;
  description: String;
  location: String;
  dates: String;
}

export interface ITicketBatchModel extends ITicketBatch, Document {}

const TicketBatchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String },
    description: { type: String },
    location: { type: String },
    dates: { type: String },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<ITicketBatchModel>(
  "TicketBatch",
  TicketBatchSchema
);
