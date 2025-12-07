import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  const handleBooking = () => {
    if (car && car._id) {
      navigate(`/car-details/${car._id}`);
      window.scrollTo(0, 0);
    } else {
      console.error("Car ID is missing.");
    }
  };

  if (!car) return null;

  return (
    <div 
      onClick={handleBooking} 
      className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-white border border-gray-100 flex flex-col h-full'
    >
      {/* Image Container */}
      <div className='relative h-48 overflow-hidden shrink-0'>
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' 
        />

        {/* Availability Badge */}
        {car.isAvailable && (
          <p className='absolute top-4 left-4 bg-green-500/90 text-white text-xs px-2.5 py-1 rounded-full shadow-sm font-medium'>
            Available
          </p>
        )}
      </div>

      {/* Details Container */}
      <div className='p-4 flex flex-col flex-grow'>
        {/* Title */}
        <div className='mb-3'>
          <h3 className='text-lg font-bold text-gray-800'>{car.brand} {car.model}</h3>
          <p className='text-gray-500 text-xs uppercase font-semibold tracking-wide'>{car.category} • {car.year}</p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-2 gap-y-2 gap-x-2 text-gray-600 text-sm mb-4'>
          <div className='flex items-center gap-2'>
            <img src={assets.users_icon} alt="" className='h-3.5 w-3.5 opacity-60' />
            <span className='truncate'>{car.seating_capacity} Seats</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src={assets.fuel_icon} alt="" className='h-3.5 w-3.5 opacity-60' />
            <span className='truncate'>{car.fuel_type}</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src={assets.car_icon} alt="" className='h-3.5 w-3.5 opacity-60' />
            <span className='truncate'>{car.transmission}</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src={assets.location_icon} alt="" className='h-3.5 w-3.5 opacity-60' />
            <span className='truncate'>{car.location}</span>
          </div>
        </div>

        {/* Footer: Book Now Only */}
        <div className='mt-auto pt-3 border-t border-gray-100'>
           <button className='w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm'>
             Book Now <span className='text-lg'>&rarr;</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;