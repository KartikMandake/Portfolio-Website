import React, { useState, useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '../../lib/supabase';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './MasonryGallery.css';

// ─── Default sample images fallback if database is empty ────────
const SAMPLE_IMAGES = [
  { id: 'sample-1', cloudinary_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80", alt: "Still 01", display_order: 1 },
  { id: 'sample-2', cloudinary_url: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&q=80", alt: "Still 02", display_order: 2 },
  { id: 'sample-3', cloudinary_url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600&q=80", alt: "Still 03", display_order: 3 },
];

function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="masonry-item arrange-item">
      <img src={props.url} alt={props.alt} />
      <div className="arrange-overlay">
        <span className="drag-handle">☰</span>
      </div>
    </div>
  );
}

export default function MasonryGallery({ 
  isAdmin, 
  id = "stills",
  eyebrow = "Selected Works",
  title = "Film",
  titleAccent = "board",
  subtitle = "A curated moodboard of cinematic stills."
}) {
  const [mode, setMode] = useState('view'); // 'view'|'step1_remove'|'step2_upload'|'step3_arrange'|'step4_preview'
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [columns, setColumns] = useState(3);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch gallery settings and photos from local Node.js backend on mount
  const fetchGalleryData = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/gallery');
      const data = await res.json();
      
      if (data.columns) setColumns(data.columns);
      if (data.images && data.images.length > 0) {
        setImages(data.images);
      } else {
        setImages(SAMPLE_IMAGES);
      }
    } catch (error) {
      console.error('Error fetching backend gallery data:', error);
      setImages(SAMPLE_IMAGES);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const breakpoints = {
    default: columns,
    1440: Math.min(columns, 5),
    1024: Math.min(columns, 3),
    768: Math.min(columns, 2),
    640: 1
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- Step 1: Remove ---
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} photo(s)? This cannot be undone.`)) return;

    const realIds = Array.from(selectedIds).filter(id => !String(id).startsWith('sample-'));

    try {
      if (realIds.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/gallery', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ ids: realIds })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to delete');
        }
      }

      setImages(prev => prev.filter(img => !selectedIds.has(img.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Delete Failed!\nReason: ${err.message}`);
    }
  };

  // --- Step 2: Upload ---
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setImages(prev => [...prev, data.image]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload Failed!\nReason: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Step 3: Arrange ---
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Step 5: Publish ---
  const handlePublish = async () => {
    const realImages = images.filter(img => !String(img.id).startsWith('sample-'));

    const updates = realImages.map((img, index) => {
      return {
        id: img.id,
        cloudinary_url: img.cloudinary_url,
        alt: img.alt,
        display_order: index + 1
      };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/gallery/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ updates, columns })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      
      console.log('Successfully published gallery updates.');
      setMode('view');
    } catch (err) {
      console.error("Failed to publish", err);
      alert(`Publish Failed!\nReason: ${err.message}`);
      setMode('view');
    }
  };


  // ===================== RENDER MODES =====================

  const renderViewMode = () => (
    <>
      {isAdmin && (
        <div className="admin-toolbar">
          <p className="admin-status">Admin Mode: Active</p>
          <div className="admin-actions">
            <button 
              onClick={() => { 
                setMode('step1_remove'); 
                setSelectedIds(new Set()); 
              }} 
              className="btn-edit"
            >
              ✏️ Edit Gallery
            </button>
          </div>
        </div>
      )}
      <Masonry breakpointCols={breakpoints} className="masonry-grid" columnClassName="masonry-column">
        {images.map(photo => (
          <div key={photo.id} className="masonry-item visible">
            <img src={photo.cloudinary_url} alt={photo.alt} loading="lazy" />
            <div className="masonry-overlay">
              <span className="masonry-glow-ring" />
              <p className="masonry-label">{photo.alt}</p>
            </div>
          </div>
        ))}
      </Masonry>
    </>
  );

  const renderStep1Remove = () => (
    <>
      <div className="admin-toolbar sticky">
        <p className="step-title">Step 1 — Remove Unwanted Photos</p>
        <div className="admin-actions">
          <button onClick={() => setMode('view')} className="btn-cancel">Cancel</button>
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="btn-danger">
              🗑️ Delete ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => { setSelectedIds(new Set()); setMode('step2_upload'); }} 
            className="btn-primary"
          >
            Next: Upload →
          </button>
        </div>
      </div>
      <p className="drag-hint">Click photos to select them for deletion. Deleted photos are permanently removed.</p>
      
      <Masonry breakpointCols={breakpoints} className="masonry-grid" columnClassName="masonry-column">
        {images.map(photo => {
          const isSelected = selectedIds.has(photo.id);
          return (
            <div 
              key={photo.id} 
              className={`masonry-item visible selectable ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleSelection(photo.id)}
            >
              <img src={photo.cloudinary_url} alt={photo.alt} loading="lazy" />
              <div className="select-overlay">
                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>{isSelected ? '✓' : ''}</div>
              </div>
            </div>
          );
        })}
      </Masonry>
    </>
  );

  const renderStep2Upload = () => (
    <>
      <div className="admin-toolbar sticky">
        <p className="step-title">Step 2 — Upload New Photos</p>
        <div className="admin-actions">
          <button onClick={() => setMode('step1_remove')} className="btn-cancel">← Back</button>
          <input 
            type="file" 
            accept="image/*,.heic,.heif" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleUpload} 
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-upload" disabled={uploading}>
            {uploading ? '⏳ Uploading...' : '☁️ Upload New'}
          </button>
          <button onClick={() => setMode('step3_arrange')} className="btn-primary">
            Next: Arrange →
          </button>
        </div>
      </div>
      <p className="drag-hint">Newly uploaded photos will appear at the bottom of the grid.</p>
      
      <Masonry breakpointCols={breakpoints} className="masonry-grid" columnClassName="masonry-column">
        {images.map(photo => (
          <div key={photo.id} className="masonry-item visible">
            <img src={photo.cloudinary_url} alt={photo.alt} loading="lazy" />
          </div>
        ))}
      </Masonry>
    </>
  );

  const renderStep3Arrange = () => (
    <>
      <div className="admin-toolbar sticky">
        <div className="step-header">
          <p className="step-title">Step 3 — Arrange Order</p>
          <div className="col-selector" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="col-label" style={{ color: '#9ca3af' }}>Columns: <b style={{ color: '#fff' }}>{columns}</b></span>
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={columns} 
              onChange={(e) => setColumns(Number(e.target.value))} 
              style={{ accentColor: '#c8a84b', cursor: 'grab', width: '120px' }}
            />
          </div>
        </div>
        <div className="admin-actions">
          <button onClick={() => setMode('step2_upload')} className="btn-cancel">← Back</button>
          <button onClick={() => setMode('step4_preview')} className="btn-primary">
            Next: Preview →
          </button>
        </div>
      </div>

      <p className="drag-hint">Drag images to reorder them exactly how you want them displayed.</p>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
          <div className="arrange-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {images.map(photo => (
              <SortableItem key={photo.id} id={photo.id} url={photo.cloudinary_url} alt={photo.alt} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );

  const renderStep4Preview = () => (
    <>
      <div className="admin-toolbar sticky">
        <p className="step-title">Step 4 — Preview & Publish</p>
        <div className="admin-actions">
          <button onClick={() => setMode('step3_arrange')} className="btn-cancel">← Back</button>
          <button onClick={handlePublish} className="btn-publish">
            🚀 Publish Live
          </button>
        </div>
      </div>

      <p className="drag-hint">This is exactly how your gallery will look to visitors. Click Publish to save.</p>

      <Masonry breakpointCols={breakpoints} className="masonry-grid" columnClassName="masonry-column">
        {images.map(photo => (
          <div key={photo.id} className="masonry-item visible">
            <img src={photo.cloudinary_url} alt={photo.alt} loading="lazy" />
            <div className="masonry-overlay">
              <span className="masonry-glow-ring" />
              <p className="masonry-label">{photo.alt}</p>
            </div>
          </div>
        ))}
      </Masonry>
    </>
  );

  return (
    <section className="masonry-section" id={id}>
      <div className="masonry-header">
        <p className="masonry-eyebrow">{eyebrow}</p>
        <h2 className="masonry-title">{title}<span className="masonry-title-accent">{titleAccent}</span></h2>
        <p className="masonry-subtitle">{subtitle}</p>
      </div>
      
      {mode === 'view' && renderViewMode()}
      {mode === 'step1_remove' && renderStep1Remove()}
      {mode === 'step2_upload' && renderStep2Upload()}
      {mode === 'step3_arrange' && renderStep3Arrange()}
      {mode === 'step4_preview' && renderStep4Preview()}
    </section>
  );
}
