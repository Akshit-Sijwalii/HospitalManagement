import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authUser } from "../middlewares/authUser.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create-order",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  //   authUser,
  createPaymentOrder
);
paymentRouter.post("/verify-payment", verifyPayment);

export default paymentRouter;
