import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';

const STATUS_MAP = {
  PENDING:  { cls: 'badge-pending', label: '⏳ Pending',  icon: '⏳' },
  APPROVED: { cls: 'badge-success', label: '✅ Approved', icon: '🎉' },
  REJECTED: { cls: 'badge-error',   label: '❌ Rejected', icon: '💔' },
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/requests/my')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
            <p className="section-eyebrow" style={{color:'var(--accent)'}}>📋 Your Activity</p>
            <h1 style={{color:'#fff', fontSize:'clamp(2rem,4vw,2.8rem)', fontFamily:"'Playfair Display',serif", marginTop:8}}>
              My Adoption Requests
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{paddingTop:40, paddingBottom:80}}>
        {loading ? (
          <div className="loading-screen">
            <div className="paw-loader">🐾</div>
            <p className="loading-text">Loading your requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No requests yet</h3>
            <p>You haven't applied for any adoptions yet. Find your new best friend!</p>
            <Link to="/pets" className="btn btn-primary" style={{marginTop:20}}>Browse Pets 🐶</Link>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:16, maxWidth:640}}>
            {requests.map((req, i) => {
              const s = STATUS_MAP[req.status] || { cls:'badge-pending', label: req.status, icon:'•' };
              return (
                <motion.div
                  key={req.id}
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  style={{ padding: '24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(26,26,46,.10)' }}
                >
                  <div style={{display:'flex', alignItems:'center', gap:16, flex:1, cursor:'pointer'}}
                    onClick={() => navigate(`/pets/${req.pet?.id}`)}>
                    <div style={{width:56, height:56, borderRadius:12, overflow:'hidden', background:'var(--bg)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem'}}>
                      {req.pet?.profilePictureUrl
                        ? <img src={req.pet.profilePictureUrl} alt={req.pet.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        : '🐶'}
                    </div>
                    <div>
                      <h3 style={{fontSize:'1.1rem', marginBottom:2}}>{req.pet?.name || 'Pet'}</h3>
                      <p style={{fontSize:'.85rem', color:'var(--text-muted)'}}>
                        {req.pet?.breed || ''}{req.pet?.breed && req.pet?.species ? ' · ' : ''}{req.pet?.species || ''}
                      </p>
                      <p style={{fontSize:'.78rem', color:'var(--text-light)', marginTop:2}}>Tap to view full details →</p>
                    </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/chat/${req.id}`); }}
                      style={{ background:'var(--primary)', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontWeight:600, fontSize:'.85rem' }}
                    >
                      💬 Chat
                    </button>
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
