import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const menuRef   = useRef(null);

  const [hidden,      setHidden]      = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false); // mobile drawer
  const [profileOpen, setProfileOpen] = useState(false); // profile dropdown
  const [sub,         setSub]         = useState(null);   // subscription status
  const { count } = useCart();

  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  // Get user email from token
  const userEmail = (() => {
    try {
      const t = localStorage.getItem('token');
      if (!t) return null;
      return JSON.parse(atob(t.split('.')[1])).email;
    } catch { return null; }
  })();

  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

  // Hide on scroll down
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const fn = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cur = window.scrollY;
        setHidden(cur > 80 && cur > last);
        last = cur;
        ticking = false;
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setDrawerOpen(false); setProfileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const roleLinks = role === 'NORMAL_USER'
    ? [{ to: '/pets', label: '🐾 Adopt (NGO)' }, { to: '/marketplace', label: '🏷️ Buy (Sellers)' }, { to: '/my-requests', label: 'My Requests' }]
    : role === 'NGO_SHELTER'
    ? [{ to: '/add-pet', label: 'Add Pet' }, { to: '/my-dogs', label: 'My Pets' }, { to: '/shelter-requests', label: 'Requests' }]
    : role === 'SELLER'
    ? [{ to: '/seller/add-pet', label: 'List a Pet' }, { to: '/seller/my-pets', label: 'My Listings' }, { to: '/seller/requests', label: 'Requests' }]
    : role === 'ADMIN'
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/pets', label: 'Browse Pets' }]
    : [{ to: '/pets', label: '🐾 Adopt (NGO)' }, { to: '/marketplace', label: '🏷️ Buy (Sellers)' }, { to: '/register', label: 'Join' }];

  const links = [{ to: '/shop', label: '🛍️ Shop' }, ...roleLinks];

  const roleLabel = {
    NORMAL_USER: 'Adopter',
    SELLER:      'Seller',
    NGO_SHELTER: 'Shelter / NGO',
    ADMIN:       'Admin',
  }[role] || '';

  const showSubscribe = role === 'NORMAL_USER' || role === 'SELLER';

  // Fetch subscription status when dropdown opens (only for adopter/seller)
  useEffect(() => {
    if (profileOpen && showSubscribe && token && sub === null) {
      api.get('/api/payment/status')
        .then(r => setSub(r.data))
        .catch(() => setSub({ subscribed: false }));
    }
  }, [profileOpen, showSubscribe, token, sub]);

  return (
    <>
      <motion.nav
        className="nav"
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: .35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav__inner container">
          <Link to="/" className="nav__logo">
            <div className="nav__logo-icon">🐾</div>
            <span className="nav__logo-text">Home4Paws</span>
          </Link>

          <div className="nav__links hide-mobile">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`nav__link ${location.pathname === l.to ? 'nav__link--active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="nav__auth hide-mobile">
            <Link to="/cart" style={{ position:'relative', fontSize:'1.35rem', display:'inline-flex', alignItems:'center', marginRight:6 }} aria-label="Cart">
              🛒
              {count > 0 && <span style={{ position:'absolute', top:-4, right:-8, background:'var(--primary)', color:'#fff', borderRadius:999, fontSize:'.62rem', fontWeight:700, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>{count}</span>}
            </Link>
            {token ? (
              <div className="nav__profile" ref={menuRef}>
                <button
                  className="nav__avatar"
                  onClick={() => setProfileOpen(v => !v)}
                  aria-label="Profile menu"
                >
                  {initials}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: 8, scale: .97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: .97 }}
                      transition={{ duration: .18 }}
                    >
                      {/* User info */}
                      <div className="profile-dropdown__header">
                        <p className="profile-dropdown__email">{userEmail}</p>
                        <p className="profile-dropdown__role">{roleLabel}</p>
                        {showSubscribe && sub && (
                          sub.subscribed
                            ? <span className="profile-dropdown__badge profile-dropdown__badge--active">
                                ✓ Active till {new Date(sub.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                              </span>
                            : <span className="profile-dropdown__badge profile-dropdown__badge--inactive">
                                Not subscribed
                              </span>
                        )}
                      </div>

                      {showSubscribe && (
                        <Link to="/subscribe" className="profile-dropdown__item">
                          💳 {sub?.subscribed ? 'Manage Subscription' : 'Subscribe'}
                        </Link>
                      )}

                      <Link to="/orders" className="profile-dropdown__item">📦 My Orders</Link>

                      <div className="profile-dropdown__divider" />

                      <button className="profile-dropdown__item profile-dropdown__item--danger" onClick={handleLogout}>
                        🚪 Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={location.pathname === '/login' ? 'btn btn-primary btn-sm' : 'nav__signin'}
                >Sign In</Link>
                <Link
                  to="/register"
                  className={location.pathname === '/register' ? 'btn btn-primary btn-sm' : 'nav__signin'}
                >Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button className="nav__burger hide-desktop" onClick={() => setDrawerOpen(v => !v)} aria-label="Menu">
            <span className={`burger-bar ${drawerOpen ? 'bb-top-open' : ''}`} />
            <span className={`burger-bar ${drawerOpen ? 'bb-mid-open' : ''}`} />
            <span className={`burger-bar ${drawerOpen ? 'bb-bot-open' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div key="ov" className="drawer-overlay"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}
              onClick={() => setDrawerOpen(false)} />
            <motion.aside key="dr" className="drawer"
              initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
              transition={{type:'spring',stiffness:320,damping:30}}>

              <div className="drawer__head">
                <div className="nav__logo-icon" style={{width:32,height:32,fontSize:'.9rem'}}>🐾</div>
                <span className="nav__logo-text">Home4Paws</span>
                <button className="drawer__close" onClick={() => setDrawerOpen(false)}>✕</button>
              </div>

              {/* Profile info in drawer */}
              {token && (
                <div className="drawer__profile">
                  <div className="profile-dropdown__avatar" style={{width:40,height:40,fontSize:'1rem'}}>{initials}</div>
                  <div>
                    <p className="profile-dropdown__email">{userEmail}</p>
                    <p className="profile-dropdown__role">{roleLabel}</p>
                  </div>
                </div>
              )}

              <nav className="drawer__nav">
                {links.map((l,i) => (
                  <motion.div key={l.to} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:i*.05+.05}}>
                    <Link to={l.to} className={`drawer__link ${location.pathname===l.to?'drawer__link--active':''}`}>{l.label}</Link>
                  </motion.div>
                ))}
                {token && showSubscribe && (
                  <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:.2}}>
                    <Link to="/subscribe" className="drawer__link">💳 Subscribe — ₹100/mo</Link>
                  </motion.div>
                )}
              </nav>

              <div className="drawer__foot">
                {token ? (
                  <button className="btn btn-primary" style={{width:'100%'}} onClick={handleLogout}>Log out</button>
                ) : (
                  <>
                    <Link to="/login"    className="btn btn-ghost-dark" style={{justifyContent:'center'}}>Sign In</Link>
                    <Link to="/register" className="btn btn-primary"    style={{justifyContent:'center'}}>Sign up free 🐾</Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
