import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CarCard from "../components/CarCard";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Cars = () => {
  const { cars, axios } = useAppContext();
  
  const [searchParams] = useSearchParams();
  
  // 1. Get Params (Navbar Search OR Availability Check)
  const searchQuery = searchParams.get("q"); // Navbar Search (?q=Toyota)
  
  const pickupLocation = searchParams.get("pickupLocation"); // Availability Check
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const isAvailabilityCheck = pickupLocation && pickupDate && returnDate;

  // 2. States
  const [displayedCars, setDisplayedCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localInput, setLocalInput] = useState(""); // Local search bar on this page

  // -----------------------------------------------------------
  // 3. Logic: Decide what to show
  // -----------------------------------------------------------
  useEffect(() => {
    const loadCars = async () => {
      
      // CASE A: User is checking availability (Dates provided)
      if (isAvailabilityCheck) {
        setLoading(true);
        try {
          const { data } = await axios.post("/api/bookings/check-availability", {
            location: pickupLocation,
            pickupDate,
            returnDate,
          });

          if (data.success) {
            setDisplayedCars(data.availableCars);
            if (data.availableCars.length === 0) toast("No cars available for these dates");
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to check availability");
        } finally {
          setLoading(false);
        }
      } 
      
      // CASE B: User searched from Navbar (?q=Toyota)
      else if (searchQuery) {
        if (cars.length > 0) {
            const filtered = cars.filter(car => 
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.model.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setDisplayedCars(filtered);
        }
      } 
      
      // CASE C: Just show all cars
      else {
        setDisplayedCars(cars);
      }
    };

    loadCars();
  }, [isAvailabilityCheck, searchQuery, cars, pickupLocation, pickupDate, returnDate, axios]);

  // -----------------------------------------------------------
  // 4. Local Filtering (Input Box on this page)
  // -----------------------------------------------------------
  const handleLocalFilter = (e) => {
    const text = e.target.value;
    setLocalInput(text);

    if (text === "") {
        // Reset to original source (either Search Results or All Cars)
        // For simplicity, we filter the current 'cars' from context again
        // Or you can keep a separate 'sourceList' state if complex
        setDisplayedCars(cars); 
    } else {
        const filtered = cars.filter(car => 
            car.brand.toLowerCase().includes(text.toLowerCase()) ||
            car.model.toLowerCase().includes(text.toLowerCase())
        );
        setDisplayedCars(filtered);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col items-center py-20 bg-light max-md:px-4">
        <Title
          title={isAvailabilityCheck ? "Available Vehicles" : searchQuery ? `Results for "${searchQuery}"` : "All Cars"}
          subTitle={isAvailabilityCheck ? "Cars available for your selected dates" : "Browse our premium fleet"}
        />

        {/* Local Search Bar */}
        <div className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow-sm border border-gray-100">
          <img src={assets.search_icon} alt="" className="w-4.5 h-4.5 mr-2 opacity-50" />
          <input
            onChange={handleLocalFilter}
            value={localInput}
            type="text"
            placeholder="Filter by brand or model..."
            className="w-full h-full outline-none text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10 pb-20">
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto mb-6 text-sm">
          Showing {displayedCars.length} cars
        </p>

        {loading ? (
           <div className="text-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
             <p className="text-gray-500 mt-4">Finding the best cars for you...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:px-20 max-w-7xl mx-auto">
            {displayedCars.length > 0 ? (
              displayedCars.map((car, index) => (
                <CarCard key={car._id || index} car={car} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <h3 className="text-xl text-gray-600 font-medium">No cars found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search criteria.</p>
                <button 
                    onClick={() => window.location.href = '/cars'}
                    className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                >
                    View All Cars
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;