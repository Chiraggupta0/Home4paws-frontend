import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import '../styles/PetDetails.css';

const STATUS_MAP = {
  AVAILABLE: { cls: 'badge-success', label: '✅ Available' },
  PENDING:   { cls: 'badge-pending', label: '⏳ Pending'   },
  ADOPTED:   { cls: 'badge-error',   label: '🏠 Adopted'  },
};

const GRADIENTS = [
  'linear-gradient(135deg,#D4845A,#F5B942)',
  'linear-gradient(135deg,#9B4E20,#E8956A)',
  'linear-gradient(135deg,#6B3E26,#D4845A)',
  'linear-gradient(135deg,#2C1810,#9B4E20)',
  'linear-gradient(135deg,#A67C52,#F5B942)',
];

export default function PetDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const role      = localStorage.getItem('role');

  const [pet, setPet]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/api/pets/${id}`)
      .then(r => setPet(r.data))
      .catch(() => setError('Could not load pet.'))
      .finally(() => setLoading(false));
  }, [id]);

  const sendRequest = async () => {
    setSending(true);
    setError('');
    try {
      // Seller (priced) listings require the buyer to be subscribed before requesting.
      // NGO (free) listings are open to everyone.
      if (pet.price != null) {
        const { data: subStatus } = await api.get('/api/payment/status');
        if (!subStatus.subscribed) {
          navigate('/subscribe');
          return;
        }
      }
      await api.post(`/api/requests/${pet.id}`);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-screen">
          <div className="paw-loader">🐾</div>
          <p className="loading-text">Loading pet details…</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">🐶</div>
          <h3>Pet not found</h3>
          <p>This pet may have been removed.</p>
          <Link to="/pets" className="btn btn-primary" style={{marginTop:16}}>Browse All Pets</Link>
        </div>
      </div>
    );
  }

  const grad = GRADIENTS[pet.id % GRADIENTS.length] || GRADIENTS[0];
  const statusInfo = STATUS_MAP[pet.status] || { cls: 'badge-pending', label: pet.status };

  return (
    <div className="page-wrapper">
      <div className="container pet-details-page">
        {/* Back */}
        <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:.4}}>
          <button className="details-back" onClick={() => navigate(-1)}>
            ← Back to pets
          </button>
        </motion.div>

        <div className="details-layout">
          {/* Image */}
          <motion.div
            className="details-img"
            style={{ background: grad }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {pet.profilePictureUrl ? (
              <img src={pet.profilePictureUrl} alt={pet.name} />
            ) : (
              <div className="details-img__placeholder">
                <span>{pet.species?.toLowerCase() === 'cat' ? '🐱' : '🐶'}</span>
              </div>
            )}
            <span className={`badge ${statusInfo.cls} details-status`}>{statusInfo.label}</span>
          </motion.div>

          {/* Info */}
          <motion.div
            className="details-info"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="details-name">{pet.name}</h1>

            <div className="details-chips">
              {pet.species && <span className="pet-card__chip">🐾 {pet.species}</span>}
              {pet.breed   && <span className="pet-card__chip">🦴 {pet.breed}</span>}
              {pet.age     && <span className="pet-card__chip">🎂 {pet.age} yr{pet.age !== 1 ? 's' : ''} old</span>}
            </div>

            {pet.description && (
              <div className="details-desc">
                <h3>About {pet.name}</h3>
                <p>{pet.description}</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            {done ? (
              <motion.div
                className="alert alert-success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              >
                🎉 Request sent! The shelter will get back to you soon.
              </motion.div>
            ) : role === 'NORMAL_USER' && pet.status === 'AVAILABLE' ? (
              <motion.button
                className="btn btn-primary btn-lg details-adopt-btn"
                onClick={sendRequest}
                disabled={sending}
                whileTap={{ scale: 0.97 }}
              >
                {sending ? '🐾 Sending request…' : pet.price != null ? `Request to Buy ${pet.name} 🐾` : `Adopt ${pet.name} 🐾`}
              </motion.button>
            ) : role === 'NORMAL_USER' && pet.status !== 'AVAILABLE' ? (
              <p className="details-unavailable">This pet is currently not available for adoption.</p>
            ) : null}

            <Link to="/pets" className="btn btn-outline" style={{marginTop: 12, justifyContent:'center'}}>
              Browse More Pets
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
