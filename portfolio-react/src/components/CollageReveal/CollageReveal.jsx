import React, { useEffect, useRef, useState } from "react";
import "./CollageReveal.css";

const FALLBACK_COLLAGE = [
  { id: "c1", cloudinary_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80", alt: "Work 01" },
  { id: "c2", cloudinary_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80", alt: "Work 02" },
  { id: "c3", cloudinary_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", alt: "Work 03" },
  { id: "c4", cloudinary_url: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80", alt: "Work 04" },
  { id: "c5", cloudinary_url: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80", alt: "Work 05" },
  { id: "c6", cloudinary_url: "https://images.unsplash.com/photo-1512733596533-7b00ccf8ebaf?w=800&q=80", alt: "Work 06" },
  { id: "c7", cloudinary_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80", alt: "Work 07" },
  { id: "c8", cloudinary_url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80", alt: "Work 08" },
];

export default function CollageReveal() {
  const [images, setImages] = useState([]);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.images && data.images.length > 0) {
          setImages(data.images.slice(0, 8)); // Use up to 8 images for the collage
        } else {
          setImages(FALLBACK_COLLAGE);
        }
      })
      .catch(() => setImages(FALLBACK_COLLAGE));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="collage-section" ref={sectionRef}>
      <div className="collage-header">
        <p className="collage-eyebrow">The Proof</p>
        <h2 className="collage-title">Assembled <span className="collage-accent">Visions</span></h2>
      </div>

      <div className={`collage-grid ${isVisible ? "collage-visible" : ""}`}>
        {images.map((img, idx) => (
          <div key={img.id} className={`collage-item pos-${idx + 1}`}>
            <div className="collage-frame">
              <img src={img.cloudinary_url} alt={img.alt} loading="lazy" />
              <div className="collage-overlay">
                <span className="collage-tag">Selected Frame</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
