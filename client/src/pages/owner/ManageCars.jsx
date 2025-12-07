import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets' // Removed dummyCarData
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {

  const { isOwner, axios, currency } = useAppContext();

  const [cars, setCars] = useState([])

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) {
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      // ✅ CHANGED: Better error handling
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId) => {
    try {
      // ✅ CHANGED: Improved confirmation dialog text
      const confirm = window.confirm('This action cannot be undone. Delete this car?')

      if (!confirm) return null

      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
        fetchOwnerCars()
    }
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 w-full pb-10'>

      <Title title="Manage Cars" subTitle="View all listed cars, update their details, or remove them from the booking platform." />

      {/* ✅ CHANGED: Added 'overflow-x-auto' for mobile responsiveness */}
      <div className='w-full rounded-lg border border-borderColor mt-6 bg-white shadow-sm overflow-x-auto'>

        {/* ✅ CHANGED: Added 'min-w' to prevent squishing on mobile */}
        <table className='w-full min-w-[700px] border-collapse text-left text-sm text-gray-600'>
          <thead className='bg-gray-50 text-gray-500 uppercase text-xs tracking-wider'>
            <tr>
              <th className="p-4 font-medium">Car Details</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Base Rate</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          
          <tbody className='divide-y divide-gray-100'>
            {cars.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No cars listed yet.</td></tr>
            ) : (
                cars.map((car, index) => (
                <tr key={index} className='hover:bg-gray-50 transition-colors'>

                    {/* Car Column */}
                    <td className='p-4 flex items-center gap-3'>
                    <img src={car.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                    <div>
                        <p className='font-semibold text-gray-800 text-base'>{car.brand} {car.model}</p>
                        <p className='text-xs text-gray-400'>{car.seating_capacity} Seats • {car.transmission}</p>
                    </div>
                    </td>

                    {/* Category */}
                    <td className='p-4'>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                            {car.category}
                        </span>
                    </td>

                    {/* Price */}
                    <td className='p-4 font-medium text-gray-700'>
                        {/* ✅ FIX: Show "Dynamic" if price is 0/undefined (Since we removed price input) */}
                        {car.pricePerDay && car.pricePerDay > 0 
                            ? `${currency}${car.pricePerDay}/day` 
                            : <span className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Dynamic</span>
                        }
                    </td>

                    {/* Status */}
                    <td className='p-4'>
                    {/* ✅ FIX: Typo fixed from 'isAvaliable' to 'isAvailable' to match Backend Schema */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                        ${car.isAvailable 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                        {car.isAvailable ? "Active" : "Hidden"}
                    </span>
                    </td>

                    {/* Actions */}
                    <td className='p-4'>
                        <div className='flex items-center justify-center gap-4'>
                            {/* Toggle Visibility */}
                            <button 
                                onClick={() => toggleAvailability(car._id)}
                                title="Toggle Availability"
                                className='p-1.5 hover:bg-gray-100 rounded-full transition'
                            >
                                {/* ✅ FIX: Typo fixed 'isAvailable' */}
                                <img src={car.isAvailable ? assets.eye_icon : assets.eye_close_icon} alt="toggle" className='w-5 h-5 opacity-70 hover:opacity-100' />
                            </button>

                            {/* Delete */}
                            <button 
                                onClick={() => deleteCar(car._id)}
                                title="Delete Car"
                                className='p-1.5 hover:bg-red-50 rounded-full transition group'
                            >
                                <img src={assets.delete_icon} alt="delete" className='w-5 h-5 opacity-70 group-hover:opacity-100' />
                            </button>
                        </div>
                    </td>

                </tr>
                ))
            )}
          </tbody>
        </table>

      </div>

    </div>
  )
}

export default ManageCars