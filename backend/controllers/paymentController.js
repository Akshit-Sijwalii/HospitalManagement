import mongoose from "mongoose";
import { createAppointment } from "../services/create-appointment.js";
import paymentModel from "../modules/paymentModel.js";

import Razorpay from "razorpay";
import crypto from "crypto";
import { checkAvailiablityBeforePayment } from "../services/check-appointment.js";

// Replace with your Razorpay credentials
const razorpay = new Razorpay({
  key_id: "rzp_test_gVz2UgymfCtEEb",
  key_secret: "OfQoPALFuu8TJJVuf0rPXE6F",
});

// Create Order
export const createPaymentOrder = async (req, res) => {
  const { amount, currency = "INR", receipt, appointmentData } = req.body;

  const options = {
    amount: amount * 100, // amount in smallest currency unit
    currency,
    receipt,
  };
  console.log(options);

  try {
    const availability = await checkAvailiablityBeforePayment(appointmentData);

    console.log(availability);

    if (!availability.success) {
      return res.status(availability.code).json({
        success: false,
        message: availability.message,
      });
    }
    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    appointmentData,
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", "OfQoPALFuu8TJJVuf0rPXE6F")
    .update(sign.toString())
    .digest("hex");

  if (expectedSignature != razorpay_signature) {
    res.status(400).send({ status: "failure", message: "Invalid signature" });
  }

  const newPayment = new paymentModel({
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    signature: razorpay_signature,
    amount: amount, // ideally send from frontend
    currency: "INR",
    status: "Pending",
    method: "Razorpay",
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  await newPayment.save({ session });

  try {
    // ✅ Book appointment only after payment verification
    const appointment = await createAppointment(appointmentData, session);

    // ✅ You can also store payment info in DB here if needed
    newPayment.status = "Paid";
    newPayment.appointmentId = appointment._id;
    await newPayment.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ status: "success", data: appointment });
  } catch (error) {
    await newPayment.save({ session });
    await session.abortTransaction();
    session.endSession();

    await paymentModel.findByIdAndUpdate(newPayment._id, {
      status: "Failed",
    });
    return res.status(400).json({
      status: "failure",
      message:
        "Payment succeeded but appointment booking failed. Please contact support.",
    });
  }
};
