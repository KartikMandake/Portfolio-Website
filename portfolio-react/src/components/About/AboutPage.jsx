import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import '../About/About.css';
import './AboutPage.css';

export default function AboutPage({ isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [aboutData, setAboutData] = useState({
    greeting: 'About the Artist',
    paragraph1: "Hey there! I'm a passionate photographer exploring the world one frame at a time.",
    paragraph2: "With a keen eye for light and composition, my goal is to capture the essence of my subjects.",
    image_url: '/herobackground.png',
    name: 'Cinematic Buddy',
    email: 'hello@example.com',
    phone: '',
    instagram: '',
    behance: '',
    twitter: ''
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
      Object.keys(editForm).forEach(key => {
        if (key !== 'image_url') { // Let's keep file handling separate
          formData.append(key, editForm[key]);
        }
      });
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

  const { rest, last } = getGreetingParts(isEditing ? editForm.greeting : aboutData.greeting);

  return (
    <section className="about-page-container">
      {isAdmin && !isEditing && (
        <div className="admin-toolbar" style={{ margin: '0 auto 2rem', maxWidth: '1200px' }}>
          <p className="admin-status" style={{ flex: 1 }}>About Page Settings</p>
          <button onClick={handleEditClick} className="btn-edit">
            ✏️ Edit Profile
          </button>
        </div>
      )}

      {isAdmin && isEditing && (
        <div className="admin-toolbar sticky" style={{ margin: '0 auto 2rem', maxWidth: '1200px' }}>
          <p className="step-title">Editing Profile & Contacts</p>
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
                rows="5"
                className="edit-textarea"
                placeholder="Paragraph 1"
              />
              <textarea 
                value={editForm.paragraph2} 
                onChange={(e) => setEditForm({...editForm, paragraph2: e.target.value})} 
                rows="5"
                className="edit-textarea"
                placeholder="Paragraph 2"
              />

              <h3 style={{ marginTop: '2rem', color: '#c8a84b' }}>Contact & Socials</h3>
              <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="edit-input-small" placeholder="Name" />
              <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="edit-input-small" placeholder="Email Address" />
              <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="edit-input-small" placeholder="Phone Number" />
              <input value={editForm.instagram} onChange={e => setEditForm({...editForm, instagram: e.target.value})} className="edit-input-small" placeholder="Instagram URL" />
              <input value={editForm.behance} onChange={e => setEditForm({...editForm, behance: e.target.value})} className="edit-input-small" placeholder="Behance URL" />
              <input value={editForm.twitter} onChange={e => setEditForm({...editForm, twitter: e.target.value})} className="edit-input-small" placeholder="Twitter URL" />
            </div>
            
            <div className="about-image-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="about-image-wrapper">
                <div className="about-image-glow"></div>
                <img 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : editForm.image_url} 
                  alt="Profile" 
                  className="about-image" 
                />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
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
                
                <div className="contact-info">
                  <h3 className="contact-heading">Get in Touch</h3>
                  {aboutData.name && <p><strong>Name:</strong> {aboutData.name}</p>}
                  {aboutData.email && <p><strong>Email:</strong> <a href={`mailto:${aboutData.email}`}>{aboutData.email}</a></p>}
                  {aboutData.phone && <p><strong>Phone:</strong> <a href={`tel:${aboutData.phone}`}>{aboutData.phone}</a></p>}
                  
                  <div className="social-links">
                    {aboutData.instagram && <a href={aboutData.instagram} target="_blank" rel="noreferrer" className="social-link">Instagram</a>}
                    {aboutData.behance && <a href={aboutData.behance} target="_blank" rel="noreferrer" className="social-link">Behance</a>}
                    {aboutData.twitter && <a href={aboutData.twitter} target="_blank" rel="noreferrer" className="social-link">Twitter</a>}
                  </div>
                </div>
              </div>
              
              <div className="about-image-container">
                <div className="about-image-wrapper">
                  <div className="about-image-glow"></div>
                  <img src={aboutData.image_url} alt="Profile" className="about-image" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function getGreetingParts(greeting = '') {
  const parts = greeting.split(' ');
  if (parts.length > 1) {
    const lastWord = parts.pop();
    return { rest: parts.join(' '), last: lastWord };
  }
  return { rest: greeting, last: '' };
}
