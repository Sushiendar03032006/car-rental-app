import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets' 
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const DashBoard = () => {
  const { axios, isOwner } = useAppContext();

  // Initial State
  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [], // This must be an array initially
    monthlyRevenue: 0,
  });

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored },
  ]

  const fetchDashboardData = async () => {
    try {
      const { data: responseData } = await axios.get('/api/owner/dashboard') // Renamed to responseData to avoid confusion with state 'data'
      if (responseData.success) {
        // Ensure recentBookings is always an array even if backend sends null
        setData({
            ...responseData.dashboardData,
            recentBookings: responseData.dashboardData.recentBookings || [] 
        })
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
    }
  }, [isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities" />

      {/* --- Dashboard Cards --- */}
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor bg-white shadow-sm hover:shadow-md transition'>
            <div>
              <h1 className='text-xs text-gray-500 uppercase font-medium'>{card.title}</h1>
              <p className='text-xl font-bold text-gray-800 mt-1'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-50'>
              <img src={card.icon} alt="" className='h-5 w-5' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        
        {/* --- Recent Bookings Section --- */}
        <div className='p-4 md:p-6 border border-borderColor rounded-lg max-w-lg w-full bg-white shadow-sm'>
          <h1 className='text-lg font-bold text-gray-800'>Recent Bookings</h1>
          <p className='text-xs text-gray-400 mb-4'>Latest customer bookings</p>
          
          {/* ✅ FIX: Added Optional Chaining (?.) for safety */}
          {data.recentBookings?.length === 0 ? (
             <p className="text-gray-400 text-sm py-4 text-center">No recent bookings found.</p>
          ) : (
             data.recentBookings?.map((booking, index) => (
                <div key={index} className='mt-4 flex items-center justify-between border-b border-gray-100 pb-2 last:border-0'>
                  <div className='flex items-center gap-3'>
                    <div className='hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50'>
                      <img src={assets.listIconColored} alt="" className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='font-medium text-sm text-gray-800'>
                        {booking.car?.brand || "Unknown"} {booking.car?.model || "Car"}
                      </p>
                      <p className='text-xs text-gray-400'>{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <p className='text-sm font-semibold text-gray-700'>&#8377;{booking.price}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full 
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {booking.status}
                    </span>
                  </div>
                </div>
             ))
          )}
        </div>

        {/* --- Monthly Revenue Section --- */}
        <div className='p-4 md:p-6 mb-6 border border-borderColor rounded-lg w-full md:max-w-xs bg-white shadow-sm'>
          <h1 className='text-lg font-bold text-gray-800'>Total Revenue</h1>
          <p className='text-xs text-gray-400'>Revenue generated from all completed bookings</p>
          <p className='text-3xl mt-6 font-bold text-green-600'>&#8377;{data.monthlyRevenue}</p>
        </div>

      </div>
    </div>
  )
}

export default DashBoard