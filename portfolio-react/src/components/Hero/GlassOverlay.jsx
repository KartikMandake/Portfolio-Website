import React, { useRef, useEffect, useState } from 'react';

export default function GlassOverlay() {
  const containerRef = useRef();
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',

        // PURE GLASS EFFECT ONLY
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',

        // optional subtle tint (remove if you want ultra-clean)
        background: 'rgba(10, 12, 18, 0.15)',
      }}
    />
  );
}