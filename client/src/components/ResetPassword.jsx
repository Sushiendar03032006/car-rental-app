import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/user/reset-password/${id}/${token}`, { password });
      if (data.success) {
        toast.success("Password updated successfully!");
        navigate("/"); // Redirect to home/login
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Link may be expired.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleReset} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Set New Password</h2>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">New Password</p>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Min 8 characters"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={8}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;