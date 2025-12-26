import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ManageBookings = () => {
  const { currency, axios } = useAppContext();

  const [bookings, setBookings] = useState([]);

  // ✅ Fetch bookings from backend
  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/owner");
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Change Status Handler
  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post("/api/bookings/change-status", {
        bookingId,
        status,
      });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings(); // Refresh data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  return (
    <div className="px-4 pt-10 md:px-10 w-full pb-10">
      <Title
        title="Manage Bookings"
        subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses."
      />

      {/* ✅ CHANGED: Added 'overflow-x-auto' wrapper for mobile responsiveness */}
      <div className="w-full rounded-lg border border-borderColor mt-6 bg-white shadow-sm overflow-x-auto">
        {/* ✅ CHANGED: Added min-w class to prevent columns from squishing too much */}
        <table className="w-full min-w-[800px] border-collapse text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 font-medium">Car Details</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Route</th>
              <th className="p-4 font-medium">Phone</th>

              <th className="p-4 font-medium">Date Range</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  {/* Car Column */}
                  <td className="p-4 flex items-center gap-3">
                    {/* ✅ FIX: Optional Chaining (?.) prevents crash if car is deleted */}
                    <img
                      src={
                        booking.car?.image || "https://via.placeholder.com/50"
                      }
                      alt=""
                      className="h-10 w-14 rounded object-cover bg-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booking.car?.category}
                      </p>
                    </div>
                  </td>

                  {/* Customer Column (Added for better context) */}
                  <td className="p-4">
                    <p className="font-medium text-gray-800">
                      {booking.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.user?.email}
                    </p>
                  </td>

                  {/* ✅ NEW: Route Column */}
                  <td className="p-4 text-xs space-y-1">
                    <p>
                      <span className="text-gray-400">From:</span>{" "}
                      {booking.startLocation || "-"}
                    </p>
                    <p>
                      <span className="text-gray-400">To:</span>{" "}
                      {booking.endLocation || "-"}
                    </p>
                  </td>

                  {/* ✅ NEW: Phone Column */}
                  <td className="p-4 text-sm font-medium text-gray-700">
                    {booking.phone || "-"}
                  </td>

                  {/* Date Range */}
                  <td className="p-4 text-xs space-y-1">
                    <p>
                      <span className="text-gray-400">Pick:</span>{" "}
                      {new Date(booking.pickupDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-gray-400">Drop:</span>{" "}
                      {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-bold text-gray-700">
                    {currency}
                    {booking.price}
                  </td>

                  {/* Actions / Status */}
                  <td className="p-4">
                    <select
                      onChange={(e) =>
                        changeBookingStatus(booking._id, e.target.value)
                      }
                      value={booking.status}
                      className={`px-3 py-1.5 text-xs rounded-full border outline-none font-medium cursor-pointer
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : booking.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;
