import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import ShinyText from '../ShinyText/ShinyText';

export default function Navbar({ isLanding = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!isLanding);
  const location = useLocation();

  useEffect(() => {
    // If we're not on the landing page, the navbar should always have a dark background.
    if (!isLanding) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const navLinks = [
    { name: 'Films', to: '/films' },
    { name: 'Stills', to: '/stills' },
    { name: 'Categories', to: '/categories' },
    { name: 'About', to: '/about' },
  ];

  return (
    <>
      <nav className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <ShinyText
            text="Cinematic Buddy"
            disabled={false}
            speed={3}
            className="logo-shiny"
            color="#eabf8d"
            shineColor="#ffffff"
          />
        </Link>

        {/* Desktop Links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Section / CTA */}
        <div className="nav-actions">
          <Link to="/about" className="nav-cta" style={{ textDecoration: 'none' }}>Inquiry</Link>

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.to}
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            {link.name}
          </Link>
        ))}
        <Link to="/about" className="nav-cta mt-4" style={{ display: 'block', textDecoration: 'none' }} onClick={closeMobileMenu}>Inquiry</Link>
      </div>
    </>
  );
}