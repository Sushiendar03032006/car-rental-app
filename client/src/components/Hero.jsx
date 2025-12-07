import React, { useState } from 'react';
import { assets, cityList } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Hero = () => {
  const navigate = useNavigate();

  // 1. Add state for Dates so we can send them to the next page
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();

    // Basic Validation
    if(!pickupLocation || !pickupDate || !returnDate) {
        return toast.error("Please fill in all fields");
    }

    // 2. Pass ALL data to the cars page via URL query parameters
    navigate(`/cars?pickupLocation=${pickupLocation}&pickupDate=${pickupDate}&returnDate=${returnDate}`);
  };

  // Helper to get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-14 bg-blue-50 text-center px-4'>
      {/* Heading */}
      <h1 className='text-4xl md:text-5xl font-semibold'>Luxury cars on Rent</h1>

      {/* Form */}
      <form
        onSubmit={handleSearch}
        className='flex flex-col md:flex-row items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-xs md:max-w-4xl bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] gap-4 md:gap-6'
      >
        {/* Inputs Container */}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 flex-1 w-full'>
          
          {/* Pickup Location */}
          <div className='flex flex-col items-start gap-2 w-full'>
            <label className='text-sm font-medium pl-1'>Location</label>
            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className='border border-gray-300 rounded px-3 py-2 w-full outline-none focus:border-blue-500'
            >
              <option value="" disabled>Select City</option>
              {cityList.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Pickup Date */}
          <div className='flex flex-col items-start gap-2 w-full'>
            <label htmlFor='pickup-date' className='text-sm font-medium pl-1'>Pick-up Date</label>
            <input
              type='date'
              id='pickup-date'
              min={today}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className='border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-600 outline-none focus:border-blue-500'
            />
          </div>

          {/* Return Date */}
          <div className='flex flex-col items-start gap-2 w-full'>
            <label htmlFor='return-date' className='text-sm font-medium pl-1'>Return Date</label>
            <input
              type='date'
              id='return-date'
              // Prevent selecting a return date BEFORE the pickup date
              min={pickupDate || today} 
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
              className='border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-600 outline-none focus:border-blue-500'
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type='submit'
          className='flex-shrink-0 flex items-center justify-center gap-2 px-8 py-3 mt-4 md:mt-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer transition-colors shadow-md'
        >
          <img src={assets.search_icon} alt='search' className='w-5 h-5 brightness-200 invert' />
          Search
        </button>
      </form>

      {/* Main Car Image */}
      <img src={assets.main_car} alt='car' className='max-h-72 w-auto mt-8 object-contain' />
    </div>
  );
};

export default Hero;