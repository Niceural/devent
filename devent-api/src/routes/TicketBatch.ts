import express from "express";
import controller from "../controllers/TicketBatch";
import { Schemas, ValidateJoi } from "../middleware/Joi";

const router = express.Router();

router.post(
  "/create",
  ValidateJoi(Schemas.ticketBatch.create),
  controller.createTicketBatch
);
router.get("/get/:ticketBatchId", controller.readTicketBatch);
router.get("/get", controller.readAll);
router.patch(
  "/update/:ticketBatchId",
  ValidateJoi(Schemas.ticketBatch.update),
  controller.updateTicketBatch
);
router.delete("/delete/:ticketBatchId", controller.deleteTicketBatch);

export = router;
