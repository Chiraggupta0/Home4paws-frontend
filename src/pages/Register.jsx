import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axiosConfig';
import '../styles/Auth.css';

const ROLES = [
  { value: 'NORMAL_USER', label: '🐶 Adopter',       desc: 'I want to adopt a pet' },
  { value: 'SELLER',      label: '🏷️ Seller',        desc: 'I want to sell my pet' },
  { value: 'NGO_SHELTER', label: '🏠 Shelter / NGO', desc: 'I rescue and list animals' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'NORMAL_USER' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogle = async () => {
    // Google OAuth doesn't carry our custom user_metadata, so stash the chosen
    // role and let AuthCallback pass it to /api/auth/sync on first login.
    sessionStorage.setItem('pendingRole', form.role);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: supaErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name, role: form.role } },
      });
      if (supaErr) throw supaErr;

      const token = data.session?.access_token;
      if (!token) { setSuccess(true); return; }

      const res = await api.post('/api/auth/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('token', token);
      localStorage.setItem('role',  res.data.role);
      navigate('/pets');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <motion.div
          className="auth-card--success"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-success-icon">🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem' }}>Check your email!</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{form.email}</strong>.<br />
            Verify your email to activate your account.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 8 }}>Go to Sign In →</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-left-top">
          <div className="auth-left-tag">🐶 India's #1 dog adoption platform</div>
          <h2 className="auth-left-headline">
            Join thousands of<br /><em>dog lovers</em>
          </h2>
          <p className="auth-left-sub">
            Whether you're looking to adopt or you run a shelter — Home4Paws makes the connection simple and joyful.
          </p>
          <div className="auth-left-stats">
            <div className="auth-left-stat"><strong>2.4k+</strong><span>Dogs rehomed</span></div>
            <div className="auth-left-stat"><strong>180+</strong><span>Shelters</span></div>
            <div className="auth-left-stat"><strong>Free</strong><span>Forever</span></div>
          </div>
        </div>
        <div className="auth-left-paws">🐾 🐾 🐾 🐾 🐾</div>
      </div>

      {/* Right panel */}
      <div className="auth-panel-right">
        <motion.div
          className="auth-form-box"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Free forever — no credit card needed</p>

          {error && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                className="form-input"
                placeholder="Your name"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                required autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={form.password} onChange={handleChange}
                required minLength={8} autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div className="role-picker">
                {ROLES.map(r => (
                  <motion.label
                    key={r.value}
                    className={`role-option ${form.role === r.value ? 'role-option--active' : ''}`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <input
                      type="radio" name="role" value={r.value}
                      checked={form.role === r.value}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <span className="role-option__label">{r.label}</span>
                    <span className="role-option__desc">{r.desc}</span>
                  </motion.label>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Creating account…' : 'Create Account →'}
            </motion.button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <motion.button
            type="button"
            className="btn-google"
            onClick={handleGoogle}
            whileTap={{ scale: 0.97 }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </motion.button>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
