import React from "react";
import { assets } from "../assets/assets";
import car_rental_app_logo from "../assets/car-rental-app-logo.png";

const Footer = () => {
  // Mock data for 4 specific locations
  const locations = [
    {
      city: "Chennai",
      address: "45, Anna Salai, Guindy, Chennai - 600032",
      phone: "+91 98765 43210"
    },
    {
      city: "Bangalore",
      address: "88, MG Road, Indiranagar, Bangalore - 560038",
      phone: "+91 98765 55667"
    },
    {
      city: "Coimbatore",
      address: "12, Cross Cut Road, Gandhipuram, Coimbatore - 641012",
      phone: "+91 99445 33221"
    },
    {
      city: "Kanchipuram",
      address: "7, Kamarajar Street, Kanchipuram - 631502",
      phone: "+91 95666 73221"
    }
  ];

  return (
    <div className="bg-gray-50 text-gray-600 border-t border-gray-200 mt-40">
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 pt-16 pb-8">
        
        {/* Top Section: Brand & Socials */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12 border-b border-gray-200 pb-12">
          
          {/* Brand Info (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img className="h-8 w-auto" src={car_rental_app_logo} alt="DriveNow" />
              <span className="text-xl font-bold text-gray-800">DriveNow</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6">
              We're a local car rental and taxi service helping people travel comfortably for daily rides, 
              airport transfers, and outstation trips. We focus on fair pricing, well-maintained cars, 
              and 24/7 support across South India.
            </p>
            <div className="flex gap-4">
              <a href="#" className="opacity-70 hover:opacity-100 transition"><img src={assets.facebook_logo} className="w-5 h-5" alt="FB"/></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition"><img src={assets.instagram_logo} className="w-5 h-5" alt="Insta"/></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition"><img src={assets.twitter_logo} className="w-5 h-5" alt="Twitter"/></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition"><img src={assets.gmail_logo} className="w-5 h-5" alt="Email"/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 uppercase text-sm mb-4 tracking-wide">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Browse Cars</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">List Your Car</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Careers</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-gray-900 uppercase text-sm mb-4 tracking-wide">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-600 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Insurance Info</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="font-bold text-gray-900 uppercase text-sm mb-4 tracking-wide">Get in Touch</h3>
             <ul className="space-y-2 text-sm">
               <li><span className="font-medium">Email:</span> support@drivenow.com</li>
               <li><span className="font-medium">Hotline:</span> 1800-123-4567</li>
             </ul>
          </div>

        </div>

        {/* Middle Section: Detailed Locations */}
        <div className="mb-12">
          <h3 className="font-bold text-gray-900 uppercase text-sm mb-6 tracking-wide">Our Locations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {locations.map((loc, index) => (
              <div key={index} className="text-sm">
                <h4 className="font-semibold text-gray-800 mb-2">{loc.city}</h4>
                <p className="mb-1">{loc.address}</p>
                <p className="text-blue-600">{loc.phone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-sm">
          <p>© {new Date().getFullYear()} DriveNow. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Cookies</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Footer;