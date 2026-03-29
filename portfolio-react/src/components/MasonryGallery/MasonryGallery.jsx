import React, { useState, useEffect, useRef, useCallback } from "react";
import "./MasonryGallery.css";

// ─── Default sample images (replace with real stills) ───────────────────────
const SAMPLE_IMAGES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&q=80",
    alt: "Still 01",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=600&q=80",
    alt: "Still 02",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600&q=80",
    alt: "Still 03",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    alt: "Still 04",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
    alt: "Still 05",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1494972688394-4cc796f9e4c5?w=600&q=80",
    alt: "Still 06",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80",
    alt: "Still 07",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    alt: "Still 08",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80",
    alt: "Still 09",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    alt: "Still 10",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&q=80",
    alt: "Still 11",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    alt: "Still 12",
  },
];

// ─── Column count based on viewport width ───────────────────────────────────
function getColumnCount(width) {
  if (width < 480) return 1;
  if (width < 768) return 2;
  if (width < 1100) return 3;
  return 4;
}

// ─── Core placement logic: shortest-column first ─────────────────────────────
function distributeToColumns(images, numCols) {
  const columns = Array.from({ length: numCols }, () => []);
  const heights = new Array(numCols).fill(0);

  images.forEach((img) => {
    // Find the shortest column
    const shortestIdx = heights.indexOf(Math.min(...heights));
    columns[shortestIdx].push(img);
    // Estimate height: assume 16:9 landscape for unknown images, width = 1 unit
    // Actual reflow is handled by CSS; this keeps ordering logic correct
    heights[shortestIdx] += img.estimatedHeight || 280;
  });

  return columns;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MasonryGallery({ isAdmin = false }) {
  const [images, setImages] = useState(
    SAMPLE_IMAGES.map((img) => ({ ...img, estimatedHeight: 280, loaded: false }))
  );
  const [columns, setColumns] = useState([]);
  const [numCols, setNumCols] = useState(4);
  const [isDragOver, setIsDragOver] = useState(false);
  const [visibleIds, setVisibleIds] = useState(new Set());
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const idCounterRef = useRef(100);

  // Recalculate columns whenever images or numCols change
  useEffect(() => {
    setColumns(distributeToColumns(images, numCols));
  }, [images, numCols]);

  // Responsive: watch container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setNumCols(getColumnCount(w));
    });
    ro.observe(el);
    setNumCols(getColumnCount(el.offsetWidth));
    return () => ro.disconnect();
  }, []);

  // Intersection Observer for fade-in
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleIds((prev) => new Set(prev).add(Number(entry.target.dataset.id)));
          }
        });
      },
      { threshold: 0.1 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  const registerImageEl = useCallback((el) => {
    if (el && observerRef.current) observerRef.current.observe(el);
  }, []);

  // ── Drag & Drop new images from OS ──────────────────────────────────────────
  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const colWidth = 300; // rough estimate
        const estimatedHeight = colWidth / aspectRatio;
        idCounterRef.current += 1;
        setImages((prev) => [
          ...prev,
          {
            id: idCounterRef.current,
            src: url,
            alt: file.name,
            estimatedHeight,
            loaded: false,
          },
        ]);
      };
      img.src = url;
    });
  };

  // Mark image loaded → update estimatedHeight for future re-distributions
  const handleImageLoad = (e, id) => {
    const { naturalWidth, naturalHeight } = e.target;
    const colWidth = containerRef.current
      ? containerRef.current.offsetWidth / numCols - 16
      : 300;
    const estimatedHeight = (naturalHeight / naturalWidth) * colWidth;
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, estimatedHeight, loaded: true } : img
      )
    );
  };

  return (
    <section className="masonry-section" id="gallery">
      {/* Section header */}
      <div className="masonry-header">
        <p className="masonry-eyebrow">Selected Works</p>
        <h2 className="masonry-title">
          Film<span className="masonry-title-accent">board</span>
        </h2>
        <p className="masonry-subtitle">
          A curated moodboard of cinematic stills — drag your images in to compose your story.
        </p>
      </div>

      {/* Drop zone hint — admin only */}
      {isAdmin && (
        <div
          className={`masonry-drop-hint ${isDragOver ? "active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="drop-icon">⬇</span>
          <span>Drop images here to add them</span>
        </div>
      )}

      {/* Columns container */}
      <div
        className={`masonry-columns ${isDragOver ? "drag-over" : ""}`}
        ref={containerRef}
        onDragOver={isAdmin ? handleDragOver : undefined}
        onDragLeave={isAdmin ? handleDragLeave : undefined}
        onDrop={isAdmin ? handleDrop : undefined}
      >
        {columns.map((colImages, colIdx) => (
          <div className="masonry-col" key={colIdx}>
            {colImages.map((img, imgIdx) => {
              const isVisible = visibleIds.has(img.id);
              const delay = (colIdx * 0.07 + imgIdx * 0.09).toFixed(2);
              return (
                <div
                  key={img.id}
                  className={`masonry-item ${isVisible ? "visible" : ""}`}
                  style={{ transitionDelay: `${delay}s` }}
                  data-id={img.id}
                  ref={registerImageEl}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    onLoad={(e) => handleImageLoad(e, img.id)}
                    draggable={false}
                  />
                  <div className="masonry-overlay">
                    <span className="masonry-glow-ring" />
                    <p className="masonry-label">{img.alt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
