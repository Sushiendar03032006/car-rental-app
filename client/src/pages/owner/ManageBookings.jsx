import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// --- Helper Component for Status Dropdown ---
const StatusSelect = ({ booking, changeBookingStatus, fullWidth = false }) => (
  <select
    onChange={(e) => changeBookingStatus(booking._id, e.target.value)}
    value={booking.status}
    className={`${fullWidth ? "w-full" : "w-auto"} px-4 py-2 text-xs rounded-lg border outline-none font-semibold cursor-pointer transition-all
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
);

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

      <div className="mt-6">
        {/* --- DESKTOP TABLE VIEW (Visible on md screens and up) --- */}
        <div className="hidden md:block w-full rounded-lg border border-borderColor bg-white shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 font-medium">Car Details</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Date Range</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={booking.car?.image || "https://via.placeholder.com/50"}
                        alt=""
                        className="h-10 w-14 rounded object-cover bg-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {booking.car?.brand} {booking.car?.model}
                        </p>
                        <p className="text-xs text-gray-400">{booking.car?.category}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">
                        {booking.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-400">{booking.user?.email}</p>
                    </td>
                    <td className="p-4 text-xs">
                      <p><span className="text-gray-400">From:</span> {booking.startLocation}</p>
                      <p><span className="text-gray-400">To:</span> {booking.endLocation}</p>
                    </td>
                    <td className="p-4 text-xs">
                      <p><span className="text-gray-400">Pick:</span> {new Date(booking.pickupDate).toLocaleDateString()}</p>
                      <p><span className="text-gray-400">Drop:</span> {new Date(booking.returnDate).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-700">
                      {currency}{booking.price}
                    </td>
                    <td className="p-4">
                      <StatusSelect
                        booking={booking}
                        changeBookingStatus={changeBookingStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE & TABLET CARD VIEW (Visible on screens smaller than md) --- */}
        <div className="md:hidden space-y-4">
          {bookings.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No bookings found.</p>
          ) : (
            bookings.map((booking, index) => (
              <div
                key={index}
                className="bg-white border border-borderColor rounded-xl p-4 shadow-sm space-y-4"
              >
                {/* Header: Car & Price */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <img
                      src={booking.car?.image || "https://via.placeholder.com/50"}
                      alt=""
                      className="h-12 w-16 rounded object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-bold text-gray-800">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className="text-xs text-gray-400">{booking.car?.category}</p>
                    </div>
                  </div>
                  <p className="font-bold text-blue-600">
                    {currency}{booking.price}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-tight">
                      Customer
                    </p>
                    <p className="text-sm font-medium">{booking.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{booking.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-tight">
                      Phone
                    </p>
                    <p className="text-sm font-medium">{booking.phone || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-tight">
                      Route & Dates
                    </p>
                    <div className="flex justify-between items-center text-xs mt-1 bg-gray-50 p-2 rounded">
                      <p>
                        <b>{booking.startLocation}</b> <br />
                        <span className="text-[10px] text-gray-500">
                          {new Date(booking.pickupDate).toLocaleDateString()}
                        </span>
                      </p>
                      <span className="text-gray-300">→</span>
                      <p className="text-right">
                        <b>{booking.endLocation}</b> <br />
                        <span className="text-[10px] text-gray-500">
                          {new Date(booking.returnDate).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="pt-2">
                  <StatusSelect
                    booking={booking}
                    changeBookingStatus={changeBookingStatus}
                    fullWidth={true}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
