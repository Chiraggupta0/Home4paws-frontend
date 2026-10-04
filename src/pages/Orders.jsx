import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';

const STATUS = {
  PAID:    { cls: 'badge-success', label: '✅ Paid' },
  PENDING: { cls: 'badge-pending', label: '⏳ Pending' },
  FAILED:  { cls: 'badge-error',   label: '❌ Failed' },
};

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/my')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(50px,7vw,80px) 0 clamp(30px,4vw,48px)' }}>
        <div className="container">
          <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>📦 Orders</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontFamily: "'Playfair Display',serif", marginTop: 8 }}>My Orders</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 720 }}>
        {loading ? (
          <div className="loading-screen"><div className="paw-loader">🐾</div><p className="loading-text">Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your purchases will show up here.</p>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Go to Shop 🛍️</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((o, i) => {
              const s = STATUS[o.status] || { cls: 'badge-pending', label: o.status };
              return (
                <motion.div key={o.id} className="card" style={{ padding: '20px 24px' }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>Order #{o.id}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginLeft: 10 }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(o.items || []).map((it, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {it.imageUrl ? <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛍️'}
                        </div>
                        <span style={{ flex: 1, fontSize: '.9rem' }}>{it.name} × {it.quantity}</span>
                        <span style={{ fontSize: '.9rem', fontWeight: 600 }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{o.total?.toLocaleString('en-IN')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
