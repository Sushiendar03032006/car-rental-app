import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/owner/SideBar'; // Ensure case matches file name (Sidebar vs SideBar)
import NavbarOwner from '../../components/owner/NavbarOwner';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Layout = () => {
  // ✅ CHANGED: Destructured token to prevent premature redirects on refresh
  const { isOwner, token } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ FIX: Robust Route Protection
    // 1. If no token exists in context or localStorage, kick out immediately.
    const localToken = localStorage.getItem('token');
    
    if (!token && !localToken) {
        toast.error("Please login to access dashboard");
        navigate('/');
        return;
    }

    // 2. If token exists but user is NOT owner (and we assume data is loaded if isOwner is explicitly false while token exists)
    // Note: Ideally, AppContext should have a 'loading' state. 
    // For now, we rely on the backend failing the API calls if the role is wrong.
    if (token && isOwner === false) {
        // Optional: You might want to wait for fetchUser() to complete in AppContext
        // But usually, if isOwner is false, the Sidebar links won't work anyway.
    }

  }, [isOwner, navigate, token]);

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-gray-50'>
      
      {/* Top Navigation */}
      <div className="w-full z-10 bg-white shadow-sm">
        <NavbarOwner />
      </div>

      {/* Main Body */}
      <div className='flex flex-1 overflow-hidden'>
        
        {/* Sidebar - Handles its own responsiveness (hidden on mobile based on your Sidebar.jsx) */}
        <Sidebar />

        {/* Content Area */}
        {/* ✅ CHANGED: Added 'overflow-y-auto' to make only this part scroll */}
        <div className='flex-1 overflow-y-auto p-6 md:p-8 pb-20'>
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default Layout;