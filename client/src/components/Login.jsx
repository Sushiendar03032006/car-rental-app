import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const { setShowLogin, axios, setToken, navigate } = useAppContext();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      // 1. Create specific payload (Don't send 'name' during login)
      const payload = state === 'register' 
        ? { name, email, password } 
        : { email, password };

      // 2. Add leading slash '/' to ensure correct path
      const { data } = await axios.post(`/api/user/${state}`, payload);

      if (data.success) {
        // 3. Set Token & LocalStorage
        setToken(data.token);
        localStorage.setItem("token", data.token);
        
        // 4. Close Modal & Redirect
        setShowLogin(false);
        navigate('/');
        toast.success(`Welcome back!`);
      } else {
        toast.error(data.message);
      }
      
    } catch (error) {
      // 5. Improved Error Handling to show Backend Message
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    }
  };
  // inside Login.jsx

return (
    // Updated Container: High Z-index, full screen coverage
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        // Updated Form: 
        // - w-[90%] makes it responsive on small mobile screens
        // - max-w-md keeps it from getting too big on desktop
        // - max-h-[90vh] and overflow-y-auto ensures it doesn't get cut off on landscape mode
        className="flex flex-col gap-4 p-6 sm:p-8 w-[90%] max-w-md bg-white rounded-xl shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={() => setShowLogin(false)} 
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center w-full text-gray-800">
          {state === "login" ? "Login" : "Create Account"}
        </h2>
        
        <p className="text-sm text-center text-gray-500 mb-2">
          {state === "login" ? "Sign in to access your bookings" : "Sign up to start your journey"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p className="text-sm font-medium text-gray-700 mb-1">Full Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="John Doe"
              className="border border-gray-300 rounded-lg w-full p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-sm font-medium text-gray-700 mb-1">Email Address</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="name@example.com"
            className="border border-gray-300 rounded-lg w-full p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p className="text-sm font-medium text-gray-700 mb-1">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="••••••••"
            className="border border-gray-300 rounded-lg w-full p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            type="password"
            required
          />
        </div>

        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white w-full py-2.5 rounded-lg font-medium mt-2 shadow-md"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>

        <div className="text-sm text-center mt-2 text-gray-600">
          {state === "register" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Sign up here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;