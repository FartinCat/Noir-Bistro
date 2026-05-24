import React from 'react';
import bistroImg from '../../assets/images/nordic_bistro.png';

export default function HeroBackground() {
  return (
    <div 
      className="hero-bg"
      style={{
        position: 'absolute',
        top: '90px', /* Shift below the fixed header navbar */
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${bistroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.35, /* Dim background appropriately to focus on the video */
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
