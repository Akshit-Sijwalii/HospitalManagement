import { useContext, useEffect } from "react";
import { AdminAppContext } from "../../context/AdminAppContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllApointment = () => {
  const { aToken, appointments, getAllAppointments , cancelAppointment} =
    useContext(AdminAppContext);
  const { calculateAge, slotDateFormat, currencySymbol } =
    useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);
  return (
    <div className="w-full m-5 max-w-6xl">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>
        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] item-center text-gray-500 py-3 px-6 border-b gover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <p className=" flex items-center gap-2 max-sm:hidden">
              {calculateAge(item.userData.dob)}
            </p>
            <p className="flex items-center gap-2">
              {slotDateFormat(item.slotDate)},&nbsp;{item.slotTime}
            </p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item.docData.image}
                alt=""
              />
              <p className="flex items-center gap-2">{item.docData.name}</p>
            </div>
            <p className="flex items-center gap-2">
              {currencySymbol}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className=" flex items-center text-red-400 text-xs font-medium">Cancelled</p>
            ) : (
              <img onClick={() => {cancelAppointment(item._id)}}
                className=" flex items-center w-12 cursor-pointer"
                src={assets.cancel_icon}
                alt=""
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllApointment;
