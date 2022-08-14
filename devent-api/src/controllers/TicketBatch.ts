import { NextFunction, Request, Response } from "express";
import * as anchor from "@project-serum/anchor";
import mongoose from "mongoose";
import TicketBatch from "../models/TicketBatch";

const createTicketBatch = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  const mintKeypair = anchor.web3.Keypair.generate();

  const ticketBatch = new TicketBatch({
    _id: new mongoose.Types.ObjectId(),
    name,
  });
  return ticketBatch
    .save()
    .then((ticketBatch) => res.status(201).json({ ticketBatch }))
    .catch((error) => res.status(500).json({ error }));
};

const readTicketBatch = (req: Request, res: Response, next: NextFunction) => {
  const ticketBatchId = req.params.ticketBatchId;
  return TicketBatch.findById(ticketBatchId)
    .then((ticketBatch) =>
      ticketBatch
        ? res.status(200).json({ ticketBatch })
        : res.status(404).json({ message: "Not found." })
    )
    .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
  return TicketBatch.find()
    .then((ticketBatches) => res.status(200).json({ ticketBatches }))
    .catch((error) => res.status(500).json({ error }));
};

const updateTicketBatch = (req: Request, res: Response, next: NextFunction) => {
  const ticketBatchId = req.params.ticketBatchId;

  return TicketBatch.findById(ticketBatchId)
    .then((ticketBatch) => {
      if (ticketBatch) {
        ticketBatch.set(req.body);

        return ticketBatch
          .save()
          .then((ticketBatch) => res.status(201).json({ ticketBatch }))
          .catch((error) => res.status(500).json({ error }));
      } else {
        return res.status(404).json({ message: "not found" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

const deleteTicketBatch = (req: Request, res: Response, next: NextFunction) => {
  const ticketBatchId = req.params.ticketBatchId;

  return TicketBatch.findByIdAndDelete(ticketBatchId)
    .then((ticketBatch) =>
      ticketBatch
        ? res.status(201).json({ ticketBatch, message: "Deleted" })
        : res.status(404).json({ message: "not found" })
    )
    .catch((error) => res.status(500).json({ error }));
};

export default {
  createTicketBatch,
  readTicketBatch,
  readAll,
  updateTicketBatch,
  deleteTicketBatch,
};
