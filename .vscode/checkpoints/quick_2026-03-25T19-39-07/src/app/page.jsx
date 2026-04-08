import Features from '@/components/Features';
import Hero from '@/components/Hero';
import PopularEvents from '@/components/PopularEvents';
import Testimonials from '@/components/Testimonials';
import React from 'react';

const Home = () => {
  return (
    <div>
      <Hero></Hero>
      <Features></Features>
      <PopularEvents></PopularEvents>
      <Testimonials></Testimonials>
    </div>
  );
};

export default Home;
