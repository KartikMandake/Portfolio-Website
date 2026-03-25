import React from "react";
import "./Hero.css";
import Navbar from "./Navbar";

export default function Hero() {
  return (
    <section className="hero">
      <Navbar />



      {/* Content */}
      <div className="hero-content">
        <h1 className="glow-text">Cinematic
          Buddy</h1>
        <p className="tagline">
          Transforming visions into Cinematic reality.
        </p>


      </div>
    </section>
  );
}
