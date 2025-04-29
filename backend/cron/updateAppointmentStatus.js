import cron from "node-cron";
import appointmentModel from "../modules/appointmentModel.js";
import moment from "moment-timezone";

export const updateAppointmentStatus = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running Cron Job to Update Appointment Status...");
    try {
      //   const today = new Date();

      //   console.log(
      //     "Today (in Asia/Kolkata timezone, midnight):",
      //     today.getUTCDate()
      //   );

      const todayInKolkata = moment
        .tz("Asia/Kolkata")
        .add(1, "day")
        .startOf("day")
        .clone()
        .utc();
      console.log(
        "Today (in Asia/Kolkata timezone, midnight):",
        todayInKolkata.toDate()
      );

      await appointmentModel.updateMany(
        { date: { $lt: todayInKolkata.toDate() } },
        { $set: { status: "Completed" } },
        { runValidators: true }
      );

      await appointmentModel.updateMany(
        { date: todayInKolkata.toDate() },
        { $set: { status: "Ongoing" } },
        { runValidators: true }
      );

      console.log("Appointment Updated Successfully...");
    } catch (error) {
      console.error("error in updating appointment status", error);
    }
  });
};
