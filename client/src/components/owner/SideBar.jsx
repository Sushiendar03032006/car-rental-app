import React, { useState } from 'react';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  // 1. Get Context Data
  const { user, axios, fetchUser } = useAppContext();
  const location = useLocation();
  
  // 2. Local State for Image Upload
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Image Update Handler
  const updateImage = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      // Use the correct API endpoint from your backend routes
      const { data } = await axios.post('/api/owner/update-image', formData);

      if (data.success) {
        await fetchUser(); // Refresh user data to show new image
        toast.success(data.message);
        setImage('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Image Update Error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen md:flex flex-col items-center pt-10 max-w-16 md:max-w-60 w-full border-r border-gray-200 bg-white shadow-sm text-sm">
      
      {/* --- Profile Section --- */}
      <div className="group relative flex flex-col items-center px-2">
        <label htmlFor="image" className={`cursor-pointer relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Profile Image Preview or User Image */}
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : user?.image ||
                  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300'
            }
            alt="Profile"
            className="h-14 w-14 md:h-20 md:w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          />
          
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files[0] && setImage(e.target.files[0])}
          />

          {/* Hover Edit Icon Overlay */}
          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/30 rounded-full transition-opacity">
             {/* Fallback to a simple emoji if assets.edit_icon is missing */}
             {assets?.edit_icon ? (
               <img src={assets.edit_icon} alt="Edit" className="w-4 h-4 brightness-200" />
             ) : (
               <span className="text-white text-xs">✏️</span>
             )}
          </div>
        </label>

        {/* Save Button (Only shows when a new image is selected) */}
        {image && (
          <button
            onClick={updateImage}
            disabled={loading}
            className="mt-3 flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
            {/* Fallback for check icon */}
            {assets?.check_icon ? (
               <img src={assets.check_icon} width={13} alt="Check" />
            ) : (
               !loading && <span>✓</span>
            )}
          </button>
        )}

        <p className="mt-3 text-base font-medium text-gray-800 max-md:hidden text-center">
          {user?.name || "Owner"}
        </p>
      </div>

      {/* --- Menu Links --- */}
      <div className="w-full mt-8 flex flex-col gap-1">
        {ownerMenuLinks && ownerMenuLinks.length > 0 ? (
            ownerMenuLinks.map((link, index) => {
            const active = link.path === location.pathname;
            return (
                <NavLink
                key={index}
                to={link.path}
                end={true} // Ensures exact matching for routes
                className={({ isActive }) => `relative flex items-center gap-3 w-full py-3 pl-5 pr-3 transition-all duration-200 border-r-4 
                    ${
                    isActive
                        ? 'bg-blue-50 text-blue-600 font-medium border-blue-500'
                        : 'text-gray-500 hover:bg-gray-50 border-transparent'
                    }`}
                >
                {/* Icon Handling */}
                <img
                    src={active ? (link.coloredIcon || link.icon) : link.icon}
                    alt="icon"
                    className={`w-5 h-5 ${active ? '' : 'opacity-70'}`}
                />
                <span className="max-md:hidden">{link.name}</span>
                </NavLink>
            );
            })
        ) : (
            <p className="text-center text-xs text-gray-400 mt-4">No links found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
