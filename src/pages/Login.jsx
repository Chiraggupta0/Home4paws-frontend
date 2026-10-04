import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axiosConfig';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogle = async () => {
    // Signing in, not registering — never carry a stale role pick into sync.
    sessionStorage.removeItem('pendingRole');
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
      const { data, error: supaErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (supaErr) throw supaErr;

      const token = data.session.access_token;
      const res   = await api.post('/api/auth/sync', {}, { headers: { Authorization: `Bearer ${token}` } });

      localStorage.setItem('token', token);
      localStorage.setItem('role',  res.data.role);
      navigate(res.data.role === 'NGO_SHELTER' ? '/my-dogs' : '/pets');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel-left">
        <div className="auth-left-top">
          <div className="auth-left-tag">🐾 Trusted by 10,000+ adopters</div>
          <h2 className="auth-left-headline">
            Every dog deserves<br /><em>a loving home</em>
          </h2>
          <p className="auth-left-sub">
            Thousands of rescued animals are waiting to meet you. Sign in and make a difference today.
          </p>
          <div className="auth-left-stats">
            <div className="auth-left-stat"><strong>2.4k+</strong><span>Dogs rehomed</span></div>
            <div className="auth-left-stat"><strong>180+</strong><span>Shelters</span></div>
            <div className="auth-left-stat"><strong>98%</strong><span>Happy adopters</span></div>
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account</p>

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
                placeholder="Your password"
                value={form.password} onChange={handleChange}
                required autoComplete="current-password"
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
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
            New here? <Link to="/register">Create a free account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
