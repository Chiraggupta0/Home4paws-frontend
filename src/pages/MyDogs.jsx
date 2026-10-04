import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import PetCard from '../components/PetCard';

export default function MyDogs() {
  const [dogs, setDogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/pets/my-pets')
      .then(r => setDogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div
            style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}
          >
            <div>
              <p className="section-eyebrow" style={{color:'var(--accent)'}}>🏠 Your Shelter</p>
              <h1 style={{color:'#fff', fontSize:'clamp(2rem,4vw,2.8rem)', fontFamily:"'Playfair Display',serif", marginTop:8}}>
                My Listed Pets
              </h1>
              <p style={{color:'rgba(255,255,255,.6)', marginTop:8}}>
                {dogs.length > 0 ? `${dogs.length} pet${dogs.length !== 1 ? 's' : ''} listed` : 'Manage your adoption listings'}
              </p>
            </div>
            <Link to="/add-pet" className="btn btn-primary">
              ➕ Add New Pet
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{paddingTop:40, paddingBottom:80}}>
        {loading ? (
          <div className="loading-screen">
            <div className="paw-loader">🐾</div>
            <p className="loading-text">Loading your pets…</p>
          </div>
        ) : dogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <h3>No pets listed yet</h3>
            <p>Add your first pet to start receiving adoption requests.</p>
            <Link to="/add-pet" className="btn btn-primary" style={{marginTop:20}}>
              Add Your First Pet 🐾
            </Link>
          </div>
        ) : (
          <div className="pets-grid">
            {dogs.map((dog, i) => (
              <PetCard key={dog.id} pet={dog} index={i} showStatus />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
