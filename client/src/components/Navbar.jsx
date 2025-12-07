import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, menuLinks } from "../assets/assets";
import car_rental_app_logo from "../assets/car-rental-app-logo.png";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner } = useAppContext();

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cars?q=${searchQuery}`);
      setOpen(false);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between w-full 
      px-4 sm:px-8 lg:px-16 py-3 
      border-b border-gray-200 shadow-sm bg-white/95 backdrop-blur-sm`}
    >
      {/* 1. Logo Section */}
      <Link to="/" className="flex items-center gap-2 group">
        <img 
            src={car_rental_app_logo} 
            alt="DriveNow Logo" 
            className="h-8 w-auto group-hover:scale-105 transition-transform duration-300" 
        />
        <span className="text-xl font-bold text-gray-800 tracking-tight">DriveNow</span>
      </Link>

      {/* 2. Desktop Navigation & Actions */}
      <nav
        className={`
          fixed sm:static top-16 right-0 
          h-screen sm:h-auto 
          w-[85%] sm:w-auto
          flex flex-col sm:flex-row 
          items-start sm:items-center 
          gap-6 sm:gap-6 p-6 sm:p-0 
          bg-white sm:bg-transparent shadow-2xl sm:shadow-none 
          transition-transform duration-300 ease-in-out 
          z-40 border-l sm:border-l-0 border-gray-100
          ${open ? "translate-x-0" : "translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Navigation Links */}
        {menuLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="text-gray-600 font-medium hover:text-blue-600 transition-colors text-base"
            onClick={() => setOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {/* Search Bar */}
        <div className="
          flex items-center text-sm gap-2 
          border border-gray-200 px-4 py-2 
          rounded-full bg-gray-50
          w-full sm:w-60 
          focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all
        ">
          <input
            type="text"
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none text-gray-700"
          />
          <img
            src={assets.search_icon}
            className="h-4 w-4 opacity-50 cursor-pointer hover:opacity-100"
            alt="search"
            onClick={handleSearch}
          />
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1"></div>

        {/* 3. User Profile & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          
          {/* User Info (Visible only when logged in) */}
          {user && (
            <div className="flex items-center gap-3 pl-1 mr-2 group cursor-default">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 ring-2 ring-transparent group-hover:ring-blue-50 transition-all">
                    <span className="font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                </div>
                
                {/* Text Details */}
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Welcome</span>
                    <span className="text-sm text-gray-700 font-semibold leading-none">
                        {user.name?.split(" ")[0]}
                    </span>
                </div>
            </div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* DASHBOARD BUTTON - Primary Action (Solid Blue) */}
            {isOwner && (
                <button
                onClick={() => {
                    navigate("/owner");
                    setOpen(false);
                }}
                className="
                    flex-1 sm:flex-none
                    px-5 py-2.5 
                    text-sm font-semibold text-white 
                    bg-blue-600 hover:bg-blue-700 
                    rounded-lg shadow-md shadow-blue-200 
                    transition-all duration-200 transform hover:-translate-y-0.5
                "
                >
                Dashboard
                </button>
            )}

            {/* LOGIN / LOGOUT BUTTON */}
            <button
                onClick={() => {
                  if (user) {
                    logout();
                  } else {
                    setShowLogin(true);
                  }
                  setOpen(false);
                }}
                className={`
                flex-1 sm:flex-none
                px-5 py-2.5 rounded-lg text-sm font-semibold 
                transition-all duration-200 border
                ${user 
                    ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm"  // Logout: White/Gray (Clean)
                    : "bg-blue-600 border-transparent text-white hover:bg-blue-700 shadow-md shadow-blue-200 transform hover:-translate-y-0.5" // Login: Blue (Prominent)
                }
                `}
            >
                {user ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Toggle */}
      <button
        className="sm:hidden cursor-pointer z-50 p-2 rounded-md hover:bg-gray-100 transition"
        onClick={() => setOpen(!open)}
      >
        <img
          src={open ? assets.close_icon : assets.menu_icon}
          className="h-6 w-6 opacity-80"
          alt="menu"
        />
      </button>

      {/* Mobile Overlay Backdrop */}
      {open && (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden"
            onClick={() => setOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Navbar;