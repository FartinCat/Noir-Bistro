import React from 'react';
import { BRAND } from './branding/config';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="brand-name">{BRAND.name.toUpperCase()}</h1>
          </div>
          <div className="header-actions">
            <button className="reservations-btn">{BRAND.reservationCTA.toUpperCase()}</button>
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
