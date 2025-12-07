import React from 'react';
import Title from './Title';
import { assets } from '../assets/assets';
import CarCard from './CarCard';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const FeaturedSection = () => {
  const navigate = useNavigate();
  // Ensure cars defaults to an empty array to prevent crashes if context is loading
  const { cars } = useAppContext();

  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
      
      {/* Title Section */}
      <div>
        <Title 
          title='Featured Vehicles' 
          subTitle='Explore our selection of premium vehicles available for your next adventure.'
        />
      </div>

      {/* Cars Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12'>
        {cars && cars.length > 0 ? (
          cars.slice(0, 6).map((car) => (
            <div key={car._id}>
              <CarCard car={car} />
            </div>
          ))
        ) : (
          // Fallback UI while loading
          <p className="text-gray-500 col-span-full text-center">Loading featured cars...</p>
        )}
      </div>

      {/* Explore Button */}
      <button 
        onClick={() => {
          navigate('/cars'); 
          window.scrollTo(0, 0); // ✅ Added 'window.' for safety
        }}
        className='flex items-center justify-center gap-2 px-6 py-2 border border-borderColor hover:bg-gray-50 rounded-md mt-12 cursor-pointer transition-colors'
      >
        Explore all cars <img src={assets.arrow_icon} alt="arrow" />
      </button>

    </div>
  );
};

export default FeaturedSection;