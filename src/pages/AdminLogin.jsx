import { useState } from "react";
const AdminLogin = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <form
        className="min-h-[80vh] flex items-center"
      >
        <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
          <p className="text-2xl font-semibold m-auto">
            <span className="text-zinc-600">{state}</span> Login
          </p>

          <div className="w-full ">
            <p>Email</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="w-full ">
            <p>Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <button className="bg-gray-600 text-white w-full py-2 rounded-md text-base cursor-pointer">
            Login
          </button>
          {state === "Admin" ? (
            <p>
              Doctor Login ?
              <span
                onClick={() => setState("Doctor")}
                className="text-blue-600 underline cursor-pointer"
              >
                click here
              </span>
            </p>
          ) : (
            <p>
              Admin Login ?
              <span
                onClick={() => setState("Admin")}
                className="text-blue-600 underline cursor-pointer"
              >
                click here
              </span>
            </p>
          )}
        </div>
      </form>
    </>
  );
};

export default AdminLogin;
