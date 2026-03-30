import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './About.css';

export default function About({ isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [aboutData, setAboutData] = useState({
    greeting: 'About the Artist',
    paragraph1: "Hey there! I'm a passionate photographer exploring the world one frame at a time. My journey began with a simple camera and a profound desire to freeze fleeting moments into eternal memories. Over the years, I've honed my craft to specialize in cinematic, mood-driven photography that tells a compelling story.",
    paragraph2: "I believe that every face, every landscape, and every shadow holds a narrative waiting to be unraveled. With a keen eye for light and composition, my goal is to capture the essence of my subjects and evoke genuine emotions through my art.",
    image_url: '/herobackground.png'
  });

  const [editForm, setEditForm] = useState({ ...aboutData });
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({ ...aboutData });
    setSelectedFile(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('greeting', editForm.greeting);
      formData.append('paragraph1', editForm.paragraph1);
      formData.append('paragraph2', editForm.paragraph2);
      formData.append('current_image_url', aboutData.image_url);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('http://localhost:5000/api/about', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update about section');

      setAboutData(data.about);
      setEditForm(data.about);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert(`Save Failed!\nReason: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getGreetingParts = (greeting) => {
    const parts = greeting.split(' ');
    if (parts.length > 1) {
      const lastWord = parts.pop();
      return { rest: parts.join(' '), last: lastWord };
    }
    return { rest: greeting, last: '' };
  };

  const { rest, last } = getGreetingParts(isEditing ? editForm.greeting : aboutData.greeting);

  return (
    <section className="about-section" id="about">
      {isAdmin && !isEditing && (
        <div className="admin-toolbar" style={{ margin: '0 auto 2rem', maxWidth: '1200px' }}>
          <p className="admin-status" style={{ flex: 1 }}>About Section Settings</p>
          <button onClick={handleEditClick} className="btn-edit">
            ✏️ Edit About
          </button>
        </div>
      )}

      {isAdmin && isEditing && (
        <div className="admin-toolbar sticky" style={{ margin: '0 auto 2rem', maxWidth: '1200px' }}>
          <p className="step-title">Editing About Section</p>
          <div className="admin-actions">
            <button onClick={handleCancelClick} className="btn-cancel" disabled={uploading}>Cancel</button>
            <button onClick={handleSaveClick} className="btn-publish" disabled={uploading}>
              {uploading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="about-content">
        {isEditing ? (
          <div className="about-grid">
            <div className="about-text" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                value={editForm.greeting} 
                onChange={(e) => setEditForm({...editForm, greeting: e.target.value})} 
                className="edit-input" 
                style={{ fontSize: '2rem', padding: '0.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                placeholder="Greeting (e.g., About the Artist)"
              />
              <textarea 
                value={editForm.paragraph1} 
                onChange={(e) => setEditForm({...editForm, paragraph1: e.target.value})} 
                rows="6"
                style={{ padding: '0.5rem', background: 'transparent', color: '#ccc', border: '1px solid #333', borderRadius: '4px', width: '100%', resize: 'vertical' }}
                placeholder="Paragraph 1"
              />
              <textarea 
                value={editForm.paragraph2} 
                onChange={(e) => setEditForm({...editForm, paragraph2: e.target.value})} 
                rows="6"
                style={{ padding: '0.5rem', background: 'transparent', color: '#ccc', border: '1px solid #333', borderRadius: '4px', width: '100%', resize: 'vertical' }}
                placeholder="Paragraph 2"
              />
            </div>
            
            <div className="about-image-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="about-image-wrapper">
                <div className="about-image-glow"></div>
                <img 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : editForm.image_url} 
                  alt="The Photographer" 
                  className="about-image" 
                />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                style={{ padding: '0.5rem 1rem', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="about-title">{rest} <span className="about-glow">{last}</span></h2>
            
            <div className="about-grid">
              <div className="about-text">
                <p>{aboutData.paragraph1}</p>
                {aboutData.paragraph2 && <p>{aboutData.paragraph2}</p>}
              </div>
              
              <div className="about-image-container">
                <div className="about-image-wrapper">
                  <div className="about-image-glow"></div>
                  <img src={aboutData.image_url} alt="The Photographer" className="about-image" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
