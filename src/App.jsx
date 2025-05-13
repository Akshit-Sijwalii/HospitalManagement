import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Doctors from "./pages/Doctors";
import MyAppointment from "./pages/MyAppointment";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import MyProfile from "./pages/MyProfile";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useContext } from "react";
import { AdminAppContext } from "./context/AdminAppContext";
import AdminNavbar from "./components/AdminNavbar";
import Slidebar from "./components/Sidebar";
import Dashboard from "./pages/Admin/Dashboard";
import AllApointment from "./pages/Admin/AllApointment";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorList from "./pages/Admin/DoctorList";
import { ToastContainer } from "react-toastify";

const App = () => {
  const { aToken } = useContext(AdminAppContext);
  return (
    <div className="mx-4 sm:mx-[10%]">
      {aToken ? (
        <>
          <AdminNavbar />
          <div className="bg-gray-100 rounded-md">
            <div className="flex  items-start">
              <Slidebar />
              <Routes>
                <Route path="/" element={<></>} />
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/all-appointment" element={<AllApointment />} />
                <Route path="/add-doctor" element={<AddDoctor />} />
                <Route path="/doctor-list" element={<DoctorList />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Navbar />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/doctor" element={<Doctors />} />
        <Route path="/doctor/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointment" element={<MyAppointment />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route
          path="/admin/adminLogin"
          element={aToken ? <Navigate to="/admin-dashboard" /> : <AdminLogin />}
        />
      </Routes>

      <ToastContainer />
      <Footer />
    </div>
  );
};
export default App;
