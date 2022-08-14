import express from "express";
import controller from "../controllers/Ticket";
import { Schemas, ValidateJoi } from "../middleware/Joi";

const router = express.Router();

router.post(
  "/create",
  ValidateJoi(Schemas.ticket.create),
  controller.createTicket
);
router.get("/get/:ticketId", controller.readTicket);
router.get("/get", controller.readAll);
router.patch(
  "/update/:ticketId",
  ValidateJoi(Schemas.ticket.update),
  controller.updateTicket
);
router.delete("/delete/:ticketId", controller.deleteTicket);

export = router;
