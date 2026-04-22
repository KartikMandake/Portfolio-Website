import React from "react";
import "./Hero.css";
import GridMotion from "../GridMotion/GridMotion";
import GlassOverlay from "./GlassOverlay";

export default function Hero() {
  const customItems = [
    '/grid_images/1ff27276745b9130e5aa74c005a1da4d.jpg',
    '/grid_images/3c23a55a748e66ace25fa3b7a596d6e0.jpg',
    '/grid_images/43a9b515face53e061ff2118f24de766.jpg',
    '/grid_images/507fddd7cee27b02a848f56de08fe2a0.jpg',
    '/grid_images/5f0b7b2617a9e2b7a89c8799c9c43142.jpg',
    '/grid_images/6082c610f7f8b476a58b448832078865.jpg',
    '/grid_images/62a1c7f170a40a58ea218a0900c553b2.jpg',
    '/grid_images/6ff9b22cde0d1627f9173dea7987e620.jpg',
    '/grid_images/741c4437d77ee73a1f31615aeb819ef9.jpg',
    '/grid_images/89e7a15abaa1045e73cdeabaf7a1b3fd.jpg',
    '/grid_images/ae146f0923ba15f7a15e8691ec2b47bc.jpg',
    '/grid_images/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg',
    '/grid_images/c30c936685069d1d05601d305a14e53a.jpg',
    '/grid_images/ca8d080e7ddcfe15f637a7a8a1a284a4.jpg',
    '/grid_images/d470153a6c00bce132e5b0330948dc2e.jpg',
    '/grid_images/e859eaa8af7266ab98c7373d989c3134.jpg',
    // Repeating 12 images to hit the 28 layout count total
    '/grid_images/1ff27276745b9130e5aa74c005a1da4d.jpg',
    '/grid_images/3c23a55a748e66ace25fa3b7a596d6e0.jpg',
    '/grid_images/43a9b515face53e061ff2118f24de766.jpg',
    '/grid_images/507fddd7cee27b02a848f56de08fe2a0.jpg',
    '/grid_images/5f0b7b2617a9e2b7a89c8799c9c43142.jpg',
    '/grid_images/6082c610f7f8b476a58b448832078865.jpg',
    '/grid_images/62a1c7f170a40a58ea218a0900c553b2.jpg',
    '/grid_images/6ff9b22cde0d1627f9173dea7987e620.jpg',
    '/grid_images/741c4437d77ee73a1f31615aeb819ef9.jpg',
    '/grid_images/89e7a15abaa1045e73cdeabaf7a1b3fd.jpg',
    '/grid_images/ae146f0923ba15f7a15e8691ec2b47bc.jpg',
    '/grid_images/b0bb8bd5446b8343fd3ae0f498aa90e5.jpg'
  ];

  return (
    <section className="hero">
      {/* Grid Motion Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <GridMotion items={customItems} gradientColor="#090a0f" />
      </div>

      {/* Extreme Glass Realism Overlay */}
      <GlassOverlay />

      {/* Content */}
      <div className="hero-content" style={{ zIndex: 10, position: 'relative', pointerEvents: 'none' }}>
        <h1 className="glow-text">Cinematic Buddy</h1>
        <p className="tagline">
          Transforming visions into Cinematic reality.
        </p>
      </div>
    </section>
  );
}