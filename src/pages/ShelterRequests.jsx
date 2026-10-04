import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';

const STATUS_MAP = {
  PENDING:  { cls: 'badge-pending', label: '⏳ Pending'  },
  APPROVED: { cls: 'badge-success', label: '✅ Approved' },
  REJECTED: { cls: 'badge-error',   label: '❌ Rejected' },
};

export default function ShelterRequests() {
  const role     = localStorage.getItem('role');
  const isSeller = role === 'SELLER';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = () => {
    setLoading(true);
    api.get('/api/requests/my-pets')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  // Sellers must be subscribed to accept/reject or chat on their (priced) listings. NGOs are free.
  const ensureSellerSubscribed = async () => {
    if (!isSeller) return true;
    const { data: subStatus } = await api.get('/api/payment/status');
    if (!subStatus.subscribed) {
      navigate('/subscribe');
      return false;
    }
    return true;
  };

  const updateStatus = async (id, status) => {
    if (!(await ensureSellerSubscribed())) return;
    setUpdating(id);
    try {
      const ep = status === 'APPROVED' ? `/api/requests/${id}/approve` : `/api/requests/${id}/reject`;
      await api.put(ep);
      // Update local state instantly — no need to refetch
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const openChat = async (requestId) => {
    if (!(await ensureSellerSubscribed())) return;
    navigate(`/chat/${requestId}`);
  };

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
            <p className="section-eyebrow" style={{color:'var(--accent)'}}>📬 Manage</p>
            <h1 style={{color:'#fff', fontSize:'clamp(2rem,4vw,2.8rem)', fontFamily:"'Playfair Display',serif", marginTop:8}}>
              {isSeller ? 'Buyer Requests' : 'Adoption Requests'}
            </h1>
            <p style={{color:'rgba(255,255,255,.6)', marginTop:8, fontSize:'1rem'}}>
              {isSeller ? 'Review buyers interested in your pets.' : 'Review and respond to adoption applications.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{paddingTop:40, paddingBottom:80}}>
        {loading ? (
          <div className="loading-screen">
            <div className="paw-loader">🐾</div>
            <p className="loading-text">Loading requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📬</div>
            <h3>No requests yet</h3>
            <p>{isSeller ? "When buyers request your pets, you'll see them here." : "When adopters apply for your pets, you'll see them here."}</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <AnimatePresence>
              {requests.map((req, i) => {
                const s = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
                return (
                  <motion.div
                    key={req.id}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ padding: '24px 28px' }}
                  >
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>

                      {/* Pet info — clickable */}
                      <div style={{ display:'flex', alignItems:'center', gap:14, cursor:'pointer', flex:1 }}
                        onClick={() => navigate(`/pets/${req.pet?.id}`)}>
                        <div style={{ width:56, height:56, borderRadius:12, overflow:'hidden', background:'var(--bg)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
                          {req.pet?.profilePictureUrl
                            ? <img src={req.pet.profilePictureUrl} alt={req.pet.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            : '🐶'}
                        </div>
                        <div>
                          <h3 style={{ fontSize:'1.05rem', marginBottom:2 }}>{req.pet?.name || 'Pet'}</h3>
                          <p style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>
                            {req.pet?.breed}{req.pet?.breed && req.pet?.species ? ' · ' : ''}{req.pet?.species}
                            {req.pet?.age ? ` · ${req.pet.age} yrs` : ''}
                          </p>
                          <p style={{ fontSize:'.75rem', color:'var(--primary)', marginTop:2 }}>View pet details →</p>
                        </div>
                      </div>

                      {/* Adopter info */}
                      <div style={{ background:'var(--bg)', borderRadius:10, padding:'10px 14px', minWidth:180 }}>
                        <p style={{ fontSize:'.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{isSeller ? 'Buyer' : 'Adopter'}</p>
                        <p style={{ fontSize:'.9rem', fontWeight:700, color:'var(--dark)' }}>{req.adopter?.name || '—'}</p>
                        {req.adopter?.phoneNumber && <p style={{ fontSize:'.8rem', color:'var(--text-muted)', marginTop:2 }}>📞 {req.adopter.phoneNumber}</p>}
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:16, flexWrap:'wrap' }}>
                      <span className={`badge ${s.cls}`}>{s.label}</span>
                      {req.status === 'PENDING' && (
                        <>
                          <motion.button
                            className="btn btn-sm"
                            style={{ background:'var(--success)', color:'#fff', border:'none' }}
                            onClick={() => updateStatus(req.id, 'APPROVED')}
                            disabled={updating === req.id}
                            whileTap={{ scale: 0.95 }}
                          >
                            {updating === req.id ? '…' : '✅ Approve'}
                          </motion.button>
                          <motion.button
                            className="btn btn-sm"
                            style={{ background:'var(--error)', color:'#fff', border:'none' }}
                            onClick={() => updateStatus(req.id, 'REJECTED')}
                            disabled={updating === req.id}
                            whileTap={{ scale: 0.95 }}
                          >
                            {updating === req.id ? '…' : '❌ Reject'}
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        className="btn btn-sm"
                        style={{ background:'var(--primary)', color:'#fff', border:'none' }}
                        onClick={() => openChat(req.id)}
                        whileTap={{ scale: 0.95 }}
                      >
                        💬 Chat
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
