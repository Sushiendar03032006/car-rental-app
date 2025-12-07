import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

// Helper Functions
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays;
};

const MyBookings = () => {
  const { axios, token } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Bookings (Safe Mode)
  const fetchUserBookings = async () => {
    try {
      // 🛡️ FIX: Manually attach token to prevent 401 race conditions
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const { data } = await axios.get("/api/bookings/user", config);

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error(error);
      // Avoid spamming toast if it's just a momentary auth issue
      if (error.response?.status !== 401) {
          toast.error("Error loading bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.delete(`/api/bookings/${bookingId}`, config);

      if (data.success) {
        toast.success("Booking cancelled");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error cancelling booking");
    }
  };

  useEffect(() => {
    if (token) fetchUserBookings();
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl min-h-screen">
      <Title title="My Bookings" subTitle="View and manage all your car bookings" align="left" />

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">You haven't booked any cars yet.</p>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => {
            const rentalDays = calculateDays(booking.pickupDate, booking.returnDate);
            return (
              <div key={booking._id} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 shadow-sm hover:shadow-md transition-all bg-white">
                
                {/* Left: Car Info */}
                <div className="md:col-span-1">
                  <div className="rounded-md overflow-hidden mb-3 relative">
                    <img src={booking.car?.image} alt={booking.car?.model} className="w-full h-auto aspect-video object-cover" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{booking.car?.brand} {booking.car?.model}</p>
                  <p className="text-gray-500 text-xs uppercase font-semibold mt-1">{booking.car?.year} • {booking.car?.category}</p>
                </div>

                {/* Middle: Status & Dates */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">ID: {booking._id.slice(-6).toUpperCase()}</span>
                    
                    {/* ✅ STATUS BADGE: Shows Yellow for Pending */}
                    <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize border ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-700 border-green-200" :
                        booking.status === "cancelled" ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-yellow-100 text-yellow-700 border-yellow-200" // Default Pending
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {booking.status === "pending" && (
                    <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                      <span className="animate-pulse">●</span> Awaiting owner confirmation
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase">Pick-up</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.pickupDate)}</p>
                      <p className="text-xs">{booking.startLocation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase">Return</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.returnDate)}</p>
                      <p className="text-xs">{booking.endLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Cancel */}
                <div className="md:col-span-1 flex flex-col justify-between items-end text-right border-l border-gray-100 pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
                  <div className="mt-2 w-full text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Price ({rentalDays} Days)</p>
                    <h1 className="text-2xl font-bold text-blue-600">₹{booking.price}</h1>
                  </div>
                  <div className="flex flex-col items-end gap-2 mt-4 w-full">
                    <button onClick={() => handleCancelBooking(booking._id)} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition-colors w-max">
                      Cancel Request
                    </button>
                    <p className="text-[10px] text-gray-400">Requested on {formatDateTime(booking.createdAt)}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;