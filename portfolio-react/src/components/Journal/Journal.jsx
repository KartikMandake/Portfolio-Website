import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import './Journal.css';

export default function Journal({ isAdmin }) {
  const [entries, setEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchEntries = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/journal');
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
    } catch (error) {
      console.error('Error fetching journal:', error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/journal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add entry');
      
      setEntries(prev => [data.entry, ...prev]);
      setIsAdding(false);
      setTitle('');
      setContent('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Add entry failed:", err);
      alert(`Add Entry Failed!\nReason: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/journal/${id}', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Delete entry failed', err);
      alert(`Delete Failed!\nReason: ${err.message}`);
    }
  };

  return (
    <section className="journal-section" id="journal">
      <div className="journal-wrapper">
        <div className="journal-header">
          <p className="journal-eyebrow">Behind The Lens</p>
          <h2 className="journal-heading">The <span className="journal-heading-accent">Journal</span></h2>
        </div>

        {isAdmin && (
          <div className="admin-toolbar" style={{ margin: '0 auto 2rem', maxWidth: '800px' }}>
            <p className="admin-status" style={{ flex: 1 }}>Journal Settings</p>
            <button onClick={() => setIsAdding(!isAdding)} className="btn-upload">
              {isAdding ? 'Cancel' : '📝 Write Entry'}
            </button>
          </div>
        )}

        {isAdmin && isAdding && (
          <form onSubmit={handleAddSubmit} className="journal-add-form">
            <input 
              type="text" 
              placeholder="Post Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              className="journal-input"
            />
            <textarea 
              placeholder="What's on your mind? (Supports basic markdown later)" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required 
              rows="6"
              className="journal-input"
            />
            <div className="journal-file-upload">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary">
                {selectedFile ? 'Image Attached ✓' : 'Add Cover Image'}
              </button>
              <button type="submit" className="btn-publish" disabled={uploading}>
                {uploading ? 'Publishing...' : 'Publish Entry'}
              </button>
            </div>
          </form>
        )}

        <div className="journal-list">
          {entries.length === 0 ? (
            <p className="no-entries">No journal entries yet.</p>
          ) : (
            entries.map(entry => (
              <article key={entry.id} className="journal-article">
                {entry.image_url && (
                  <div className="journal-image-wrapper">
                    <img src={entry.image_url} alt={entry.title} className="journal-image" />
                  </div>
                )}
                <div className="journal-content-area">
                  <header>
                    <time className="journal-date">{new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</time>
                    <h3 className="journal-article-title">{entry.title}</h3>
                  </header>
                  <p className="journal-body">{entry.content}</p>
                  {isAdmin && (
                    <button onClick={() => handleDelete(entry.id)} className="btn-danger btn-sm" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                      Trash Post
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
