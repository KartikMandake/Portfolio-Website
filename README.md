# Cinematic Photography Portfolio

A luxury, high-performance web portfolio built to showcase cinematic photography with a hyper-premium 3D aesthetic. 

## About the Project

This web application serves as a bespoke, immersive digital gallery centered entirely on visual excellence. Engineered not just as a static landing page, the site is designed to feel alive using fluid layouts and micro-animations. 

What sets this portfolio apart is its architecture. Rather than relying on a disconnected backend portal, this site incorporates a **Hidden WYSIWYG Admin Environment**. By triggering a secret authentication modal, the public-facing gallery gracefully morphs into an interactive admin dashboard directly on the frontend, allowing the owner to modify their live site visually.

## Key Features

- **Hyper-Premium Aesthetics**: A beautifully crafted dark-mode foundation engineered with modern typography, glassmorphism overlays, tailored accent colors, and subtle cinematic glow effects to "wow" visitors at first glance.
- **Immersive 3D Scrollytelling**: Integrated WebGL elements and smooth scroll-tied transformations create a fluid, highly-engaging journey through the artwork.
- **Transformative Admin UI**: Authenticated administrators can toggle a custom state to reveal hidden interfaces. Without redirecting to a boring "dashboard", you can modify exactly what the public sees, while you are seeing it.
- **Advanced Drag & Drop Arrangement**: Armed with a robust drag-and-drop sorting grid, the admin can visually arrange their photos into chronological or narrative order seamlessly.
- **Customizable Global Grid Topology**: A live slider lets the admin dictate exactly how many columns the masonry grid spans. Hitting "Publish" writes this geometry back to the database, ensuring all visitors immediately see the newly structured gallery.
- **Auto-Optimizing Asset Delivery**: Natively connected to **Cloudinary's API**, the platform handles raw iPhone/High-Efficiency (`.heic`) formats directly. It instantly converts, caches, and streams web-friendly formats over a CDN so the massive files load in milliseconds without any required pre-processing by the photographer.

## Technology Stack

- **Core & Build**: React 19 + Vite
- **Storage & Delivery**: Cloudinary API
- **Database, Auth & State**: Supabase (PostgreSQL with highly restricted Row-Level Security policies)
- **Interaction & Physics**: `@dnd-kit` (drag and drop), `react-masonry-css` (algorithmic grid)
- **3D & Animation**: `@react-three/fiber`, `@react-three/drei`, `framer-motion`