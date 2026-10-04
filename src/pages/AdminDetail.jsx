import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { DonutChart, BarChart } from '../components/Charts';
import '../styles/Admin.css';

const META = {
  users: {
    title: 'Users Breakdown',
    eyebrow: '👥 Users',
  },
  pets: {
    title: 'Pets Breakdown',
    eyebrow: '🐶 Pets',
  },
  requests: {
    title: 'Adoption Requests',
    eyebrow: '📋 Requests',
  },
  revenue: {
    title: 'Revenue & Subscriptions',
    eyebrow: '💰 Revenue',
  },
};

export default function AdminDetail() {
  const { metric } = useParams();
  const navigate   = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return (
    <div className="page-wrapper" style={{ paddingTop:'var(--nav-height)' }}>
      <div className="loading-screen"><div className="paw-loader">🐾</div><p className="loading-text">Loading insights…</p></div>
    </div>
  );

  const meta = META[metric] || META.users;

  // Build the right chart data + KPI cards per metric
  let donut = [], bars = [], kpis = [];

  if (metric === 'users') {
    donut = [
      { label: 'Adopters', value: stats.adopters, color: '#E05A1C' },
      { label: 'Sellers',  value: stats.sellers,  color: '#f5a623' },
      { label: 'NGOs',     value: stats.ngos,     color: '#1a7f3c' },
    ];
    kpis = [
      { label: 'Total Users', value: stats.totalUsers },
      { label: 'Adopters', value: stats.adopters },
      { label: 'Sellers', value: stats.sellers },
      { label: 'NGOs / Shelters', value: stats.ngos },
    ];
  } else if (metric === 'pets') {
    donut = [
      { label: 'Available', value: stats.availablePets, color: '#1a7f3c' },
      { label: 'Adopted',   value: stats.adoptedPets,   color: '#E05A1C' },
    ];
    kpis = [
      { label: 'Total Pets', value: stats.totalPets },
      { label: 'Available', value: stats.availablePets },
      { label: 'Adopted', value: stats.adoptedPets },
    ];
  } else if (metric === 'requests') {
    const rejected = Math.max(stats.totalRequests - stats.pendingRequests - stats.approvedRequests, 0);
    bars = [
      { label: 'Pending',  value: stats.pendingRequests,  color: '#f5a623' },
      { label: 'Approved', value: stats.approvedRequests, color: '#1a7f3c' },
      { label: 'Rejected', value: rejected,               color: '#d93025' },
    ];
    kpis = [
      { label: 'Total Requests', value: stats.totalRequests },
      { label: 'Pending', value: stats.pendingRequests },
      { label: 'Approved', value: stats.approvedRequests },
      { label: 'Rejected', value: rejected },
    ];
  } else if (metric === 'revenue') {
    bars = [
      { label: 'Active Subs',   value: stats.activeSubscriptions, color: '#E05A1C' },
      { label: 'Earnings (₹)',  value: stats.totalEarnings,       color: '#1a7f3c' },
    ];
    kpis = [
      { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, accent: true },
      { label: 'Active Subscriptions', value: stats.activeSubscriptions },
      { label: 'Price / Subscription', value: '₹100' },
    ];
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <button className="admin-back" onClick={() => navigate('/admin')}>← Back to dashboard</button>
          <p className="section-eyebrow" style={{ color:'var(--accent)' }}>{meta.eyebrow}</p>
          <h1 className="admin-title">{meta.title}</h1>
        </div>
      </div>

      <div className="container admin-body">
        {/* KPI cards */}
        <div className="admin-stats-grid" style={{ marginTop: 28 }}>
          {kpis.map((k, i) => (
            <motion.div key={k.label}
              className={`admin-stat ${k.accent ? 'admin-stat--accent' : ''}`}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
              <p className="admin-stat__value">{k.value}</p>
              <p className="admin-stat__label">{k.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart card */}
        <motion.div className="admin-chart-card"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <h3 className="admin-chart-title">Distribution</h3>
          {donut.length > 0 ? <DonutChart data={donut} /> : <BarChart data={bars} />}
        </motion.div>
      </div>
    </div>
  );
}
