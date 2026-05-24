import React from 'react';
import { BRAND } from '../../branding/config';
import heroVeoVideo from '../../assets/videos/hero-veo.mp4';

interface HeroContentProps {
  heroVisualRef?: React.RefObject<HTMLDivElement | null>;
  scrollToSection: (id: string) => void;
}

export default function HeroContent({ heroVisualRef, scrollToSection }: HeroContentProps) {
  return (
    <>
      {/* Left side: The Video / Visuals Card (Superimposed with transparent/embers composite) */}
      <div className="hero-visual" ref={heroVisualRef}>
        <video autoPlay muted loop playsInline className="hero-video-bg">
          <source src={heroVeoVideo} type="video/mp4" />
        </video>
        <div className="hero-grid" aria-hidden="true" />
        <div className="spotlight" aria-hidden="true" />
        <div className="hero-quote">
          <p>"A dining room where every course reflects the stark beauty of the North."</p>
          <span>Nordic Bistro — Chef's letter</span>
        </div>
        <div className="hero-panel">
          <p>Tonight's signature</p>
          <h2>{BRAND.signatureDish}</h2>
          <span>{BRAND.signatureDishSub}</span>
        </div>
      </div>

      {/* Right side: The Texts / Actions */}
      <div className="hero-copy">
        <dl className="stats" aria-label="Restaurant highlights">
          {BRAND.stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="eyebrow">{BRAND.heroEyebrow}</p>
        <h1>{BRAND.heroHeadline}</h1>
        <p className="lede">{BRAND.heroLede}</p>
        <div className="hero-actions">
          <a className="button" href="#reservations" onClick={e => { e.preventDefault(); scrollToSection('reservations'); }}>
            Reserve now
          </a>
        </div>
      </div>
    </>
  );
}
