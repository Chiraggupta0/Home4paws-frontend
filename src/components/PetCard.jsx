import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  AVAILABLE: 'badge-success',
  PENDING:   'badge-pending',
  ADOPTED:   'badge-error',
};

const STATUS_LABELS = {
  AVAILABLE: '✅ Available',
  PENDING:   '⏳ Pending',
  ADOPTED:   '🏠 Adopted',
};

// Deterministic warm gradient per pet id
const GRADIENTS = [
  'linear-gradient(135deg,#D4845A,#F5B942)',
  'linear-gradient(135deg,#9B4E20,#E8956A)',
  'linear-gradient(135deg,#6B3E26,#D4845A)',
  'linear-gradient(135deg,#2C1810,#9B4E20)',
  'linear-gradient(135deg,#A67C52,#F5B942)',
  'linear-gradient(135deg,#C96F3A,#FCDEA0)',
];

export default function PetCard({ pet, index = 0, showStatus = false }) {
  const navigate = useNavigate();
  const grad     = GRADIENTS[pet.id % GRADIENTS.length] || GRADIENTS[0];
  const token    = localStorage.getItem('token');

  const handleClick = () => {
    if (!token) navigate('/login');
    else navigate(`/pets/${pet.id}`);
  };

  return (
    <motion.div
      className="pet-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image area */}
      <div className="pet-card__img" style={{ background: grad }}>
        {pet.profilePictureUrl ? (
          <img src={pet.profilePictureUrl} alt={pet.name} loading="lazy" />
        ) : (
          <div className="pet-card__placeholder">
            <span className="pet-card__species-icon">
              {pet.species?.toLowerCase() === 'cat' ? '🐱' : '🐶'}
            </span>
          </div>
        )}
        {showStatus && pet.status && (
          <span className={`badge ${STATUS_COLORS[pet.status] || 'badge-pending'} pet-card__status`}>
            {STATUS_LABELS[pet.status] || pet.status}
          </span>
        )}
        {pet.price != null && (
          <span style={{ position:'absolute', top:10, left:10, background:'#111', color:'#fff', borderRadius:8, padding:'3px 10px', fontSize:'.78rem', fontWeight:700 }}>
            ₹{pet.price.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="pet-card__body">
        <div className="pet-card__meta">
          {pet.species && <span className="pet-card__chip">{pet.species}</span>}
          {pet.age     && <span className="pet-card__chip">{pet.age} yr{pet.age !== 1 ? 's' : ''}</span>}
        </div>
        <h3 className="pet-card__name">{pet.name}</h3>
        {pet.breed && <p className="pet-card__breed">{pet.breed}</p>}
        <button
          className="btn btn-primary btn-sm pet-card__btn"
          onClick={e => { e.stopPropagation(); handleClick(); }}
        >
          Meet {pet.name} →
        </button>
      </div>
    </motion.div>
  );
}
