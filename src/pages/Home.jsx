import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Home.css';

gsap.registerPlugin(ScrollTrigger);

/* ── Demo pet cards shown in hero ─────────────────────────── */
const DEMO_PETS = [
  { id:1, name:'Max',   breed:'Golden Retriever', city:'Mumbai',    emoji:'🐕', type:'adopt' },
  { id:2, name:'Luna',  breed:'Labrador Mix',     city:'Delhi',     emoji:'🐶', type:'free'  },
  { id:3, name:'Bruno', breed:'German Shepherd',  city:'Bangalore', emoji:'🦮', type:'adopt' },
  { id:4, name:'Bella', breed:'Poodle Mix',       city:'Chennai',   emoji:'🐩', type:'free'  },
];

const FEATURES = [
  { icon:'🔍', title:'Smart Matching',   desc:'Filter pets by breed, age, size, and location to find your perfect companion.' },
  { icon:'📋', title:'Instant Apply',    desc:'One-click adoption requests with real-time status tracking in your dashboard.'  },
  { icon:'🏠', title:'Shelter Network',  desc:'60+ verified NGOs and shelters listing dogs, cats, and rescue animals daily.'  },
  { icon:'❤️', title:'Save Favourites', desc:'Bookmark pets you love and come back to them anytime — they wait for you.'      },
];

const STATS = [
  { end:1200, suffix:'+', label:'Pets Rescued'      },
  { end:800,  suffix:'+', label:'Happy Adoptions'   },
  { end:60,   suffix:'+', label:'Partner Shelters'  },
  { end:98,   suffix:'%', label:'Satisfaction Rate' },
];

/* ── Magnetic button ──────────────────────────────────────── */
function MagBtn({ children, className, onClick, to }) {
  const ref = useRef(null);
  const x   = useMotionValue(0);
  const y   = useMotionValue(0);
  const sx  = useSpring(x, { stiffness: 180, damping: 18 });
  const sy  = useSpring(y, { stiffness: 180, damping: 18 });

  const onMove = e => {
    const r  = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    x.set((e.clientX - cx) * 0.28);
    y.set((e.clientY - cy) * 0.28);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const Tag = to ? motion(Link) : motion.button;
  return (
    <Tag ref={ref} to={to} className={className} onClick={onClick}
      style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={{ scale: .96 }}>
      {children}
    </Tag>
  );
}

/* ── Animated counter ─────────────────────────────────────── */
function Counter({ end, suffix }) {
  const [val, setVal] = useState(0);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / dur, 1);
      setVal(Math.floor(progress * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Hero pet card ─────────────────────────────────────────── */
function HeroPetCard({ pet, delay }) {
  const [liked, setLiked] = useState(false);
  const [popped, setPopped] = useState(false);

  const onLike = e => {
    e.stopPropagation();
    setLiked(v => !v);
    setPopped(true);
    setTimeout(() => setPopped(false), 400);
  };

  return (
    <motion.div
      className="hero-pet-card"
      initial={{ opacity: 0, y: 30, scale: .9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: .6, delay, ease: [0.16,1,0.3,1] }}
      whileHover={{ y: -6, boxShadow: '0 20px 56px rgba(26,26,46,.14)' }}
    >
      <div className="hero-pet-card__top">
        <div className="hero-pet-card__emoji">{pet.emoji}</div>
        <motion.button
          className={`hero-pet-card__like ${liked ? 'liked' : ''}`}
          onClick={onLike}
          animate={popped ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: .35 }}
          aria-label="Like"
        >
          {liked ? '❤️' : '🤍'}
        </motion.button>
      </div>
      <div className="hero-pet-card__body">
        <p className="hero-pet-card__name">{pet.name}</p>
        <p className="hero-pet-card__breed">{pet.breed}</p>
        <div className="hero-pet-card__foot">
          <span className="hero-pet-card__city">📍 {pet.city}</span>
          <span className={`badge badge-${pet.type}`}>
            {pet.type === 'adopt' ? 'Adopt' : 'Free'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Scroll reveal wrapper ─────────────────────────────────── */
function Reveal({ children, delay = 0, y = 28, className = '' }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: .65, delay, ease: [0.16,1,0.3,1] }}>
      {children}
    </motion.div>
  );
}

/* ── Feature card ──────────────────────────────────────────── */
function FeatureCard({ f, i }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={i * .1}>
      <motion.div
        className="feat-card"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ type:'spring', stiffness:280, damping:20 }}
      >
        <motion.div className="feat-card__icon" animate={{ rotate: hovered ? [0,-10,10,0] : 0 }} transition={{ duration:.4 }}>
          {f.icon}
        </motion.div>
        <h3 className="feat-card__title">{f.title}</h3>
        <p className="feat-card__desc">{f.desc}</p>
        <motion.div className="feat-card__bar" animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration:.3 }} />
      </motion.div>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  /* GSAP hero text animation */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease:'power3.out' } });
      tl.from('.ht-tag',   { opacity:0, y:16, duration:.55 }, .25)
        .from('.ht-line1', { opacity:0, y:52, duration:.8  }, .42)
        .from('.ht-line2', { opacity:0, y:52, duration:.8  }, .56)
        .from('.ht-desc',  { opacity:0, y:28, duration:.65 }, .72)
        .from('.ht-ctas',  { opacity:0, y:20, duration:.55 }, .88)
        .from('.ht-trust', { opacity:0, duration:.5        }, 1.1);

      /* Parallax on scroll */
      gsap.to('.hero-left-content', {
        y: 50, ease:'none',
        scrollTrigger:{ trigger: heroRef.current, start:'top top', end:'bottom top', scrub:1 },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="h-hero" ref={heroRef}>
        {/* Subtle background pattern */}
        <div className="h-hero__bg" aria-hidden="true">
          {Array.from({length:12}).map((_,i)=>(
            <span key={i} className="h-hero__dot" style={{
              left:`${(i*83)%100}%`, top:`${(i*61)%100}%`,
              animationDelay:`${i*.4}s`, width:i%3===0?'6px':'4px', height:i%3===0?'6px':'4px'
            }}/>
          ))}
        </div>

        <div className="container h-hero__inner">
          {/* ── Left text ── */}
          <div className="h-hero__left hero-left-content">
            <motion.span className="h-hero__tag ht-tag">
              🐾 India's #1 Dog Adoption Platform
            </motion.span>

            <h1 className="h-hero__title">
              <span className="ht-line1">Find Your</span><br />
              <span className="ht-line2 h-hero__title-em"><em>Perfect</em></span><br />
              <span className="ht-line1">Companion</span>
            </h1>

            <p className="h-hero__desc ht-desc">
              Browse hundreds of loving dogs waiting for their forever home.
              Support NGOs helping street dogs and find your new best friend.
            </p>

            <div className="h-hero__ctas ht-ctas">
              <MagBtn to="/register" className="btn btn-primary btn-xl">
                Browse Pet Dogs →
              </MagBtn>
              <MagBtn to="/register" className="btn btn-ghost-dark btn-xl">
                ❤️ Help Street Dogs
              </MagBtn>
            </div>

            <div className="h-hero__trust ht-trust">
              <div className="trust-avatars">
                {['🧑','👩','👨','👧'].map((a,i)=>(
                  <span key={i} className="trust-avatar" style={{zIndex:4-i}}>{a}</span>
                ))}
              </div>
              <p className="trust-text"><strong>2,000+</strong> happy adopters this year</p>
            </div>
          </div>

          {/* ── Right cards ── */}
          <div className="h-hero__cards">
            <div className="hero-cards-grid">
              {DEMO_PETS.map((pet, i) => (
                <HeroPetCard key={pet.id} pet={pet} delay={.6 + i * .1} />
              ))}
            </div>
            {/* Floating badge */}
            <motion.div
              className="hero-float-badge"
              initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:1.2, duration:.5, ease:[0.34,1.56,0.64,1] }}
            >
              <span className="hero-float-badge__icon">🎉</span>
              <div>
                <p className="hero-float-badge__num">+12 today</p>
                <p className="hero-float-badge__sub">New pets listed</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div className="h-hero__scroll" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}>
          <div className="scroll-mouse"><div className="scroll-dot"/></div>
          <span>Scroll to explore</span>
        </motion.div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════ */}
      <section className="h-stats">
        <div className="container">
          <div className="h-stats__grid">
            {STATS.map((s,i)=>(
              <Reveal key={s.label} delay={i*.08}>
                <div className="h-stat">
                  <span className="h-stat__val"><Counter end={s.end} suffix={s.suffix}/></span>
                  <span className="h-stat__lbl">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════ */}
      <section className="section h-features" id="features">
        <div className="container">
          <Reveal className="h-sec-head">
            <p className="section-eyebrow">Why Choose Us</p>
            <h2 className="section-title">Everything you need to<br /><em>adopt with confidence</em></h2>
            <p className="section-subtitle">A complete platform for adopters and shelters — transparent, simple, and built with love.</p>
          </Reveal>
          <div className="feat-grid">
            {FEATURES.map((f,i) => <FeatureCard key={f.title} f={f} i={i}/>)}
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE SEARCH DEMO ══════════════════════════════ */}
      <section className="section h-search-demo" id="browse">
        <div className="container">
          <Reveal className="h-sec-head">
            <p className="section-eyebrow">Browse Pets</p>
            <h2 className="section-title">Meet some of the dogs<br /><em>looking for you</em></h2>
          </Reveal>
          <SearchDemoSection navigate={navigate}/>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════ */}
      <section className="section h-steps" id="how-it-works">
        <div className="container">
          <Reveal className="h-sec-head">
            <p className="section-eyebrow">The Process</p>
            <h2 className="section-title">Adopt in <em>4 simple steps</em></h2>
          </Reveal>
          <div className="steps-grid">
            {[
              { n:'01', t:'Create Account',  d:'Sign up free as an adopter or shelter — 60 seconds.' },
              { n:'02', t:'Find Your Match', d:'Browse pets, filter by breed, age, and city.'         },
              { n:'03', t:'Send a Request',  d:'Apply directly to the shelter in one click.'          },
              { n:'04', t:'Welcome Home 🎉', d:'Get approved, meet your pup, start your new chapter.' },
            ].map((s,i)=>(
              <Reveal key={s.n} delay={i*.1}>
                <div className="step-card">
                  <div className="step-card__num">{s.n}</div>
                  <h3 className="step-card__title">{s.t}</h3>
                  <p  className="step-card__desc">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════ */}
      <section className="section h-cta-wrap">
        <div className="container">
          <Reveal>
            <div className="h-cta">
              <div className="h-cta__left">
                <p className="section-eyebrow" style={{color:'rgba(255,255,255,.7)'}}>Ready?</p>
                <h2 className="h-cta__title">Give a dog the home<br /><em>they deserve</em></h2>
                <p className="h-cta__sub">Thousands of rescue dogs are waiting. Your perfect companion is one click away.</p>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:32}}>
                  <Link to="/register" className="btn btn-white btn-xl">Start Adopting →</Link>
                  <Link to="/register" className="btn btn-xl" style={{background:'rgba(255,255,255,.12)',color:'#fff',border:'2px solid rgba(255,255,255,.25)'}}>
                    Register Shelter
                  </Link>
                </div>
              </div>
              <div className="h-cta__right" aria-hidden="true">
                <div className="cta-emoji-stack">
                  {['🐕','🐶','🦮','🐩','🐕‍🦺'].map((e,i)=>(
                    <motion.span key={i} className="cta-emoji"
                      animate={{ y:[0,-8,0] }}
                      transition={{ duration:2+i*.3, repeat:Infinity, delay:i*.4, ease:'easeInOut' }}>
                      {e}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="h-footer">
        <div className="container">
          <div className="h-footer__inner">
            <div className="h-footer__brand">
              <div className="nav__logo-icon" style={{width:32,height:32,fontSize:'.9rem'}}>🐾</div>
              <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#fff',fontSize:'1.05rem'}}>Home4Paws</span>
            </div>
            <p className="h-footer__copy">© 2025 Home4Paws · Made with ❤️ for dogs everywhere</p>
            <div className="h-footer__links">
              <Link to="/register">Adopt</Link>
              <Link to="/register">Shelters</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ══ INTERACTIVE SEARCH DEMO SECTION ════════════════════════ */
const ALL_DEMO = [
  { id:1,  name:'Max',    breed:'Golden Retriever', city:'Mumbai',    emoji:'🐕', age:2, type:'adopt' },
  { id:2,  name:'Luna',   breed:'Labrador Mix',     city:'Delhi',     emoji:'🐶', age:1, type:'free'  },
  { id:3,  name:'Bruno',  breed:'German Shepherd',  city:'Bangalore', emoji:'🦮', age:3, type:'adopt' },
  { id:4,  name:'Bella',  breed:'Poodle Mix',       city:'Chennai',   emoji:'🐩', age:1, type:'free'  },
  { id:5,  name:'Rocky',  breed:'Beagle',           city:'Pune',      emoji:'🐕', age:4, type:'adopt' },
  { id:6,  name:'Daisy',  breed:'Indie Mix',        city:'Hyderabad', emoji:'🐶', age:2, type:'free'  },
];

function SearchDemoSection({ navigate }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [likes,  setLikes]  = useState({});

  const filtered = ALL_DEMO.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    const matchF = filter==='all' || p.type===filter;
    return matchQ && matchF;
  });

  const toggleLike = id => setLikes(v => ({ ...v, [id]: !v[id] }));

  return (
    <div className="search-demo">
      {/* Search + filter bar */}
      <Reveal>
        <div className="search-demo__bar">
          <div className="search-demo__input-wrap">
            <span className="search-demo__ico">🔍</span>
            <input
              className="form-input search-demo__input"
              placeholder="Search by name, breed or city…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="search-demo__filters">
            {[['all','All Pets'],['adopt','Adopt'],['free','Free']].map(([v,l])=>(
              <motion.button key={v}
                className={`filter-btn ${filter===v?'filter-btn--active':''}`}
                onClick={() => setFilter(v)}
                whileTap={{scale:.96}}>
                {l}
              </motion.button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Cards grid */}
      <AnimatePresence mode="popLayout">
        <div className="search-demo__grid">
          {filtered.map((p,i)=>(
            <motion.div key={p.id}
              className="demo-card"
              layout
              initial={{ opacity:0, scale:.9, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.85 }}
              transition={{ duration:.4, delay:i*.05 }}
              whileHover={{ y:-5, boxShadow:'0 16px 48px rgba(26,26,46,.12)' }}
            >
              <div className="demo-card__img">
                <span className="demo-card__emoji">{p.emoji}</span>
                <motion.button
                  className={`demo-card__like ${likes[p.id]?'liked':''}`}
                  onClick={()=>toggleLike(p.id)}
                  whileTap={{scale:1.4}}
                  transition={{type:'spring',stiffness:400,damping:12}}>
                  {likes[p.id]?'❤️':'🤍'}
                </motion.button>
              </div>
              <div className="demo-card__body">
                <div className="demo-card__meta">
                  <span>{p.age} yr{p.age!==1?'s':''}</span>
                  <span className={`badge badge-${p.type}`}>{p.type==='adopt'?'Adopt':'Free'}</span>
                </div>
                <h3 className="demo-card__name">{p.name}</h3>
                <p className="demo-card__breed">{p.breed}</p>
                <p className="demo-card__city">📍 {p.city}</p>
                <button className="btn btn-primary btn-sm demo-card__btn"
                  onClick={()=>navigate('/register')}>
                  Meet {p.name} →
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <motion.div className="search-demo__empty" initial={{opacity:0}} animate={{opacity:1}}>
              <span>🐾</span>
              <p>No pets match "<strong>{search}</strong>"</p>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      <Reveal>
        <div className="search-demo__cta">
          <p className="search-demo__cta-text">See all 1,200+ pets available for adoption</p>
          <Link to="/register" className="btn btn-outline">View All Pets →</Link>
        </div>
      </Reveal>
    </div>
  );
}
