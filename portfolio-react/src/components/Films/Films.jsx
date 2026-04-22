import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './Films.css';

export default function Films({ isAdmin }) {
  const [films, setFilms] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  
  // Admin Form State
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'url'
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  // MOCK CATEGORIES LOGIC: Since the backend doesn't store categories yet,
  // we will artificially slice the existing films into Netflix-style rows.
  const categories = ["Commercials", "Weddings", "Fashion", "Short Films"];

  const fetchFilms = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/films');
      const data = await res.json();
      if (data.films) setFilms(data.films);
    } catch (error) {
      console.error('Error fetching films:', error);
    }
  };

  useEffect(() => {
    fetchFilms();
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Prevent appending embed parameters continually
    let cleanUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      cleanUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      cleanUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    } else if (url.includes('vimeo.com/')) {
      cleanUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    
    // Add autoplay parameter securely to embedded iframes
    if (cleanUrl.includes('?')) {
      return `${cleanUrl}&autoplay=1&rel=0`;
    }
    return `${cleanUrl}?autoplay=1&rel=0`;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let res;
      
      if (uploadMode === 'upload' && videoFile) {
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('alt', alt);
        
        res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/films/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: formData
        });
      } else {
        res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/films', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ video_url: videoUrl, alt })
        });
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add film');
      
      setFilms(prev => [...prev, data.film]);
      setIsAdding(false);
      setVideoUrl('');
      setVideoFile(null);
      setAlt('');
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Add film failed:", err);
      alert(`Add Film Failed!\nReason: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent opening modal
    if (!window.confirm("Delete this film?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/films', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ ids: [id] })
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setFilms(prev => prev.filter(f => f.id !== id));
      if (selectedFilm?.id === id) setSelectedFilm(null);
    } catch (err) {
      console.error('Delete film failed', err);
      alert(`Delete Failed!\nReason: ${err.message}`);
    }
  };

  const handleItemHover = (e) => {
    const videoElem = e.currentTarget.querySelector('video');
    if (videoElem) {
      videoElem.play().catch(() => {});
    }
  };

  const handleItemLeave = (e) => {
    const videoElem = e.currentTarget.querySelector('video');
    if (videoElem) {
      videoElem.pause();
      videoElem.currentTime = 0;
    }
  };

  // Group films into abstract mocked categories for the Netflix Row Layout
  const rowSize = Math.max(1, Math.ceil(films.length / categories.length));
  const mappedRows = categories.map((cat, index) => {
    const items = films.slice(index * rowSize, (index + 1) * rowSize);
    return { title: cat, items };
  });

  return (
    <div className="films-page">
      
      {/* 1. SECION: FULLSCREEN HERO */}
      <section className="films-hero">
        {/* Cinematic Background Video (Autoplay, Loop, Muted) */}
        <video 
          className="hero-video-bg"
          src="/hero_film.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Director's Cut</h1>
          <p className="hero-subtitle">High-End Visual Storytelling</p>
        </div>
        <div className="hero-scroll-indicator">
          Scroll Down<br/>↓
        </div>
      </section>

      {/* 2. SECTION: CONTENT (ROWS) */}
      <section className="films-content">
        
        {/* Admin Section Overrides - Dark Theme styled */}
        {isAdmin && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
            <div className="admin-toolbar admin-toolbar-dark" style={{ padding: '1rem', borderRadius: '8px', display: 'flex' }}>
              <p className="admin-status" style={{ flex: 1, fontWeight: 'bold' }}>Films Database Settings</p>
              <button onClick={() => setIsAdding(!isAdding)} className="btn-admin-primary">
                {isAdding ? 'Cancel' : '➕ Add Film'}
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleAddSubmit} className="admin-form-dark" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="uploadMode" 
                      value="upload" 
                      checked={uploadMode === 'upload'} 
                      onChange={() => setUploadMode('upload')} 
                    />
                    Upload File
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="uploadMode" 
                      value="url" 
                      checked={uploadMode === 'url'} 
                      onChange={() => setUploadMode('url')} 
                    />
                    Link URL
                  </label>
                </div>

                {uploadMode === 'upload' ? (
                  <input 
                    type="file" 
                    accept="video/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    required 
                    className="film-input-dark"
                    style={{ padding: '0.5rem' }}
                  />
                ) : (
                  <input 
                    type="url" 
                    placeholder="Video URL (YouTube/Vimeo)" 
                    value={videoUrl} 
                    onChange={e => setVideoUrl(e.target.value)} 
                    required 
                    className="film-input-dark"
                    style={{ padding: '0.75rem' }}
                  />
                )}

                <input 
                  type="text" 
                  placeholder="Title / Description (optional)" 
                  value={alt} 
                  onChange={e => setAlt(e.target.value)} 
                  className="film-input-dark"
                  style={{ padding: '0.75rem' }}
                />
                <button type="submit" className="btn-admin-primary" disabled={uploading}>
                  {uploading ? 'Adding...' : 'Save Film'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Netflix Category Rows */}
        {films.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '4rem', fontStyle: 'italic', opacity: 0.6 }}>No films available to screen.</p>
        ) : (
          mappedRows.map((row, index) => {
            if (row.items.length === 0) return null; // Hide empty mock categories
            
            return (
              <div key={index} className="film-row-section">
                <h2 className="row-title">{row.title}</h2>
                <div className="film-row-slider">
                  {row.items.map(film => {
                    const isDirectVideo = film.video_url.includes('res.cloudinary.com') || film.video_url.match(/\.(mp4|webm|ogg)$/i);
                    // Extracting youtube image thumbnail magically isn't bulletproof without API, so if it's an iframe let's just show a black box with the title, or if it's direct video, it plays on hover.
                    
                    return (
                      <div 
                        key={film.id} 
                        className="film-thumbnail"
                        onMouseEnter={handleItemHover}
                        onMouseLeave={handleItemLeave}
                        onClick={() => setSelectedFilm(film)}
                      >
                        {isDirectVideo ? (
                          <video 
                            src={film.video_url} 
                            muted
                            loop
                            playsInline
                            className="film-thumbnail-media"
                          />
                        ) : (
                          // For YouTube/Vimeo where we can't easily snag a thumbnail, we'll embed the iframe extremely restricted, disabled pointer events so clicks pass to the modal
                          <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none', background: '#000' }}>
                             <iframe 
                               src={getEmbedUrl(film.video_url).replace('autoplay=1', 'autoplay=0')} 
                               style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.3)' }}
                               title={film.alt || "Feature"}
                               frameBorder="0" 
                             />
                             {/* Overlay shield to capture clicks + dark gradient */}
                             <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10 }}></div>
                          </div>
                        )}
                        
                        <div className="film-thumbnail-overlay">
                          <p className="film-thumbnail-title">{film.alt || 'Untitled Cinematic Cut'}</p>
                          {isAdmin && (
                            <button 
                              onClick={(e) => handleDelete(film.id, e)} 
                              className="btn-admin-danger" 
                              style={{ position: 'relative', zIndex: 20 }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 3. EXPANDED MODAL VIEW */}
      {selectedFilm && (
        <div className="film-modal-overlay" onClick={() => setSelectedFilm(null)}>
          <div className="film-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFilm(null)}>×</button>
            <div className="modal-video-wrapper">
              {selectedFilm.video_url.includes('res.cloudinary.com') || selectedFilm.video_url.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  src={selectedFilm.video_url} 
                  controls 
                  autoPlay
                />
              ) : (
                <iframe 
                  src={getEmbedUrl(selectedFilm.video_url)} 
                  title={selectedFilm.alt || "Cinematic Screen"}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{selectedFilm.alt || 'Untitled Feature Film'}</h2>
              <span className="modal-role">Director / Editor</span>
              <p className="modal-desc">
                An exploration of visual tension and cinematic rhythm. This project showcases technical mastery of color grading and environmental storytelling to create an immersive luxury presentation.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
