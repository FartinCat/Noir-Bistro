import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { Layout } from './Layout';
import Portal from './components/canvas/Portal';
import NordicAurora from './components/canvas/NordicAurora';
import MenuPreview from './components/ui/MenuPreview';
import HeroBackground from './components/ui/HeroBackground';
import HeroContent from './components/ui/HeroContent';
import { BRAND } from './branding/config';

import oysterImg from './assets/images/oyster-on-ice.jpg';
import halibutImg from './assets/images/halibut-fish.jpg';
import wagyuImg from './assets/images/wagyu-beef.jpg';
import chocolateImg from './assets/images/chocolate-dessert.jpg';
import atmos1Img from './assets/images/atmos-1.png';
import atmos2Img from './assets/images/atmos-2.png';
import atmos3Img from './assets/images/atmos-3.png';
import heroVeoVideo from './assets/videos/hero-veo.mp4';
import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface TrustSignal {
  icon: string;
  label: string;
  value: string;
}

interface MenuItem {
  course: string;
  title: string;
  description: string;
  price: string;
  image: string;
}

// ─── MENU DATA ───────────────────────────────────────────────────────────────
const menuItems: MenuItem[] = [
  {
    course: 'Prologue',
    title: 'Oyster & Snow',
    description: 'Fjord oyster · frozen cucumber mignonette · sea herbs.',
    price: '—',
    image: oysterImg,
  },
  {
    course: 'Chapter I',
    title: 'Cured Scallop',
    description: 'Kohlrabi · white currant · elderflower oil.',
    price: '—',
    image: halibutImg,
  },
  {
    course: 'Chapter II',
    title: 'Arctic Char',
    description: 'Smoked bone broth · sea buckthorn · frozen dill.',
    price: '—',
    image: halibutImg,
  },
  {
    course: 'Chapter III',
    title: 'King Crab',
    description: 'Glacial meltwater butter · pine shoots · white asparagus.',
    price: '—',
    image: wagyuImg,
  },
  {
    course: 'Epilogue',
    title: 'Cloudberry',
    description: 'Whipped skyr · white chocolate snow · pine.',
    price: '—',
    image: chocolateImg,
  },
  {
    course: 'Mignardises',
    title: 'Ice & Stone',
    description: 'Birch syrup caramels · sea salt truffles.',
    price: '—',
    image: chocolateImg,
  },
];

// ─── TRUST SIGNALS ───────────────────────────────────────────────────────────
const trustSignals: TrustSignal[] = [
  { icon: '✦', label: 'Nordic Times', value: '"The most refined tasting experience north of Oslo."' },
  { icon: '✦', label: 'Culinary Arts Review', value: '"A masterclass in restraint and purity."' },
  { icon: '✦', label: 'Bookings this month', value: '214 confirmed via this page' },
  { icon: '✦', label: 'Guest return rate', value: '68% rebook within 90 days' },
];

const wineList = [
  { name: 'Domaine Leflaive Puligny-Montrachet', region: 'Burgundy, France', year: 2020, price: '280' },
  { name: 'Kongsgaard Chardonnay', region: 'Napa Valley, USA', year: 2019, price: '320' },
  { name: 'Egon Müller Scharzhofberger Riesling', region: 'Mosel, Germany', year: 2021, price: '410' },
  { name: 'Domaine de la Romanée-Conti La Tâche', region: 'Burgundy, France', year: 2018, price: '—' },
];

const chefNotes = [
  {
    title: 'On Sourcing',
    content: 'Every ingredient is traced to its precise fjord, forest floor, or coastal rock. We work exclusively with foragers and small-scale fishermen who understand the rhythm of the North.',
  },
  {
    title: 'On Technique',
    content: 'Preservation is our primary tool: smoking with birch, curing with sea salt, fermenting with wild yeasts. The result is depth without heaviness.',
  },
  {
    title: 'On Seasonality',
    content: 'Our menu shifts with the ice melt. Winter brings king crab and root vegetables; summer introduces wild berries and the first shoots of sea kale.',
  },
];

// ─── SCROLL TO SECTION (works inside Drei ScrollControls) ─────────────────
// href anchors don't work inside Drei's scroll container — the internal
// scrollable div doesn't respond to native anchor jumps. We find the element
// and programmatically scroll the Drei container div instead.
function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  let container: HTMLElement | null = target.parentElement;
  while (container) {
    const style = window.getComputedStyle(container);
    if (style.overflow === 'auto' || style.overflow === 'scroll' ||
        style.overflowY === 'auto' || style.overflowY === 'scroll') {
      break;
    }
    container = container.parentElement;
  }
  if (container) {
    let offsetTop = 0;
    let current: HTMLElement | null = target;
    while (current && current !== container) {
      offsetTop += current.offsetTop;
      current = current.offsetParent as HTMLElement;
    }
    container.scrollTo({ top: offsetTop, behavior: 'smooth' });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ─── SCROLL WATCHER (inside Canvas context) ────────────────────────────────
// Reads Drei ScrollControls offset and pushes header/nudge state up
const ScrollWatcher: React.FC<{
  onScroll: (offset: number) => void;
}> = ({ onScroll }) => {
  const scroll = useScroll();
  useFrame(() => {
    onScroll(scroll.offset);
  });
  return null;
};

// ─── STICKY HEADER ───────────────────────────────────────────────────────────
const StickyHeader: React.FC<{ scrolled: boolean }> = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header-inner">
        <a href="#home" className="logo" aria-label="Nordic Bistro Home">
          <span className="logo-icon">◈</span>
          <span className="logo-text">{BRAND.name}</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story" onClick={e => { e.preventDefault(); scrollToSection('story'); }}>Story</a>
          <a href="#experience" onClick={e => { e.preventDefault(); scrollToSection('experience'); }}>Experience</a>
          <a href="#menu" onClick={e => { e.preventDefault(); scrollToSection('menu'); }}>Menu</a>
          <a href="#private-dining" onClick={e => { e.preventDefault(); scrollToSection('private-dining'); }}>Private Dining</a>
          <a href="#reservations" className="nav-cta" onClick={e => { e.preventDefault(); scrollToSection('reservations'); }}>Reserve</a>
        </nav>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger" />
        </button>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu-inner">
          <nav>
            <a href="#story" onClick={e => { e.preventDefault(); scrollToSection('story'); setMobileMenuOpen(false); }}>Story</a>
            <a href="#experience" onClick={e => { e.preventDefault(); scrollToSection('experience'); setMobileMenuOpen(false); }}>Experience</a>
            <a href="#menu" onClick={e => { e.preventDefault(); scrollToSection('menu'); setMobileMenuOpen(false); }}>Menu</a>
            <a href="#private-dining" onClick={e => { e.preventDefault(); scrollToSection('private-dining'); setMobileMenuOpen(false); }}>Private Dining</a>
            <a href="#reservations" onClick={e => { e.preventDefault(); scrollToSection('reservations'); setMobileMenuOpen(false); }}>Reserve</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Lighting the Embers');
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Scroll-driven state handler (called from ScrollWatcher inside Canvas)
  const handleScrollUpdate = useCallback((offset: number) => {
    // offset is 0..1 across all pages
    setHeaderScrolled(offset > 0.02);
    setNudgeVisible(offset > 0.08);
  }, []);

  // Loading ritual
  useEffect(() => {
    const texts = ['Lighting the Embers', 'Preparing the Table', 'Decanting the Terroir'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < texts.length - 1) {
        i++;
        setLoadingText(texts[i]);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      setSceneLoaded(true);
      clearInterval(interval);
    }, 3200);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Reveal observer — use a staggered timer since IntersectionObserver
  // doesn't work reliably inside Drei's ScrollControls transformed container.
  // We make elements visible progressively after scene loads.
  useEffect(() => {
    if (!sceneLoaded) return;
    const reveals = Array.from(document.querySelectorAll('.reveal'));
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 120 + i * 80);
    });
  }, [sceneLoaded]);

  // Form handling
  const validateForm = useCallback((formData: FormData): boolean => {
    const errors: Record<string, string> = {};
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const guests = formData.get('guests') as string;

    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!email || !email.includes('@')) errors.email = 'Valid email required';
    if (!phone) errors.phone = 'Phone number required';
    if (!date) errors.date = 'Date required';
    if (!time) errors.time = 'Time required';
    if (!guests) errors.guests = 'Guest count required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) return;
    setFormStatus('submitting');
    await new Promise(resolve => setTimeout(resolve, 1600));
    setFormStatus('success');
  }, [validateForm]);

  return (
    <Layout>
      <StickyHeader scrolled={headerScrolled} />

      {!sceneLoaded && (
        <div className="ritual-overlay">
          <div className="ritual-content">
            <span className="ritual-icon">✦</span>
            <p className="ritual-text">{loadingText}</p>
            <div className="ritual-bar" />
          </div>
        </div>
      )}

      {/* 3D Scene Layer */}
      <div className={`canvas-container ${sceneLoaded ? 'canvas-container--visible' : ''}`} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: sceneLoaded ? 1 : 0, transition: 'opacity 2s ease' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ScrollControls pages={11} damping={0.15} infinite={false}>
              <ScrollWatcher onScroll={handleScrollUpdate} />
              <NordicAurora />
            <Portal />
            
            <Scroll html style={{ width: '100%' }}>
              <div className="noise" aria-hidden="true" />
              
              <main id="home">
                {/* ─── HERO SECTION ─── */}
                <section className="hero reveal" ref={heroRef}>
                  <HeroBackground />
                  <HeroContent heroVisualRef={heroVisualRef} scrollToSection={scrollToSection} />
                </section>

                {/* ─── TRUST STRIP ─── */}
                <section className="trust-strip reveal">
                  {trustSignals.map((t, i) => (
                    <div className="trust-item" key={i}>
                      <span className="trust-icon">{t.icon}</span>
                      <div className="trust-body">
                        <span className="trust-source">{t.label}</span>
                        <span className="trust-value">{t.value}</span>
                      </div>
                    </div>
                  ))}
                </section>

                {/* ─── STORY SECTION ─── */}
                <section id="story" className="section reveal story-grid">
                  <div className="story-panel">
                    <p className="eyebrow">Our Story</p>
                    <h2>Born from the silence of the Arctic.</h2>
                    <p>We draw inspiration from the stark landscapes of the North. Our philosophy is rooted in purity.</p>
                  </div>
                  <div className="service-panel">
                    <div><span className="service-label">Philosophy</span><strong>Arctic Minimalism</strong></div>
                    <div><span className="service-label">Sourcing</span><strong>Wild & foraged</strong></div>
                  </div>
                </section>

                {/* ─── CHEF'S NOTES ─── */}
                <section id="chef" className="section reveal chef-notes">
                  <div className="section-intro">
                    <p className="eyebrow">Chef's Notes</p>
                    <h2>A philosophy expressed through ingredients.</h2>
                  </div>
                  <div className="chef-grid">
                    {chefNotes.map((note, idx) => (
                      <article key={idx} className="chef-card">
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                      </article>
                    ))}
                  </div>
                </section>

                {/* ─── EXPERIENCE ─── */}
                <section id="experience" className="section reveal split">
                  <div className="section-intro">
                    <p className="eyebrow">The Experience</p>
                    <h2>Designed to feel curated before the first course.</h2>
                  </div>
                  <div className="feature-grid">
                    <article className="feature-card"><h3>Pure Origins</h3><p>Every ingredient is traceable.</p></article>
                    <article className="feature-card"><h3>Pristine Space</h3><p>Removing every distraction.</p></article>
                    <article className="feature-card"><h3>Profound Ritual</h3><p>Limited to 24 guests.</p></article>
                  </div>
                </section>

                {/* ─── GALLERY ─── */}
                <section className="section reveal gallery-section">
                  <div className="gallery-grid">
                    <article className="gallery-card gallery-tall">
                      <img src={atmos1Img} alt="Nordic atmosphere" className="gallery-img" />
                      <div className="gallery-content">
                        <span className="gallery-kicker">The Space</span>
                        <h3>Pure. Pristine. Profound.</h3>
                      </div>
                    </article>
                    <article className="gallery-card">
                      <img src={atmos2Img} alt="Nordic cuisine" className="gallery-img" />
                      <div className="gallery-content">
                        <span className="gallery-kicker">The Craft</span>
                        <h3>Wild Ingredients</h3>
                      </div>
                    </article>
                    <article className="gallery-card">
                      <img src={atmos3Img} alt="Nordic detail" className="gallery-img" />
                      <div className="gallery-content">
                        <span className="gallery-kicker">The Detail</span>
                        <h3>Nothing Wasted</h3>
                      </div>
                    </article>
                  </div>
                </section>

                <MenuPreview />

                {/* ─── RESERVATIONS ─── */}
                <section id="reservations" className="section reveal reservation">
                  <div className="reservation-copy">
                    <h2>Secure your place.</h2>
                    <p>Reservations confirmed via concierge within 24 hours.</p>
                  </div>

                  {formStatus === 'success' ? (
                    <div className="success-panel"><h3>Request received.</h3><p>We will contact you soon.</p></div>
                  ) : (
                    <form className="reservation-form" onSubmit={handleSubmit}>
                      <div className="form-row">
                        <input required name="firstName" placeholder="First Name" />
                        <input required name="lastName" placeholder="Last Name" />
                      </div>
                      <input required name="email" type="email" placeholder="Email" />
                      <input required name="phone" type="tel" placeholder="Phone" />
                      <div className="form-row">
                        <input required name="date" type="date" />
                        <select required name="time">
                          <option value="19:00">7:00 PM</option>
                          <option value="20:00">8:00 PM</option>
                        </select>
                        <input required name="guests" type="number" placeholder="Guests" min="1" max="6" />
                      </div>
                      <button className="button" type="submit">Request Table</button>
                    </form>
                  )}
                </section>
                
                <footer className="footer" style={{ borderTop: '1px solid var(--line)', paddingTop: '80px', paddingBottom: '60px', marginTop: '120px' }}>
                  <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '40px', maxWidth: 'var(--max)', margin: '0 auto', width: '100%' }}>
                    
                    {/* Brand Info */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <a href="#home" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} onClick={e => { e.preventDefault(); scrollToSection('home'); }}>
                        <span className="logo-icon" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>◈</span>
                        <span className="logo-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>{BRAND.name}</span>
                      </a>
                      <p style={{ color: 'var(--muted-light)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                        An ultra-premium tasting experience north of Oslo, celebrating the stark beauty, purity, and rhythm of the wild Arctic.
                      </p>
                    </div>

                    {/* Seating Hours */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', margin: 0, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--text)' }}>Hours</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px', fontSize: '0.86rem', color: 'var(--muted-light)' }}>
                        <li style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                          <Clock size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong>Wednesday — Sunday</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>Tasting Seating: 7:00 PM & 8:30 PM</div>
                          </div>
                        </li>
                        <li style={{ color: 'var(--muted)' }}>Monday & Tuesday Closed</li>
                      </ul>
                    </div>

                    {/* Contact & Concierge */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', margin: 0, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--text)' }}>Concierge</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px', fontSize: '0.86rem', color: 'var(--muted-light)' }}>
                        <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <MapPin size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>Fjordveien 104, 9008 Tromsø</span>
                        </li>
                        <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Phone size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>+47 77 60 00 00</span>
                        </li>
                        <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Mail size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>concierge@nordicbistro.no</span>
                        </li>
                      </ul>
                    </div>

                    {/* Social Media */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', margin: 0, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--text)' }}>Experience</h4>
                      <p style={{ color: 'var(--muted-light)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                        Follow our seasonal journeys and foraged chronicles.
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--muted-light)', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.02)' }} className="social-icon">
                          <Instagram size={18} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--muted-light)', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.02)' }} className="social-icon">
                          <Facebook size={18} />
                        </a>
                      </div>
                    </div>

                  </div>
                  
                  {/* Copyright strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 'var(--max)', margin: '40px auto 0', width: '100%', borderTop: '1px solid var(--line)', paddingTop: '24px', fontSize: '0.78rem', color: 'var(--muted)' }}>
                    <p style={{ margin: 0 }}>{BRAND.footerLine}</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <a href="#story" onClick={e => { e.preventDefault(); scrollToSection('story'); }} style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}>Story</a>
                      <a href="#experience" onClick={e => { e.preventDefault(); scrollToSection('experience'); }} style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}>Experience</a>
                      <a href="#menu" onClick={e => { e.preventDefault(); scrollToSection('menu'); }} style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}>Menu</a>
                    </div>
                  </div>
                </footer>
              </main>
            </Scroll>
          </ScrollControls>
        </Canvas>
      </div>

      <div className={`reserve-nudge ${nudgeVisible ? 'reserve-nudge--visible' : ''}`}>
        <div className="reserve-nudge-inner">
          <span className="scarcity-text">{BRAND.scarcityText}</span>
          <a className="button button-sm" href="#reservations" onClick={e => { e.preventDefault(); scrollToSection('reservations'); }}>Book now</a>
        </div>
      </div>
    </Layout>
  );
}