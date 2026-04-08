import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll } from '@react-three/drei';
import { Layout } from './Layout';
import Portal from './components/canvas/Portal';
import NordicAurora from './components/canvas/NordicAurora';
import MenuPreview from './components/ui/MenuPreview';
import { BRAND } from './branding/config';

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
    image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800',
  },
  {
    course: 'Chapter I',
    title: 'Cured Scallop',
    description: 'Kohlrabi · white currant · elderflower oil.',
    price: '—',
    image: 'https://images.unsplash.com/photo-1626804475297-41609ea0af49?auto=format&fit=crop&q=80&w=800',
  },
  {
    course: 'Chapter II',
    title: 'Arctic Char',
    description: 'Smoked bone broth · sea buckthorn · frozen dill.',
    price: '—',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
  },
  {
    course: 'Chapter III',
    title: 'King Crab',
    description: 'Glacial meltwater butter · pine shoots · white asparagus.',
    price: '—',
    image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=800',
  },
  {
    course: 'Epilogue',
    title: 'Cloudberry',
    description: 'Whipped skyr · white chocolate snow · pine.',
    price: '—',
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22cbc?auto=format&fit=crop&q=80&w=800',
  },
  {
    course: 'Mignardises',
    title: 'Ice & Stone',
    description: 'Birch syrup caramels · sea salt truffles.',
    price: '—',
    image: 'https://images.unsplash.com/photo-1514845555126-7874052304ce?auto=format&fit=crop&q=80&w=800',
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
          <a href="#story">Story</a>
          <a href="#menu">Menu</a>
          <a href="#experience">Experience</a>
          <a href="#private-dining">Private Dining</a>
          <a href="#reservations" className="nav-cta">Reserve</a>
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
            <a href="#story" onClick={() => setMobileMenuOpen(false)}>Story</a>
            <a href="#menu" onClick={() => setMobileMenuOpen(false)}>Menu</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)}>Experience</a>
            <a href="#private-dining" onClick={() => setMobileMenuOpen(false)}>Private Dining</a>
            <a href="#reservations" onClick={() => setMobileMenuOpen(false)}>Reserve</a>
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
          <ScrollControls pages={14} damping={0.1} infinite={false}>
              <ScrollWatcher onScroll={handleScrollUpdate} />
              <NordicAurora />
            <Portal />
            
            <Scroll html style={{ width: '100%' }}>
              <div className="noise" aria-hidden="true" />
              
              <main id="home">
                {/* ─── HERO SECTION ─── */}
                <section className="hero section reveal" ref={heroRef}>
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
                      <a className="button" href="#reservations">Reserve now</a>
                    </div>
                  </div>

                  <div className="hero-visual" ref={heroVisualRef}>
                    <video autoPlay muted loop playsInline className="hero-video-bg">
                      <source src="/videos/hero-veo.mp4" type="video/mp4" />
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
                      <video autoPlay muted loop playsInline className="hero-video-bg">
                        <source src="/videos/hero-veo.mp4" type="video/mp4" />
                      </video>
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
                
                <footer className="footer">
                  <div className="footer-inner">
                    <p>{BRAND.footerLine}</p>
                    <nav className="footer-nav">
                      <a href="#story">Story</a>
                      <a href="#menu">Menu</a>
                      <a href="#reservations">Reservations</a>
                    </nav>
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
          <a className="button button-sm" href="#reservations">Book now</a>
        </div>
      </div>
    </Layout>
  );
}