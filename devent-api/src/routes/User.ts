import express from "express";
import controller from "../controllers/User";
import { Schemas, ValidateJoi } from "../middleware/Joi";

const router = express.Router();

router.post("/create", ValidateJoi(Schemas.user.create), controller.createUser);
router.get("/get/:userId", controller.readUser);
router.get("/get", controller.readAll);
router.patch(
  "/update/:userId",
  ValidateJoi(Schemas.user.update),
  controller.updateUser
);
router.delete("/delete/:userId", controller.deleteUser);

export = router;
