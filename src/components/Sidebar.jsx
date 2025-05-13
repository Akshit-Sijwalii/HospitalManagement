import { useContext } from "react";
import { AdminAppContext } from "../context/AdminAppContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const { aToken } = useContext(AdminAppContext);
  return (
    <div className="min-h-screen bg-white">
      {aToken && (
        <ul className="text-gray-600 mt-4">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-100 border-r-4 border-black rounded-md " : ""
              }`
            }
            to={"/admin-dashboard"}
          >
            <img src={assets.home_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-100 border-r-4 border-black rounded-md " : ""
              }`
            }
            to={"/all-appointment"}
          >
            <img src={assets.appointment_icon} alt="" />
            <p>Appointment</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-100 border-r-4 border-black rounded-md " : ""
              }`
            }
            to={"/add-doctor"}
          >
            <img src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-gray-100 border-r-4 border-black rounded-md " : ""
              }`
            }
            to={"/doctor-list"}
          >
            <img src={assets.people_icon} alt="" />
            <p>Doctor List</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
