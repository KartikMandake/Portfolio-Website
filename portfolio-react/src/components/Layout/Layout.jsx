import React from 'react';
import Navbar from '../Hero/Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout({ handleSecretTap, isLanding, isAdmin }) {
  return (
    <div className="scroll-container">
      {/* We pass isLanding so Navbar knows if it should have a solid bg immediately or not */}
      <Navbar isLanding={isLanding} isAdmin={isAdmin} />
      
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>

      {/* Invisible mobile tap target for secret login */}
      <footer style={{ padding: '20px', textAlign: 'center', opacity: 0.1 }}>
        <span onTouchStart={handleSecretTap} style={{ userSelect: 'none' }}>
          © 2024 Cinematic Buddy
        </span>
      </footer>
    </div>
  );
}
