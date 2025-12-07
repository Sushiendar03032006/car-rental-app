import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/NewsLetter'

const Home = () => {
  return (
    // FIX EXPLANATION:
    // 1. w-full: Forces the container to be exactly 100% of the screen width.
    // 2. overflow-x-hidden: The "Nuclear" fix. It cuts off anything sticking out to the right.
    // 3. relative: Helps contain any child elements using absolute positioning.
    <div className="w-full relative overflow-x-hidden">
        <Hero/>
        <FeaturedSection/>
        <Testimonial/>
        <Newsletter/>
    </div>
  )
}

export default Home