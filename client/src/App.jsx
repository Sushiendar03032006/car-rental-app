import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";

// Pages - Customer
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import MyBookings from "./pages/MyBookings";
import CarDetails from "./pages/CarDetails";

// Pages - Owner
import Layout from "./pages/owner/Layout";
import DashBoard from "./pages/owner/DashBoard";
import AddCar from "./pages/owner/AddCar";
import ManageCars from "./pages/owner/ManageCars";
import ManageBookings from "./pages/owner/ManageBookings";

// Context
import { useAppContext } from "./context/AppContext";

const App = () => {
  const { showLogin } = useAppContext();
  const location = useLocation();
  
  // Check if current path belongs to Owner Dashboard
  const isOwnerPath = location.pathname.startsWith("/owner");

  // ---------------------------------------------------
  // 📌 UX FIX: Scroll to top on every route change
  // ---------------------------------------------------
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Global Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Global Login Modal (Overlay) */}
      {showLogin && <Login />}

      {/* Navbar (Hidden on Owner Pages) */}
      {!isOwnerPath && <Navbar />}

      {/* Application Routes */}
      <Routes>
        {/* --- Customer Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* --- Owner Routes (Nested) --- */}
        <Route path="/owner" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-car" element={<AddCar />} />
          <Route path="manage-cars" element={<ManageCars />} />
          <Route path="manage-bookings" element={<ManageBookings />} />
        </Route>
      </Routes>

      {/* Footer (Hidden on Owner Pages) */}
      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;