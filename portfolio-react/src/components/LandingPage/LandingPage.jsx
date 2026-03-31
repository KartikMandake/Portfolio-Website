import React from 'react';
import Hero from '../Hero/Hero';
import RealizationMoment from '../RealizationMoment/RealizationMoment';
import About from '../About/About';
import MasonryGallery from '../MasonryGallery/MasonryGallery';

export default function LandingPage({ isAdmin }) {
  return (
    <>
      <Hero />
      <RealizationMoment />
      {/* Featured Section */}
      <MasonryGallery 
        isAdmin={isAdmin} 
        id="featured"
        eyebrow="Featured Works"
        title="Featured "
        titleAccent="Stills"
        subtitle="A snapshot of our finest cinematic captures."
      />
      <About isAdmin={isAdmin} />
    </>
  );
}
