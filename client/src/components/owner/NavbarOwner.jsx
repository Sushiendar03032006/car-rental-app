import React from 'react';
// ❌ REMOVED: Unused imports (assets, dummyUserData) to keep code clean
import { Link } from 'react-router-dom';
import car_rental_app_logo from '../../assets/car-rental-app-logo.png'; 
import { useAppContext } from '../../context/AppContext';

const NavbarOwner = () => {
  const { user } = useAppContext();

  return (
    <div className='flex items-center justify-between px-6 md:px-10 py-4 text-gray-600 border-b border-borderColor bg-white shadow-sm'>
      {/* Left: Logo + Brand name */}
      {/* Suggestion: You might want this to link to '/owner/dashboard' instead of '/' if they are logged in as owner */}
      <Link to='/' className='flex items-center gap-2'>
        <img src={car_rental_app_logo} alt="logo" className="h-8 w-auto" />
        <span className='text-lg font-semibold text-gray-800 tracking-wide'>
          DriveNow
        </span>
      </Link>

      {/* Right: Welcome message */}
      <div className='flex items-center gap-4'>
        <p className='text-sm md:text-base text-gray-600'>
          Welcome, <span className='font-medium text-gray-800'>{user?.name || "Owner"}</span>
        </p>
        {/* Optional: You could add a profile picture here if available */}
        {user?.image && (
           <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
        )}
      </div>
    </div>
  );
};

export default NavbarOwner;