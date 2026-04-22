import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './AboutAdmin.css';
import './About.css';

export default function About({ isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Section & Animation Refs
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRef = useRef(null);
  const lensRef = useRef(null);

  const [aboutData, setAboutData] = useState({
    greeting: "It starts with nothing.",
    paragraph1: "Cinematic Buddy is built on intention.",
    paragraph2: "Every story is composed.",
    image_url: '/herobackground.png'
  });

  const [editForm, setEditForm] = useState({ ...aboutData });
  const [selectedFile, setSelectedFile] = useState(null);

  /* ---------- IntersectionObserver for Narrative Blocks ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );

    const blocks = sectionRef.current?.querySelectorAll('.narrative-block');
    blocks?.forEach(block => observer.observe(block));

    return () => observer.disconnect();
  }, []);

  /* ---------- Interactive Lens Light Follower ---------- */
  const handleMouseMove = (e) => {
    if (!lensRef.current) return;
    const { clientX, clientY } = e;
    const { left, top } = sectionRef.current.getBoundingClientRect();
    lensRef.current.style.transform = `translate(${clientX - left}px, ${clientY - top}px)`;
  };

  const fetchAbout = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/about');
      const data = await res.json();
      if (data.about) {
        setAboutData(data.about);
        setEditForm(data.about);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleSaveClick = async () => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('greeting', editForm.greeting);
      formData.append('paragraph1', editForm.paragraph1);
      formData.append('paragraph2', editForm.paragraph2);
      formData.append('current_image_url', aboutData.image_url);

      if (selectedFile) formData.append('file', selectedFile);

      const res = await fetch('http://localhost:5000/api/about', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update section');

      setAboutData(data.about);
      setIsEditing(false);
    } catch (err) {
      alert(`Save Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section
      className="about-elevation"
      id="about"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
    >

      {/* Interactive Lens Overlay */}
      <div className="lens-light" ref={lensRef} />

      {/* Atmospheric Background Layer */}
      <div className="atmospheric-bg">
        <span className="bg-parallax-text">STORY</span>
      </div>

      {/* Admin Controls: Contextual & Right-Aligned */}
      {isAdmin && (
        <div className="about-inline-admin">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-edit">
              ✏️ Manage Story
            </button>
          ) : (
            <div className="admin-panel">
              <button onClick={() => setIsEditing(false)} disabled={uploading}>Cancel</button>
              <button onClick={handleSaveClick} disabled={uploading} className="btn-primary">
                {uploading ? 'Saving...' : 'Save Narrative'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* BLOCK 1: HERO STATEMENT (Hook) */}
      <div className={`narrative-block block-hero ${visibleSections.has('block-1') ? 'visible' : ''}`} id="block-1">
        <div className="block-content centered">
          <h1 className="hero-statement-text apple-type">{aboutData.greeting}</h1>
          <div className="gold-metal-tag shimmer">
            <span className="tag-inner">Every feeling deserves to be remembered</span>
          </div>
        </div>
      </div>


      {/* BLOCK 2: VISUAL SPLIT (Masterpiece) */}
      <div className={`narrative-block block-visual ${visibleSections.has('block-2') ? 'visible' : ''}`} id="block-2">
        <div className="block-content visual-section">

          <div className="visual-text">
            <h2 className="split-heading apple-type">
              Not created.<br />
              <span className="accent-hero">Composed.</span>
            </h2>
            <div className="split-divider" />
            <p className="split-sub">Cinematic Buddy is built on intention. We don't just capture visuals; we craft experiences that linger in the mind long after the screen fades.</p>
          </div>

          <div className="visual-image">
            <div className="master-frame-container ken-burns">
              <img
                src={selectedFile ? URL.createObjectURL(selectedFile) : (isEditing ? editForm.image_url : aboutData.image_url)}
                alt="Cinematic Masterpiece"
                className="master-frame-img"
              />
              <div className="master-rim-light" />
              {isEditing && (
                <div className="upload-overlay">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <span>Update Master Frame</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* BLOCK 3: MINDSET & SIGNATURE (Structured) */}
      <div className={`narrative-block block-mindset ${visibleSections.has('block-3') ? 'visible' : ''}`} id="block-3">
        <div className="block-content centered">
          <h2 className="mindset-title apple-type">"This is how I see the world."</h2>

          {isEditing ? (
            <div className="edit-narrative-fields">
              <textarea
                value={editForm.paragraph1}
                onChange={(e) => setEditForm({ ...editForm, paragraph1: e.target.value })}
                placeholder="Core Vision"
              />
              <textarea
                value={editForm.paragraph2}
                onChange={(e) => setEditForm({ ...editForm, paragraph2: e.target.value })}
                placeholder="The Methodology"
              />
            </div>
          ) : (
            <div className="mindset-statements">
              <p className="mindset-line">{aboutData.paragraph1}</p>
              <p className="mindset-line">{aboutData.paragraph2}</p>
            </div>
          )}

          <div className="narrative-signature elevation-sig">
            <div className="sig-line-gold" />
            <p className="sig-text">— Cinematic Buddy</p>
          </div>
        </div>
      </div>

    </section>
  );
}
