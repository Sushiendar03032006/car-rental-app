import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

const AddCar = () => {

  const { axios } = useAppContext();

  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // State (No pricePerDay here)
  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: '',
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: ''
  })

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (isLoading) return null
    if (!image) return toast.error("Please upload an image")

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image)
      formData.append('carData', JSON.stringify(car))

      const { data } = await axios.post('/api/owner/add-car', formData)

      if (data.success) {
        toast.success(data.message)
        setImage(null)
        setCar({
          brand: '',
          model: '',
          year: '',
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: '',
          location: '',
          description: ''
        })
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCar(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>

      <Title title="Add New Car" subTitle="Fill in details to list a new car. Pricing will be calculated automatically by AI." />

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>

        {/* Car Image */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="car-image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_icon} alt="" className='h-14 rounded cursor-pointer border border-gray-200' />
            <input type="file" id="car-image" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* Brand & Model */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Brand</label>
            <input type="text" name="brand" placeholder="e.g. BMW" required className='input-field' value={car.brand} onChange={handleInputChange} />
          </div>
          <div className='flex flex-col w-full'>
            <label>Model</label>
            <input type="text" name="model" placeholder="e.g. X5" required className='input-field' value={car.model} onChange={handleInputChange} />
          </div>
        </div>

        {/* Year & Category */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Year</label>
            <input type="number" name="year" placeholder="2025" required className='input-field' value={car.year} onChange={handleInputChange} />
          </div>
          <div className='flex flex-col w-full'>
            <label>Category</label>
            <select name="category" required className='input-field' value={car.category} onChange={handleInputChange}>
              <option value="">Select</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Van">Van</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>
        </div>

        {/* Transmission, Fuel, Seats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Transmission</label>
            <select name="transmission" required className='input-field' value={car.transmission} onChange={handleInputChange}>
              <option value="">Select</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Fuel Type</label>
            <select name="fuel_type" required className='input-field' value={car.fuel_type} onChange={handleInputChange}>
              <option value="">Select</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Seating Capacity</label>
            <input type="number" name="seating_capacity" placeholder="4" required className='input-field' value={car.seating_capacity} onChange={handleInputChange} />
          </div>
        </div>

        {/* Location */}
        <div className='flex flex-col w-full'>
            <label>Location</label>
            <select name="location" required className='input-field' value={car.location} onChange={handleInputChange}>
            <option value="">Select Location</option>
            <option value="Chennai">Chennai</option>
            <option value="Kanchipuram">Kanchipuram</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Coimbatore">Coimbatore</option>
            </select>
        </div>

        {/* Description */}
        <div className='flex flex-col w-full'>
          <label>Description</label>
          <textarea name="description" rows={4} placeholder="Describe the car features..." required className='input-field' value={car.description} onChange={handleInputChange}></textarea>
        </div>

        <button type="submit" disabled={isLoading} className='flex items-center gap-2 px-6 py-3 mt-2 bg-blue-600 text-white rounded-md font-medium w-max cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition'>
          <img src={assets.tick_icon} alt="" className="w-4" />
          {isLoading ? 'Listing...' : 'List Your Car'}
        </button>

      </form>
      
      <style>{`
        .input-field {
            padding: 0.5rem 0.75rem;
            margin-top: 0.25rem;
            border: 1px solid #E5E7EB;
            border-radius: 0.375rem;
            outline: none;
            transition: border-color 0.2s;
        }
        .input-field:focus {
            border-color: #2563EB;
        }
      `}</style>
    </div>
  )
}

export default AddCar