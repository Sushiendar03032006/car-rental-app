import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const { setShowLogin, axios, setToken, navigate } = useAppContext();

  // states: "login", "register", "forgot"
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      // 1. Handle Forgot Password Request
      if (state === "forgot") {
        const { data } = await axios.post("/api/user/forgot-password", { email });
        if (data.success) {
          toast.success("Reset link sent! Check your email.");
          setState("login"); // Move back to login after success
        } else {
          toast.error(data.message);
        }
        return;
      }

      // 2. Handle Login or Register
      const payload = state === "register" ? { name, email, password } : { email, password };
      const { data } = await axios.post(`/api/user/${state}`, payload);

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setShowLogin(false);
        navigate("/");
        toast.success(state === "register" ? "Account created!" : "Welcome back!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 p-6 sm:p-8 w-[90%] max-w-md bg-white rounded-xl shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center w-full text-gray-800">
          {state === "login" ? "Login" : state === "register" ? "Create Account" : "Reset Password"}
        </h2>

        <p className="text-sm text-center text-gray-500 mb-2">
          {state === "forgot" 
            ? "Enter your email to receive a reset link" 
            : state === "login" 
            ? "Sign in to access your bookings" 
            : "Sign up to start your journey"}
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

        {/* Hide password input if we are in 'forgot' state */}
        {state !== "forgot" && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700">Password</p>
              {state === "login" && (
                <span 
                  onClick={() => setState("forgot")}
                  className="text-xs text-blue-600 cursor-pointer hover:underline"
                >
                  Forgot password?
                </span>
              )}
            </div>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="••••••••"
              className="border border-gray-300 rounded-lg w-full p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              type="password"
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white w-full py-2.5 rounded-lg font-medium mt-2 shadow-md"
        >
          {state === "register" ? "Create Account" : state === "login" ? "Login" : "Send Reset Link"}
        </button>

        <div className="text-sm text-center mt-2 text-gray-600">
          {state === "forgot" ? (
            <p>
              Remember your password?{" "}
              <span
                onClick={() => setState("login")}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Back to Login
              </span>
            </p>
          ) : state === "register" ? (
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