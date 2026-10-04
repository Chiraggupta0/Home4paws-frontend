import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import '../styles/Admin.css';

const TABS = ['Overview', 'Users', 'Pets', 'Payments'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('Overview');
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [pets, setPets]       = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/stats').then(r => setStats(r.data)),
      api.get('/api/admin/users').then(r => setUsers(r.data)),
      api.get('/api/admin/pets').then(r => setPets(r.data)),
      api.get('/api/admin/payments').then(r => setPayments(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await api.delete(`/api/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const deletePet = async (id) => {
    if (!confirm('Delete this pet permanently?')) return;
    await api.delete(`/api/admin/pets/${id}`);
    setPets(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="page-wrapper" style={{ paddingTop: 'var(--nav-height)' }}>
      <div className="loading-screen">
        <div className="paw-loader">🐾</div>
        <p className="loading-text">Loading admin data…</p>
      </div>
    </div>
  );

  const STAT_CARDS = stats ? [
    { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, accent: true, to: 'revenue' },
    { label: 'Total Users',    value: stats.totalUsers,        to: 'users' },
    { label: 'Active Subs',    value: stats.activeSubscriptions, to: 'revenue' },
    { label: 'Total Pets',     value: stats.totalPets,         to: 'pets' },
    { label: 'Adopters',       value: stats.adopters,          to: 'users' },
    { label: 'Sellers',        value: stats.sellers,           to: 'users' },
    { label: 'NGOs / Shelters',value: stats.ngos,              to: 'users' },
    { label: 'Available Pets', value: stats.availablePets,     to: 'pets' },
    { label: 'Adopted Pets',   value: stats.adoptedPets,       to: 'pets' },
    { label: 'Total Requests', value: stats.totalRequests,     to: 'requests' },
    { label: 'Pending',        value: stats.pendingRequests,   to: 'requests' },
    { label: 'Approved',       value: stats.approvedRequests,  to: 'requests' },
  ] : [];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>🛠️ Admin</p>
          <h1 className="admin-title">Control Center</h1>
          <p className="admin-sub">Manage everything across Home4Paws.</p>
        </div>
      </div>

      <div className="container admin-body">
        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab === t ? 'admin-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'Overview' && (
          <div className="admin-stats-grid">
            {STAT_CARDS.map((c, i) => (
              <motion.div
                key={c.label}
                className={`admin-stat admin-stat--clickable ${c.accent ? 'admin-stat--accent' : ''}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/admin/detail/${c.to}`)}
              >
                <p className="admin-stat__value">{c.value}</p>
                <p className="admin-stat__label">{c.label}</p>
                <span className="admin-stat__arrow">→</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'Users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="admin-role-tag">{u.role}</span></td>
                    <td>{u.phoneNumber || '—'}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td><button className="admin-del" onClick={() => deleteUser(u.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pets */}
        {tab === 'Pets' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Species</th><th>Breed</th><th>Status</th><th>Price</th><th></th></tr>
              </thead>
              <tbody>
                {pets.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.species}</td>
                    <td>{p.breed || '—'}</td>
                    <td><span className="admin-role-tag">{p.status}</span></td>
                    <td>{p.price != null ? `₹${p.price}` : 'Free'}</td>
                    <td><button className="admin-del" onClick={() => deletePet(p.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments */}
        {tab === 'Payments' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Amount</th><th>Payment ID</th><th>Start</th><th>Expires</th></tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No payments yet</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.user}</td>
                    <td>₹{p.amount}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'.8rem' }}>{p.paymentId || '—'}</td>
                    <td>{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
