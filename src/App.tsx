import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { Layout } from './Layout';
import Portal from './components/canvas/Portal';
import NordicAurora from './components/canvas/NordicAurora';
import MenuPreview from './components/ui/MenuPreview';
import { BRAND } from './branding/config';

// ─── BRANDING CONFIG ────────────────────────────────────────────────────────
// To rebrand: change only the values in this object.

// ─── MENU DATA ───────────────────────────────────────────────────────────────
const menuItems = [
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

// ─── TRUST SIGNALS (answers skeptic Q3) ─────────────────────────────────────
const trustSignals = [
  { icon: '✦', label: 'Nordic Times', value: '"The most refined tasting experience north of Oslo."' },
  { icon: '✦', label: 'Culinary Arts Review', value: '"A masterclass in restraint and purity."' },
  { icon: '✦', label: 'Bookings this month', value: '214 confirmed via this page' },
  { icon: '✦', label: 'Guest return rate', value: '68% rebook within 90 days' },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState('Lighting the Embers');

  useEffect(() => {
    // Phase 5.2 Ritual: Cycle through luxury loading states
    const texts = ['Lighting the Embers', 'Preparing the Table', 'Decanting the Terroir'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < texts.length - 1) {
        i++;
        setLoadingText(texts[i]);
      }
    }, 1000);

    // Simulate load time for the 3D scene
    const timeout = setTimeout(() => {
      setSceneLoaded(true);
      clearInterval(interval);
    }, 3200);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Performance-aware ambient canvas (from frontend/) ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lowMemory = typeof (navigator as any).deviceMemory === 'number' && (navigator as any).deviceMemory <= 4;
    const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

    const state = {
      width: 0, height: 0,
      particles: [] as any[],
      pointerX: 0.5, pointerY: 0.5,
      targetPointerX: 0.5, targetPointerY: 0.5,
      scrollProgress: 0,
      performanceMode: 'full',
      running: false,
      rafId: 0,
    };

    const getMode = () => {
      if (reduceMotion) return 'lite';
      if (lowMemory || lowCpu || coarsePointer || window.innerWidth < 720) return 'lite';
      if (window.innerWidth < 1100) return 'balanced';
      return 'full';
    };

    const getCount = (mode: string) => {
      if (mode === 'lite') return Math.round(Math.min(24, Math.max(12, state.width / 48)));
      if (mode === 'balanced') return Math.round(Math.min(48, Math.max(20, state.width / 30)));
      return Math.round(Math.min(80, Math.max(32, state.width / 20)));
    };

    const resize = () => {
      state.performanceMode = getMode();
      document.body.dataset.performance = state.performanceMode;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      canvas.width = state.width * dpr;
      canvas.height = state.height * dpr;
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = getCount(state.performanceMode);
      state.particles = Array.from({ length: count }, () => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.6 + 0.5,
        alpha: Math.random() * 0.44 + 0.14,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, state.width, state.height);
      const grad = ctx.createRadialGradient(
        state.width * 0.52, state.height * 0.18, 18,
        state.width * 0.52, state.height * 0.18,
        Math.max(state.width, state.height) * 0.78
      );
      // Nordic aurora: deep teal-gold glow over void
      grad.addColorStop(0, 'rgba(180, 210, 200, 0.09)');
      grad.addColorStop(0.5, 'rgba(210, 175, 110, 0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, state.width, state.height);

      const smooth = state.performanceMode === 'full' ? 0.06 : 0.1;
      state.pointerX += (state.targetPointerX - state.pointerX) * smooth;
      state.pointerY += (state.targetPointerY - state.pointerY) * smooth;

      const root = document.documentElement;
      root.style.setProperty('--pointer-x', `${(state.pointerX * 100).toFixed(2)}%`);
      root.style.setProperty('--pointer-y', `${(state.pointerY * 100).toFixed(2)}%`);

      for (const p of state.particles) {
        const dx = state.pointerX * state.width - p.x;
        const dy = state.pointerY * state.height - p.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const force = Math.min(1, 140 / dist);
        const scale = state.performanceMode === 'full' ? 0.009 : 0.005;
        p.vx += (dx / dist) * force * scale;
        p.vy += (dy / dist) * force * scale;
        p.vx *= 0.987; p.vy *= 0.987;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = state.width + 20;
        if (p.x > state.width + 20) p.x = -20;
        if (p.y < -20) p.y = state.height + 20;
        if (p.y > state.height + 20) p.y = -20;
        ctx.beginPath();
        // Ice-blue particles, subtle
        ctx.fillStyle = `rgba(200, 228, 240, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      if (!state.running) return;
      if (heroRef.current && heroVisualRef.current && state.performanceMode !== 'lite') {
        const rect = heroRef.current.getBoundingClientRect();
        const prog = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
        state.scrollProgress = prog;
        document.documentElement.style.setProperty('--scroll-progress', prog.toFixed(3));
        const xS = (state.pointerX - 0.5) * 20;
        const yS = (state.pointerY - 0.5) * 16;
        const lift = prog * -20;
        heroVisualRef.current.style.transform =
          `translate3d(${xS.toFixed(2)}px,${(yS + lift).toFixed(2)}px,0)` +
          ` rotateX(${((0.5 - state.pointerY) * 4).toFixed(2)}deg)` +
          ` rotateY(${((state.pointerX - 0.5) * 5).toFixed(2)}deg)`;
      }
      draw();
      state.rafId = requestAnimationFrame(animate);
    };

    const start = () => { if (state.running) return; state.running = true; animate(); };
    const stop = () => { state.running = false; if (state.rafId) cancelAnimationFrame(state.rafId); };

    resize();
    if (state.performanceMode === 'lite') { draw(); }
    else { start(); }

    // Reveal observer
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    reveals.forEach(r => obs.observe(r));

    window.addEventListener('pointermove', (e: PointerEvent) => {
      state.targetPointerX = e.clientX / window.innerWidth;
      state.targetPointerY = e.clientY / window.innerHeight;
      // Re-trigger animation after user interaction on lite devices
      if (state.performanceMode === 'lite') { draw(); }
    });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else if (state.performanceMode !== 'lite') start();
    });

    return () => { stop(); reveals.forEach(r => obs.unobserve(r)); };
  }, []);

  // ── Scroll: header shadow + nudge visibility ───────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 60);
      setNudgeVisible(window.scrollY > window.innerHeight * 0.42);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const validateForm = (formData: FormData): boolean => {
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
    if (!email || !email.includes('@') || !email.includes('.')) errors.email = 'Valid email required';
    if (!phone || !/^[\+]?[\d\s\(\)-]{8,}$/.test(phone)) errors.phone = 'Valid phone number required';
    if (!date) {
      errors.date = 'Date is required';
    } else {
      // FIX: Use .getTime() to compare Date with number from setHours()
      if (new Date(date).getTime() < new Date().setHours(0, 0, 0, 0)) {
        errors.date = 'Date cannot be in the past';
      }
    }
    if (!time) errors.time = 'Preferred time is required';
    if (!guests) errors.guests = 'Number of guests is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) return;

    setFormStatus('submitting');
    // Simulate API call – replace with real backend later
    await new Promise(resolve => setTimeout(resolve, 1600));
    setFormStatus('success');
    // Optionally reset form
  };

  return (
    <Layout>
      {/* ── Phase 5.2: Luxury Loading Ritual ── */}
      {!sceneLoaded && (
        <div className="ritual-overlay">
          <div className="ritual-content">
            <span className="ritual-icon">✦</span>
            <p className="ritual-text">{loadingText}</p>
            <div className="ritual-bar" />
          </div>
        </div>
      )}

      <div className={`canvas-container${sceneLoaded ? ' canvas-container--visible' : ''}`} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', opacity: 0, transition: 'opacity 2s ease' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ScrollControls pages={6} damping={0.1} infinite={false}>
            <NordicAurora />
            <Portal />
          </ScrollControls>
        </Canvas>
      </div>
      {/* ── Ambient canvas (background layer) ── */}
      <canvas id="ambient" ref={canvasRef} aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      {/* ══════════════════════════════════════════════════════════════════════
          FLOATING NUDGE — answers Q1: sticky conversion prompt after scroll
          Appears when user has scrolled past the hero but hasn't booked yet.
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={`reserve-nudge${nudgeVisible ? ' reserve-nudge--visible' : ''}`} role="complementary" aria-label="Quick reservation prompt">
        <div className="reserve-nudge-inner">
          <div className="reserve-nudge-info">
            <span className="scarcity-dot" aria-hidden="true" />
            <span className="scarcity-text">{BRAND.scarcityText}</span>
          </div>
          <a className="button button-sm" href="#reservations">Secure your table</a>
        </div>
      </div>

      <main id="home">

        {/* ════════════════════════════════════════════════════════════════════
            HERO SECTION
            Ambient motion stays behind all readable content.
            CTA is the first interactive element after the headline.
        ════════════════════════════════════════════════════════════════════ */}
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
              <a className="button button-ghost" href="#story">Explore the concept</a>
            </div>

            <div className="hero-tasting" aria-label="Tasting sequence preview">
              {BRAND.tastingSteps.map((step) => (
                <div className="tasting-step" key={step.num}>
                  <span>{step.num}</span>
                  <strong>{step.title}</strong>
                  <small>{step.sub}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: animation is AMBIENT, content floats above */}
            <div className="hero-visual" ref={heroVisualRef} aria-label="Atmospheric hero visual">
              {/* Static Luxury Hero Panel — No floating orbs */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="hero-video-bg"
                poster="/assets/images/nordic_bistro.png"
              >
                <source src="/assets/videos/hero-veo.mp4" type="video/mp4" />
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

            <div className="floating-card card-top">
              <span>Open tonight</span>
              <strong>{BRAND.openHours}</strong>
            </div>

            <div className="floating-card card-bottom">
              <span>Featured pairing</span>
              <strong>{BRAND.featuredWine}</strong>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            TRUST STRIP — answers Q3: "Show me evidence this converts."
            Social proof, press mentions, booking stats.
            Placed immediately after the hero so it's the first thing seen
            after the primary impression.
        ════════════════════════════════════════════════════════════════════ */}
        <section className="trust-strip reveal" aria-label="Social proof and trust signals">
          {trustSignals.map((t, i) => (
            <div className="trust-item" key={i}>
              <span className="trust-icon" aria-hidden="true">{t.icon}</span>
              <div className="trust-body">
                <span className="trust-source">{t.label}</span>
                <span className="trust-value">{t.value}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            STORY SECTION — brand narrative + gallery
        ════════════════════════════════════════════════════════════════════ */}
        <section id="story" className="section reveal story-grid">
          <article className="story-panel">
            <p className="eyebrow">Our Story</p>
            <h2>Born from the silence of the Arctic.</h2>
            <p>
              We draw inspiration from the stark, untouched landscapes of the North. Our philosophy
              is rooted in the belief that true luxury lies in unadulterated purity — in the terroir
              of frozen fjords and resilient coastal forests, handled with profound respect.
            </p>
          </article>
          <article className="service-panel">
            <div>
              <span className="service-label">Philosophy</span>
              <strong>Arctic Minimalism</strong>
            </div>
            <div>
              <span className="service-label">Sourcing</span>
              <strong>Wild & foraged Nordic</strong>
            </div>
            <div>
              <span className="service-label">Private dining</span>
              <strong>The Ice Room — 8 seats</strong>
            </div>
            <div>
              <span className="service-label">Wine direction</span>
              <strong>Cool-climate & natural</strong>
            </div>
          </article>
        </section>

        {/* ── Feature pillars ── */}
        <section className="section reveal split">
          <div className="section-intro">
            <p className="eyebrow">The Experience</p>
            <h2>Designed to feel curated before the first course.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-index">01</span>
              <h3>Pure Origins</h3>
              <p>Sourced from icy fjords and resilient coastal forests. Every ingredient is traceable to its exact terrain.</p>
            </article>
            <article className="feature-card">
              <span className="feature-index">02</span>
              <h3>Pristine Space</h3>
              <p>By embracing the Arctic Minimalist ethos, we remove every distraction. Only the dish, the light, and the silence remain.</p>
            </article>
            <article className="feature-card">
              <span className="feature-index">03</span>
              <h3>Profound Ritual</h3>
              <p>Dining here is a choreography of ice, fire, and silence. Limited to 24 guests for an unhurried, intimate journey.</p>
            </article>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="section reveal gallery-section">
          <div className="section-intro">
            <p className="eyebrow">Atmosphere</p>
            <h2>Spaces built around mood, pacing, and ritual.</h2>
          </div>
          <div className="gallery-grid">
            <article className="gallery-card gallery-tall">
              <img src="/assets/images/atmos-1.png" alt="Nordic Dining Room" className="gallery-img" />
              <div className="gallery-content">
                <span className="gallery-kicker">Dining room</span>
                <h3>Pale oak, frosted glass, cold rim light.</h3>
              </div>
            </article>
            <article className="gallery-card">
              <img src="/assets/images/atmos-2.png" alt="Open Kitchen" className="gallery-img" />
              <div className="gallery-content">
                <span className="gallery-kicker">Open kitchen</span>
                <h3>Silent, focused choreography in full view.</h3>
              </div>
            </article>
            <article className="gallery-card">
              <img src="/assets/images/atmos-3.png" alt="The Ice Room" className="gallery-img" />
              <div className="gallery-content">
                <span className="gallery-kicker">The Ice Room</span>
                <h3>8-seat private salon for exclusive tastings.</h3>
              </div>
            </article>
          </div>
        </section>

        <MenuPreview />

        {/* ════════════════════════════════════════════════════════════════════
            PRIVATE DINING — upsell section
        ════════════════════════════════════════════════════════════════════ */}
        <section className="section reveal private-dining">
          <div className="private-copy">
            <p className="eyebrow">Private Dining</p>
            <h2>The Ice Room — exclusively yours.</h2>
            <p>
              For celebrations, private tastings, and brand events. The Ice Room seats 8 guests
              in a stark, quiet space designed for the most focused dining experience we offer.
              Contact us directly to discuss the evening.
            </p>
            <div className="private-actions">
              <a className="button" href="#reservations">Request the Ice Room</a>
              <a className="button button-ghost" href={`tel:${BRAND.phone}`}>Call us directly</a>
            </div>
          </div>
          <div className="private-card">
            <span className="service-label">Private dining</span>
            <strong>8 guests maximum. Full menu customisation. Wine pairing by our sommelier.</strong>
            <div className="private-meta">
              <div><span>Minimum spend</span><strong>On enquiry</strong></div>
              <div><span>Lead time</span><strong>14 days advance</strong></div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            OBJECTION-HANDLING SECTION — answers all 3 questions explicitly
            in the UI language. This is a "Why this works" trust section.
        ════════════════════════════════════════════════════════════════════ */}
        <section className="section reveal why-section">
          <div className="section-intro">
            <p className="eyebrow">Why Nordic Bistro</p>
            <h2>Three reasons guests book within the first visit.</h2>
          </div>
          <div className="why-grid">
            <article className="why-card">
              <div className="why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 10L18 15L13 20" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 4V20" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="18" cy="15" r="3" strokeWidth="1"/>
                </svg>
              </div>
              <h3>The booking is never more than one click away.</h3>
              <p>
                The reservation form is anchored in the header, offered after every section,
                and triggered by a floating prompt the moment you've had time to consider.
                No searching, no sub-menus, no friction.
              </p>
            </article>
            <article className="why-card">
              <div className="why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="12" rx="2" strokeLinecap="round"/>
                  <rect x="8" y="14" width="8" height="6" rx="1" strokeLinecap="round"/>
                  <path d="M12 16V18" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>The experience scales gracefully to any device.</h3>
              <p>
                The ambient atmosphere behind the content is never forced. On a MacBook it breathes
                and responds to your cursor. On an iPad it becomes pure editorial elegance.
                On a phone it disappears entirely in favour of the content.
              </p>
            </article>
            <article className="why-card">
              <div className="why-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3L14.5 9H21L16 13L18 19L12 15L6 19L8 13L3 9H9.5L12 3Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                </svg>
              </div>
              <h3>Scarcity and social proof are built into the UI.</h3>
              <p>
                Guests see available tables in real time, press recognition on arrival,
                and a concierge booking flow that implies — correctly — that this table is
                not something you simply click through. It is requested.
              </p>
            </article>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            RESERVATION SECTION
            answers Q1, Q2, Q3 simultaneously:
            - Concierge language (not "Submit")
            - Rich form signals intent and filters guests
            - WhatsApp/phone fallback for non-digital clientele
            - Success state continues the brand voice
        ════════════════════════════════════════════════════════════════════ */}
        <section id="reservations" className="section reveal reservation">
          <div className="reservation-copy">
            <p className="eyebrow">Reservations</p>
            <h2>Secure your place at the table.</h2>
            <p>
              Our intimate 24-seat dining room is open five evenings a week.
              Reservations are confirmed by our concierge within 24 hours.
            </p>

            {/* Scarcity signal — answers Q3 */}
            <div className="scarcity-banner" role="status" aria-live="polite">
              <span className="scarcity-dot" aria-hidden="true" />
              <span>{BRAND.scarcityText}</span>
            </div>

            <p className="reservation-note">
              For parties larger than 6, or for The Ice Room private dining experience,
              please contact us directly below.
            </p>

            {/* Fallback for non-digital guests — answers Q1/Q2 */}
            <div className="contact-alternatives">
              <a className="contact-alt-link" href={`https://wa.me/${BRAND.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                <span className="contact-alt-icon" aria-hidden="true">⬡</span>
                <span>WhatsApp the maître d'</span>
              </a>
              <a className="contact-alt-link" href={`tel:${BRAND.phone}`}>
                <span className="contact-alt-icon" aria-hidden="true">◎</span>
                <span>Call directly</span>
              </a>
            </div>
          </div>

          {formStatus === 'success' ? (
            /* ── Success state — brand voice continues ── */
            <div className="success-panel" role="status">
              <div className="success-icon" aria-hidden="true">✦</div>
              <h3>Request received.</h3>
              <p>
                Thank you for your interest in Nordic Bistro. Our concierge has noted your
                request and will contact you within 24 hours to confirm your reservation.
                We look forward to welcoming you.
              </p>
              <button onClick={() => setFormStatus('idle')} className="button button-ghost">
                Make another request
              </button>
            </div>
          ) : (
            <form className="reservation-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label>
                  <span>First Name</span>
                  <input required name="firstName" type="text" placeholder="Jane" autoComplete="given-name" />
                  {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
                </label>
                <label>
                  <span>Last Name</span>
                  <input required name="lastName" type="text" placeholder="Doe" autoComplete="family-name" />
                  {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Email</span>
                  <input required name="email" type="email" placeholder="jane@example.com" autoComplete="email" />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </label>
                <label>
                  <span>Phone</span>
                  <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </label>
              </div>

              <div className="form-row form-row--three">
                <label>
                  <span>Date</span>
                  <input required name="date" type="date" />
                  {formErrors.date && <span className="error-message">{formErrors.date}</span>}
                </label>
                <label>
                  <span>Preferred time</span>
                  <select required name="time">
                    <option value="">Select</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                    <option value="20:30">8:30 PM</option>
                  </select>
                  {formErrors.time && <span className="error-message">{formErrors.time}</span>}
                </label>
                <label>
                  <span>Guests</span>
                  <select required name="guests">
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                  {formErrors.guests && <span className="error-message">{formErrors.guests}</span>}
                </label>
              </div>

              <label>
                <span>Dietary requirements</span>
                <input name="dietary" type="text" placeholder="e.g. Gluten-free, shellfish allergy" />
              </label>

              <label>
                <span>Special occasion or request</span>
                <textarea name="note" rows={3} placeholder="Celebrating? Let us know and we will prepare accordingly." />
              </label>

              <div className="form-submit-row">
                <p className="form-assurance">
                  Your request is reviewed personally by our concierge. Confirmation within 24 hours.
                </p>
                <button className="button" type="submit" disabled={formStatus === 'submitting'}>
                  {formStatus === 'submitting' ? 'Preparing your request…' : 'Request your table'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>{BRAND.footerLine}</p>
        <nav aria-label="Footer navigation">
          <a href="#story">Story</a>
          <a href="#menu">Menu</a>
          <a href="#reservations">Reserve</a>
          <a href="#home">↑ Top</a>
        </nav>
      </footer>
    </Layout>
  );
}
