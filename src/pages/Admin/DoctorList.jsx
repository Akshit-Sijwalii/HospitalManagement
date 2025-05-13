import { useContext, useEffect } from "react";
import { AdminAppContext } from "../../context/AdminAppContext";

const DoctorList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminAppContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {Array.isArray(doctors) && doctors.length > 0 ? (
          doctors.map((item, index) => (
            <div
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointerr group "
              key={index}
            >
              <img className="bg-blue-100 group-hover:bg-gray-600 transition-all duration-500" src={item.image} alt={`Doctor ${item.name}`} />
              <div className="p-4">
              <p className="text-gray-900 text-lg font-medium ">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center ggap-1 tet-sm">
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p className="p-2">Available</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No doctors available.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
