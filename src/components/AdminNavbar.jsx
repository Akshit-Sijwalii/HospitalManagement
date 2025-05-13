import { useContext } from "react";
import { AdminAppContext } from "../context/AdminAppContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const { aToken, setAToken } = useContext(AdminAppContext);
  const navigate = useNavigate();
  const logout = () => {
    navigate("/");
    aToken && setAToken("");
    aToken && localStorage.removeItem("aToken");
  };
  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <div className="flex items-center gap-2 text-xs">
        <img className="w-44 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5  py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-black text-white px-8 py-3 rounded-full font-light hidden md:block cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminNavbar;
