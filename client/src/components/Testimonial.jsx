import React, { useEffect, useState } from 'react';
import Title from './Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Testimonial = () => {
  const { axios, user } = useAppContext(); // Get axios and user from context
  
  // State to store list of reviews
  const [testimonials, setTestimonials] = useState([]);
  
  // State to handle Modal visibility
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || '', // Auto-fill name if logged in
    location: '',
    message: ''
  });

  // 1. Fetch Testimonials from Backend
  const fetchTestimonials = async () => {
    try {
      const { data } = await axios.get('/api/testimonials/all');
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // 2. Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.post('/api/testimonials/add', formData);
      
      if (data.success) {
        toast.success(data.message);
        setShowModal(false); // Close modal
        setFormData({ name: '', location: '', message: '' }); // Reset form
        fetchTestimonials(); // Refresh list immediately
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44 bg-gray-50/50">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12">
        <Title 
          title="What Our Customers Say" 
          subTitle="Real experiences from travelers who trusted DriveNow for their journey."
        />
        
        {/* Add Review Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          <span>Write a Review</span>
          <span className="text-lg">✎</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {/* Static Data (Optional: Keep purely mostly DB data, but here's how to mix them if needed) */}
        {testimonials.length === 0 && <p className="text-center col-span-3 text-gray-400">No reviews yet. Be the first!</p>}

        {testimonials.map((item, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              {/* Use a default avatar since we aren't uploading images for reviews yet */}
              <img 
                className="w-12 h-12 rounded-full object-cover bg-gray-200" 
                src={assets.profile_icon || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                alt={item.name} 
              />
              <div>
                <p className="text-xl font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">{item.location}</p>
              </div>
            </div>
            
            {/* Stars */}
            <div className="flex items-center gap-1 mt-4">
              {Array(5).fill(0).map((_, i) => (
                <img key={i} src={assets.star_icon} alt="star" className="w-4 h-4" />
              ))}
            </div>

            <p className="text-gray-600 mt-4 font-light leading-relaxed">
              "{item.message}"
            </p>
          </div>
        ))}
      </div>

      {/* --- MODAL (The Card to Add Review) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-semibold">Share your Experience</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white text-xl">&times;</button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Your Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                <input 
                  type="text" 
                  required 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Mumbai, India"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Review</label>
                <textarea 
                  required 
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="How was your car rental experience?"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Submit Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Testimonial;