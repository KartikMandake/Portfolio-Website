import React, { useEffect, useRef, useState } from 'react';
import './RealizationMoment.css';

const FALLBACK_FRAMES = [
  { id: 'f1', cloudinary_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', alt: 'Cinematic Still 01' },
  { id: 'f2', cloudinary_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80', alt: 'Cinematic Still 02' },
  { id: 'f3', cloudinary_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', alt: 'Cinematic Still 03' },
  { id: 'f4', cloudinary_url: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80', alt: 'Cinematic Still 04' },
  { id: 'f5', cloudinary_url: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80', alt: 'Cinematic Still 05' },
];

export default function RealizationMoment() {
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(0); 
  const [frames, setFrames] = useState([]);

  // Trigger reveal phases on intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setPhase(1), 300); // Speeding up for single-screen impact
          setTimeout(() => setPhase(2), 1000); 
          setTimeout(() => setPhase(3), 1800); 
          setTimeout(() => setPhase(4), 2400); 
        } else {
          setPhase(0);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch gallery images
  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then(r => r.json())
      .then(data => {
        const imgs = data.images && data.images.length > 0 ? data.images : FALLBACK_FRAMES;
        // Duplicate for infinite auto-scroll loop
        setFrames([...imgs, ...imgs]); 
      })
      .catch(() => setFrames([...FALLBACK_FRAMES, ...FALLBACK_FRAMES]));
  }, []);

  return (
    <section className="realization-section" id="screen2layout" ref={sectionRef}>
      <div className="rm-grain" aria-hidden="true" />
      <div className="rm-spotlight" aria-hidden="true" />
      <div className="rm-light-leak" aria-hidden="true" />

      {/* ── CONSOLIDATED COMPOSITION ── */}
      <div className="rm-composition">
        
        {/* Emotional Text Block */}
        <div className="rm-text-block">
          <h2 className={`rm-main-line ${phase >= 1 ? 'rm-visible' : ''}`}>
            Frames don't capture moments.
          </h2>
          <h2 className={`rm-main-line rm-emphasis ${phase >= 2 ? 'rm-visible' : ''}`}>
            They make you feel them.
          </h2>
          <p className={`rm-secondary ${phase >= 3 ? 'rm-visible' : ''}`}>
            Cinematic Buddy builds visuals<br />that stay with you.
          </p>
          {/* Transitional Bridge moved here */}
          <div className={`rm-connector-glow ${phase >= 4 ? 'rm-glow-visible' : ''}`} aria-hidden="true" />
        </div>

        {/* Constant Motion Film Reel Strip */}
        <div className={`rm-reel-wrapper ${phase >= 4 ? 'rm-reel-visible' : ''}`} aria-hidden="true">
          <div className="rm-reel-edge rm-reel-edge--top">
            <div className="rm-perfs">
              {/* Duplicated set for infinite seamless loop */}
              {Array.from({ length: 120 }).map((_, i) => <span key={`top-${i}`} className="rm-perf" />)}
            </div>
          </div>

          <div className="rm-reel-track">
            <div className="rm-reel-strip">
              {frames.map((frame, i) => (
                <div key={`${frame.id}-${i}`} className="rm-frame">
                  <img src={frame.cloudinary_url} alt={frame.alt} loading="lazy" draggable="false" />
                  <div className="rm-frame-tint" />
                  <div className="rm-frame-glow" />
                </div>
              ))}
            </div>
          </div>

          <div className="rm-reel-edge rm-reel-edge--bottom">
            <div className="rm-perfs">
              {/* Duplicated set for infinite seamless loop */}
              {Array.from({ length: 120 }).map((_, i) => <span key={`bottom-${i}`} className="rm-perf" />)}
            </div>
          </div>

          <div className="rm-reel-vignette rm-reel-vignette--left" />
          <div className="rm-reel-vignette rm-reel-vignette--right" />
        </div>

      </div>
    </section>
  );
}
