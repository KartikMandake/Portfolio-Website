import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './Films.css';

export default function Films({ isAdmin }) {
  const [films, setFilms] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // State for form
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'url'
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchFilms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/films');
      const data = await res.json();
      if (data.films) setFilms(data.films);
    } catch (error) {
      console.error('Error fetching films:', error);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Basic conversion for YouTube/Vimeo to embed urls
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com/')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
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
        // Upload file via FormData
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('alt', alt);
        
        res = await fetch('http://localhost:5000/api/films/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: formData
        });
      } else {
        // Just post the URL
        res = await fetch('http://localhost:5000/api/films', {
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this film?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/films', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ ids: [id] })
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setFilms(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Delete film failed', err);
      alert(`Delete Failed!\nReason: ${err.message}`);
    }
  };

  return (
    <section className="films-section" id="films">
      <div className="films-header">
        <p className="films-eyebrow">Director's Cut</p>
        <h2 className="films-title">Cinematic <span className="films-title-accent">Films</span></h2>
        <p className="films-subtitle">A collection of visual storytelling.</p>
      </div>

      {isAdmin && (
        <div className="admin-toolbar" style={{ margin: '0 auto 2rem', maxWidth: '1200px' }}>
          <p className="admin-status" style={{ flex: 1 }}>Films App Settings</p>
          <button onClick={() => setIsAdding(!isAdding)} className="btn-upload">
            {isAdding ? 'Cancel' : '➕ Add Film'}
          </button>
        </div>
      )}

      {isAdmin && isAdding && (
        <form onSubmit={handleAddSubmit} className="films-add-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#111', padding: '1.5rem', borderRadius: '8px', maxWidth: '800px', margin: '0 auto 2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
            <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="uploadMode" 
                value="upload" 
                checked={uploadMode === 'upload'} 
                onChange={() => setUploadMode('upload')} 
              />
              Upload File
            </label>
            <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
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
              className="film-input"
              style={{ padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid #333' }}
            />
          ) : (
            <input 
              type="url" 
              placeholder="Video URL (YouTube/Vimeo)" 
              value={videoUrl} 
              onChange={e => setVideoUrl(e.target.value)} 
              required 
              className="film-input"
            />
          )}

          <input 
            type="text" 
            placeholder="Title / Description (optional)" 
            value={alt} 
            onChange={e => setAlt(e.target.value)} 
            className="film-input"
          />
          <button type="submit" className="btn-publish" disabled={uploading}>
            {uploading ? 'Adding...' : 'Save Film'}
          </button>
        </form>
      )}

      <div className="films-grid">
        {films.length === 0 ? (
          <p className="no-films">No films available yet.</p>
        ) : (
          films.map(film => (
            <div key={film.id} className="film-card">
              <div className="video-container">
                {film.video_url.includes('res.cloudinary.com') ? (
                  <video 
                    src={film.video_url} 
                    controls 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <iframe 
                    src={getEmbedUrl(film.video_url)} 
                    title={film.alt || "Cinematic Film"}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              {film.alt && <p className="film-caption">{film.alt}</p>}
              {isAdmin && (
                <button onClick={() => handleDelete(film.id)} className="btn-danger btn-sm" style={{ marginTop: '0.5rem' }}>
                  🗑️ Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
