import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './RealizationMoment.css';

const FALLBACK_FRAMES = [
  { id: 'f1', cloudinary_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', alt: 'Cinematic Still 01' },
  { id: 'f2', cloudinary_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80', alt: 'Cinematic Still 02' },
  { id: 'f3', cloudinary_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', alt: 'Cinematic Still 03' },
  { id: 'f4', cloudinary_url: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80', alt: 'Cinematic Still 04' },
  { id: 'f5', cloudinary_url: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80', alt: 'Cinematic Still 05' },
];

export default function RealizationMoment({ isAdmin }) {
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(0); 
  const [frames, setFrames] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Trigger reveal phases on intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setPhase(1), 300);
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

  const fetchFrames = () => {
    fetch('http://localhost:5000/api/realization')
      .then(r => r.json())
      .then(data => {
        const imgs = data.frames && data.frames.length > 0 ? data.frames : FALLBACK_FRAMES;
        setFrames([...imgs, ...imgs]); // Duplicate for loop
      })
      .catch(() => setFrames([...FALLBACK_FRAMES, ...FALLBACK_FRAMES]));
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/realization/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      fetchFrames();
    } catch (err) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this frame?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/realization', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: [id] })
      });

      if (!res.ok) throw new Error('Delete failed');
      fetchFrames();
    } catch (err) {
      alert(`Delete Failed: ${err.message}`);
    }
  };

  return (
    <section className="realization-section" id="screen2layout" ref={sectionRef}>
      <div className="rm-grain" aria-hidden="true" />
      <div className="rm-spotlight" aria-hidden="true" />
      <div className="rm-light-leak" aria-hidden="true" />

      {/* Admin Manager Overlay */}
      {isAdmin && isManaging && (
        <div className="rm-manager-overlay">
          <div className="admin-toolbar sticky">
            <div className="step-header">
              <p className="step-title">Film Reel Manager</p>
              <label className="rm-upload-label btn-upload" style={{ margin: 0, cursor: 'pointer' }}>
                {uploading ? '⏳ Uploading...' : '☁️ Upload New'}
                <input type="file" onChange={handleUpload} hidden disabled={uploading} />
              </label>
            </div>
            <div className="admin-actions">
              <button onClick={() => setIsManaging(false)} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
          
          <div className="rm-manager-grid">
            {(frames.length > 0 ? frames.slice(0, frames.length / 2) : []).map((frame) => (
              <div key={frame.id} className="rm-manager-item">
                <img src={frame.cloudinary_url} alt="" />
                <button onClick={() => handleDelete(frame.id)} className="rm-delete-btn">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className={`rm-connector-glow ${phase >= 4 ? 'rm-glow-visible' : ''}`} aria-hidden="true" />
        </div>

        {/* Admin Toggle: Positioned just above the reel on the right */}
        {isAdmin && !isManaging && (
          <div className="rm-inline-admin">
            <button onClick={() => setIsManaging(true)} className="btn-edit">
              ✏️ Manage Reel
            </button>
          </div>
        )}

        {/* Constant Motion Film Reel Strip */}
        <div className={`rm-reel-wrapper ${phase >= 4 ? 'rm-reel-visible' : ''}`} aria-hidden="true">
          <div className="rm-reel-edge rm-reel-edge--top">
            <div className="rm-perfs">
              {Array.from({ length: 120 }).map((_, i) => <span key={`top-${i}`} className="rm-perf" />)}
            </div>
          </div>

          <div className="rm-reel-track">
            <div className="rm-reel-strip">
              {frames.map((frame, i) => (
                <div key={`${frame.id || 'f'}-${i}`} className="rm-frame">
                  <img src={frame.cloudinary_url} alt={frame.alt} loading="lazy" draggable="false" />
                  <div className="rm-frame-tint" />
                  <div className="rm-frame-glow" />
                </div>
              ))}
            </div>
          </div>

          <div className="rm-reel-edge rm-reel-edge--bottom">
            <div className="rm-perfs">
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
