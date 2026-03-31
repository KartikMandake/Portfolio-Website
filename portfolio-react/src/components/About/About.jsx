import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './About.css';

export default function About({ isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Scene visibility states
  const [visibleScenes, setVisibleScenes] = useState(new Set());
  const sectionRef = useRef(null);

  const [aboutData, setAboutData] = useState({
    greeting: "It starts with nothing.",
    paragraph1: "Cinematic Buddy is not created.",
    paragraph2: "It is composed.",
    image_url: '/herobackground.png' // This will be the Single Flagship Frame
  });

  const [editForm, setEditForm] = useState({ ...aboutData });
  const [selectedFile, setSelectedFile] = useState(null);

  /* ---------- IntersectionObserver for 6 scenes ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleScenes(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const scenes = sectionRef.current?.querySelectorAll('.timeline-scene');
    scenes?.forEach(scene => observer.observe(scene));

    return () => observer.disconnect();
  }, []);

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
      if (!res.ok) throw new Error(data.error || 'Failed to update story');

      setAboutData(data.about);
      setIsEditing(false);
    } catch (err) {
      alert(`Save Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="about-timeline" id="about" ref={sectionRef}>
      
      {/* Admin Controls */}
      {isAdmin && (
        <div className="timeline-admin-overlay">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-timeline-edit">✏️ Edit Story</button>
          ) : (
            <div className="admin-panel">
              <button onClick={() => setIsEditing(false)} disabled={uploading}>Cancel</button>
              <button onClick={handleSaveClick} disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* SCENE 1: THE EMPTY START */}
      <div className={`timeline-scene scene-empty ${visibleScenes.has('scene-1') ? 'scene-visible' : ''}`} id="scene-1">
        <div className="scene-focal-text">
          {isEditing ? (
            <input 
              value={editForm.greeting} 
              onChange={(e) => setEditForm({...editForm, greeting: e.target.value})}
              className="edit-input-minimal"
            />
          ) : (
            <p className="minimal-statement">{aboutData.greeting}</p>
          )}
        </div>
      </div>

      {/* SCENE 2: FIRST LIGHT */}
      <div className={`timeline-scene scene-light ${visibleScenes.has('scene-2') ? 'scene-visible' : ''}`} id="scene-2">
        <div className="scene-glow-atmos" aria-hidden="true" />
        <div className="scene-focal-text">
          <p className="minimal-statement italic">Then... a feeling.</p>
        </div>
      </div>

      {/* SCENE 3: THE BUILD */}
      <div className={`timeline-scene scene-build ${visibleScenes.has('scene-3') ? 'scene-visible' : ''}`} id="scene-3">
        <div className="build-sequence">
          <span className="build-word">Light</span>
          <span className="build-arrow">→</span>
          <span className="build-word">Motion</span>
          <span className="build-arrow">→</span>
          <span className="build-word">Composition</span>
          <span className="build-arrow">→</span>
          <span className="build-word">Emotion</span>
        </div>
      </div>

      {/* SCENE 4: THE VISUAL (Flagship Frame) */}
      <div className={`timeline-scene scene-visual ${visibleScenes.has('scene-4') ? 'scene-visible' : ''}`} id="scene-4">
        <div className="flagship-container">
          <div className={`flagship-frame ${visibleScenes.has('scene-4') ? 'frame-emerge' : ''}`}>
            <img 
              src={selectedFile ? URL.createObjectURL(selectedFile) : (isEditing ? editForm.image_url : aboutData.image_url)} 
              alt="Cinematic Flagship Frame" 
              className="flagship-img"
            />
            <div className="flagship-rim-light" />
            {isEditing && (
              <div className="upload-overlay">
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                <span>Choose Master Frame</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCENE 5: THE MINDSET */}
      <div className={`timeline-scene scene-mindset ${visibleScenes.has('scene-5') ? 'scene-visible' : ''}`} id="scene-5">
        <div className="mindset-content">
          <h2 className="mindset-statement">"This is how I see the world."</h2>
          {isEditing ? (
            <div className="edit-mindset-form">
              <textarea 
                value={editForm.paragraph1} 
                onChange={(e) => setEditForm({...editForm, paragraph1: e.target.value})} 
              />
              <textarea 
                value={editForm.paragraph2} 
                onChange={(e) => setEditForm({...editForm, paragraph2: e.target.value})} 
              />
            </div>
          ) : (
            <p className="mindset-sub">
              {aboutData.paragraph1} <br />
              {aboutData.paragraph2}
            </p>
          )}
        </div>
      </div>

      {/* SCENE 6: SIGNATURE */}
      <div className={`timeline-scene scene-signature ${visibleScenes.has('scene-6') ? 'scene-visible' : ''}`} id="scene-6">
        <div className="signature-glow-line" />
        <p className="signature-branding">— Cinematic Buddy</p>
      </div>

    </section>
  );
}
