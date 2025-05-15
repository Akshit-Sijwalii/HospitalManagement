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
    amount: amount * 100, 
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

  // const session = await mongoose.startSession();
  // session.startTransaction();
  await newPayment.save();

  try {
    // ✅ Book appointment only after payment verification
    const appointment = await createAppointment(appointmentData, session);


    newPayment.status = "Paid";
    newPayment.appointmentId = appointment._id;
    await newPayment.save();

    // await session.commitTransaction();
    // session.endSession();
    return res.status(200).json({ status: "success", data: appointment });
  } catch (error) {
    await newPayment.save();
    // await session.abortTransaction();
    // session.endSession();

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

//refund payment
export const refund = async(req,res)=>{

  const { paymentId, amounts} = req.body;
  if (!paymentId || !amounts) {
    return res.status(400).json({ success: false, message: "Payment ID required" });
  }

  // Optional: Specify refund amount (in paise). Omit for full refund.
  const refundData = {
    amount: amounts, // e.g., ₹50 = 5000 paise. Omit for full refund.
    speed: "optimum", // or "instant" for instant refund (may have extra charges)
    notes: {
      reason: "Testing refund"
    }
  };
  
  // Create refund
  try {
    const refund = await razorpay.payments.refund(paymentId, refundData);
    console.log("Refund successful:", refund);

    if (refund.status === "processed") {
      const result = await paymentModel.updateOne(
        { paymentId: paymentId }, 
        { $set: { status: "refund" } }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Payment not found in DB" });
      }
  
      return res.status(200).json({ success: true, message: "Refund successful", refund });
    } else {
      console.log("Refund failed");
      return res.status(400).json({
        success: false,
        message: "Refund failed. Please contact support.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Refund failed:", error);
    return res.status(400).json({
      success: false,
      message: "Refund failed. Please contact support.",
      error: error.message,
    });
  }

};
