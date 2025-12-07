import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <>
      {/* 1. MAIN NAVBAR (Sticky Header)
        - z-40: Stays below the Login Modal (z-[9999])
        - w-full: Full width
      */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 py-3">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={car_rental_app_logo} 
              alt="DriveNow Logo" 
              className="h-8 w-auto group-hover:scale-105 transition-transform duration-300" 
            />
            <span className="text-xl font-bold text-gray-800 tracking-tight">DriveNow</span>
          </Link>

          {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden sm:flex items-center gap-6">
            {menuLinks.map((link, index) => (
              <Link 
                key={index} 
                to={link.path} 
                className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Search Bar */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 border focus-within:border-blue-500 focus-within:bg-white transition-all">
               <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent outline-none text-sm w-32 focus:w-48 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <img src={assets.search_icon} alt="Search" className="h-4 w-4 opacity-50 cursor-pointer" onClick={handleSearch} />
            </div>

            {/* User Profile / Login */}
            <div className="flex items-center gap-3">
                {user ? (
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-semibold">Hello,</span>
                        <span className="text-sm font-bold text-gray-800 leading-none">{user.name.split(' ')[0]}</span>
                      </div>
                      <button onClick={logout} className="ml-2 text-sm font-medium text-red-500 hover:text-red-700">Logout</button>
                   </div>
                ) : (
                   <button 
                      onClick={() => setShowLogin(true)} 
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5"
                   >
                      Login
                   </button>
                )}
            </div>
          </nav>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button 
            className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setOpen(true)}
          >
             <img src={assets.menu_icon} alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 2. MOBILE MENU OVERLAY (The Fix)
        - fixed inset-0: Covers the whole screen, removed from layout flow (Stops Side Scrolling!)
        - z-50: Sits on top of the navbar
        - invisible/visible: Hides the container completely when closed so it doesn't take up space
      */}
      <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        
        {/* Backdrop (Click to close) */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setOpen(false)}
        ></div>

        {/* Sidebar Content */}
        <div 
          className={`
            relative w-[75%] max-w-sm h-full bg-white shadow-2xl flex flex-col 
            transform transition-transform duration-300 ease-in-out
            ${open ? "translate-x-0" : "translate-x-full"}
          `}
        >
           {/* Sidebar Header */}
           <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="text-lg font-bold text-gray-800">Menu</span>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                 <img src={assets.close_icon} alt="Close" className="h-5 w-5" />
              </button>
           </div>

           {/* Sidebar Links */}
           <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
              {menuLinks.map((link, index) => (
                <Link 
                   key={index} 
                   to={link.path} 
                   onClick={() => setOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {isOwner && (
                 <button
                    onClick={() => { navigate("/owner"); setOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-left text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                 >
                    Dashboard
                 </button>
              )}
           </div>

           {/* Sidebar Footer (Auth) */}
           <div className="p-5 border-t border-gray-100 bg-gray-50">
              {user ? (
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-2">
                       <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                          {user.name[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">Logged in</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setOpen(false); }} 
                      className="w-full py-2.5 mt-2 text-sm font-semibold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                    >
                       Logout
                    </button>
                 </div>
              ) : (
                 <div className="flex flex-col gap-3">
                    <button 
                       onClick={() => { setShowLogin(true); setOpen(false); }} 
                       className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
                    >
                       Login / Sign Up
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;