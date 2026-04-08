import React, { useState, useEffect } from 'react';
import { BRAND } from './branding/config';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Note: Since ScrollControls emulates scroll, standard scroll events 
    // might not fire on the window. However, ScrollControls often uses 
    // real scroll on a hidden element.
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`topbar ${scrolled ? 'topbar--scrolled' : ''}`}>
      <div className="topbar-inner">
        <a href="#home" className="brand">
          <div className="brand-mark">{BRAND.mark}</div>
          <div className="brand-copy">
            <strong>{BRAND.name.toUpperCase()}</strong>
            <small>{BRAND.tagline}</small>
          </div>
        </a>
        
        <nav className="nav" aria-label="Main navigation">
          <a href="#story">Our Story</a>
          <a href="#menu">Menu</a>
          <a href="#reservations">Reservations</a>
        </nav>

        <div className="header-actions">
          <a href="#reservations" className="button button-sm">{BRAND.reservationCTA}</a>
        </div>
      </div>
    </header>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
