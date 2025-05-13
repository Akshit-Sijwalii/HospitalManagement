import { useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";

// import { AdminAppContext } from "../context/AdminAppContext";
const Appointment = () => {
  const { docId } = useParams();
  const {
    doctors,
    currencySymbol,
    paymentOrder,
    appointments,
    createOrderPayment,
    verifyOrderPayment,
    setPaymentOrder,
  } = useContext(AppContext);
  // const { paymentOrder } = useContext(AdminAppContext);
  const daysOfweek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [docInfo, setDocInfo] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [docSlots, setDocSlots] = useState([]);

  const fetchDocInfo = useCallback(() => {
    const docInfo = doctors.find((doc) => doc._id == docId);
    setDocInfo(docInfo);
    console.log(docInfo);
  }, [doctors, docId]);

  const getAvailableSlots = async () => {
    if (!docInfo || !docInfo.available_slots) return;
    setDocSlots([]);

    const availableDaysMap = docInfo.available_slots.reduce((acc, slot) => {
      acc[slot.day.toLowerCase()] = {
        from: parseTimeString(slot.from),
        to: parseTimeString(slot.to),
      };
      return acc;
    }, {});

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dayOfWeek = currentDate
        .toLocaleString("en-US", {
          weekday: "long",
        })
        .toLowerCase();

      const availableSlot = availableDaysMap[dayOfWeek];
      let timeSlots = [];

      if (availableSlot) {
        let slotTime = new Date(currentDate);
        slotTime.setHours(
          availableSlot.from.getHours(),
          availableSlot.from.getMinutes(),
          0,
          0
        );

        let slotEndTime = new Date(currentDate);
        slotEndTime.setHours(
          availableSlot.to.getHours(),
          availableSlot.to.getMinutes(),
          0,
          0
        );

        while (slotTime < slotEndTime) {
          const formattedTime = slotTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();
          const slotDate = `${day}_${month}_${year}`;

          const isSlotAvailable =
            !docInfo?.slot_booked?.[slotDate]?.includes(formattedTime);

          if (isSlotAvailable) {
            timeSlots.push({
              datetime: slotTime,
              time: formattedTime,
            });
          }

          slotTime.setMinutes(slotTime.getMinutes() + 30);
        }
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const parseTimeString = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const bookAppointment = async () => {
    console.log("done");

    const bookingDate = docSlots[slotIndex][0].datetime;
    console.log("booking date");
    console.log(bookingDate);
    // Convert to UTC Date with time 00:00:00

    const date = new Date(bookingDate);

    await createOrderPayment(docInfo.fees, "INR", "appointment_001", {
      doctorId: docInfo._id,
      patientId: "6813235480a86c9b4d893913",
      bookingDate: formatDate(date),
      startTime: convertAndAddTime(slotTime),
      endTime: convertAndAddTime(slotTime, true),
    });
    console.log("payment order id:");
    console.log(paymentOrder);
  };

  useEffect(() => {
    if (paymentOrder) {
      const options = {
        key: "rzp_test_gVz2UgymfCtEEb", // from Razorpay Dashboard
        amount: paymentOrder.amount, // in paisa
        currency: "INR",
        name: "Unthinkable Solution",
        description: "Doctor/Service appointment",
        order_id: paymentOrder.id,
        handler: async function (response) {
          const bookingDate = docSlots[slotIndex][0].datetime;
          const date = new Date(bookingDate);
          try {
            await verifyOrderPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              paymentOrder.amount,
              {
                doctorId: docInfo._id,
                patientId: "6813235480a86c9b4d893913",
                bookingDate: formatDate(date),
                startTime: convertAndAddTime(slotTime),
                endTime: convertAndAddTime(slotTime, true),
                reason: "Fever and headache",
              }
            );
          } catch (error) {
            if (error.response && error.response.data) {
              console.log("backend error->", error.response.data);
              toast.error(
                error.response.data.message || "Server returned an error"
              );
            } else {
              console.log("axios/network error->", error.message);
              toast.error("Network or unexpected error: " + error.message);
            }
          }
        },
        prefill: {
          name: "Hospital Management",
          email: "hospital@management.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentOrder();
    }
  }, [paymentOrder]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const convertAndAddTime = (time12h, isEnd = false) => {
    // Convert 12-hour format to 24-hour Date object
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // Create a Date object and add 30 minutes
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(isEnd ? minutes + 30 : minutes);

    // Get updated time in 24-hour format
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  // const getAvailableSlots = async () => {
  //   setDocSlots([]);

  //   // getting current date

  //   let today = new Date();
  //   for (let i = 0; i < 7; i++) {
  //     // getting date with index
  //     let currentDate = new Date(today);
  //     currentDate.setDate(today.getDate() + i);
  //     //setting time of the date with the index
  //     let endTime = new Date();
  //     endTime.setDate(today.getDate() + i);
  //     endTime.setHours(20, 0, 0, 0);

  //     /// setting hours
  //     if (today.getDate() === currentDate.getDate()) {
  //       currentDate.setHours(
  //         currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
  //       );
  //       currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
  //     } else {
  //       currentDate.setHours(10);
  //       currentDate.setMinutes(0);
  //     }
  //     let timeSlots = [];

  //     while (currentDate < endTime) {
  //       let formattedTime = currentDate.toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //       });

  //       let day = currentDate.getDate();
  //       let month = currentDate.getMonth() + 1;
  //       let year = currentDate.getFullYear();

  //       const slotDate = day + "_" + month + "_" + year;

  //       const slotTime = formattedTime;

  //       const isSlotAvailable = docInfo?.slot_booked?.[slotDate]?.includes(
  //         slotTime
  //       )
  //         ? false
  //         : true;

  //       if (isSlotAvailable) {
  //         timeSlots.push({
  //           datetime: new Date(currentDate),
  //           time: formattedTime,
  //         });
  //       }

  //       // Increase current time by 30 minutes
  //       currentDate.setMinutes(currentDate.getMinutes() + 30);
  //     }
  //     setDocSlots((prev) => [...prev, timeSlots]);
  //   }
  // };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);
  return (
    docInfo && (
      <div>
        {/*------------------------Doctor Details--------------------------------------*/}
        <div className="flex flex-col sm:flex-row gap-4 ">
          <div>
            <img
              className="bg-blue-100 w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt[-80px] sm:mt-0">
            {/*----------------Doc Info : name, degree, experincce----------------------------- */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button>{docInfo.experience}</button>
            </div>
            {/*------------------------ Doctor Details----------------------------------------------------- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3 ">
                About <img src={assets.info_icon} />
              </p>
              <p className="text-sm text-gray-500 max-wm[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>
        {/*------------------------Booking Slots--------------------------------------*/}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Bookig Slots</p>
          <div className="flex  gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-blue-100 text-black-400"
                      : "border border-blue-200 "
                  }`}
                  key={index}
                >
                  {!item[0] ? (
                    <p className="text-center text-red-500 py-3 min-w-16 rounded-full">
                      Closed
                    </p>
                  ) : (
                    <>
                      <p>{daysOfweek[item[0].datetime.getDay()]}</p>
                      <p>{item[0].datetime.getDate()}</p>
                    </>
                  )}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 mt-4 w-full overflow-x-scroll ">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-blue-100 text-black-400"
                      : "text-black-400 border border-blue-200"
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-blue-100 text-black-400 font-bold text-lg font-light px-14 py-3 rounded-full my-6 cursor-pointer"
          >
            Book an appointmment
          </button>
        </div>
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
