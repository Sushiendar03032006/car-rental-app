// Home.jsx
import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/NewsLetter'
// import Footer from '../components/Footer' // Footer is likely in App.jsx or Layout

const Home = () => {
  return (
    // Added overflow-hidden to prevent horizontal scrolling issues on mobile
    <div className="w-full overflow-hidden">
        <Hero/>
        <FeaturedSection/>
        <Testimonial/>
        <Newsletter/>
    </div>
  )
}

export default Home