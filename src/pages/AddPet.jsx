import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { supabase } from '../lib/supabaseClient';

const EMPTY = { name: '', breed: '', age: '', species: '', gender: '', state: '', city: '', description: '', price: '' };

export default function AddPet() {
  const role = localStorage.getItem('role');
  const isSeller = role === 'SELLER';
  const [pet, setPet]         = useState(EMPTY);
  const [photo, setPhoto]     = useState(null);      // File object
  const [preview, setPreview] = useState(null);      // blob URL
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const fileRef               = useRef();

  const handleChange = e => setPet({ ...pet, [e.target.name]: e.target.value });

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let profilePictureUrl = null;

      if (photo) {
        const ext  = photo.name.split('.').pop();
        const path = `pets/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('pet-images')
          .upload(path, photo, { upsert: true });
        if (uploadErr) throw new Error('Photo upload failed: ' + uploadErr.message);

        const { data: urlData } = supabase.storage.from('pet-images').getPublicUrl(path);
        profilePictureUrl = urlData?.publicUrl ?? null;
        console.log('Got public URL:', profilePictureUrl);
      }

      console.log('Submitting pet with URL:', profilePictureUrl);
      await api.post('/api/pets', { ...pet, profilePictureUrl });
      setSuccess(true);
      setPet(EMPTY);
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to add pet. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
            <p className="section-eyebrow" style={{color:'var(--accent)'}}>➕ {isSeller ? 'Seller' : 'Shelter'}</p>
            <h1 style={{color:'#fff', fontSize:'clamp(2rem,4vw,2.8rem)', fontFamily:"'Playfair Display',serif", marginTop:8}}>
              {isSeller ? 'List a Pet for Sale' : 'Add a New Pet'}
            </h1>
            <p style={{color:'rgba(255,255,255,.6)', marginTop:8}}>
              {isSeller ? 'List your pet and connect with interested buyers.' : 'List a pet for adoption and help them find a forever home.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{paddingTop:48, paddingBottom:80, maxWidth:640}}>
        <motion.div
          className="card"
          style={{ padding: 'clamp(28px,5vw,48px)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {error   && <div className="alert alert-error" style={{marginBottom:20}}>⚠️ {error}</div>}
          {success && (
            <motion.div className="alert alert-success" style={{marginBottom:20}}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              🎉 Pet added successfully! Ready for adoption.
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:4 }}>

            {/* Photo upload */}
            <div className="form-group">
              <label className="form-label">Pet Photo</label>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: preview ? 0 : '32px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'var(--bg-alt)',
                  transition: 'border-color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {preview ? (
                  <img src={preview} alt="preview"
                    style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }} />
                ) : (
                  <>
                    <div style={{fontSize:'2.5rem', marginBottom:8}}>📷</div>
                    <p style={{color:'var(--text-muted)', fontSize:'.9rem'}}>Click to upload a photo</p>
                    <p style={{color:'var(--text-light)', fontSize:'.78rem', marginTop:4}}>JPG, PNG, WEBP · max 5MB</p>
                  </>
                )}
              </div>
              {preview && (
                <button type="button" onClick={() => { setPhoto(null); setPreview(null); }}
                  style={{marginTop:6, fontSize:'.8rem', color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer'}}>
                  ✕ Remove photo
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Pet Name *</label>
              <input id="name" name="name" type="text" className="form-input" placeholder="e.g. Buddy" value={pet.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="species">Species *</label>
              <select id="species" name="species" className="form-input form-select" value={pet.species} onChange={handleChange} required>
                <option value="">Select species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label" htmlFor="breed">Breed</label>
                <input id="breed" name="breed" type="text" className="form-input" placeholder="e.g. Labrador" value={pet.breed} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="age">Age (years)</label>
                <input id="age" name="age" type="number" min="0" max="30" className="form-input" placeholder="e.g. 2" value={pet.age} onChange={handleChange} />
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select id="gender" name="gender" className="form-input form-select" value={pet.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input id="state" name="state" type="text" className="form-input" placeholder="e.g. Maharashtra" value={pet.state} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" name="city" type="text" className="form-input" placeholder="e.g. Mumbai" value={pet.city} onChange={handleChange} />
            </div>

            {isSeller && (
              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (₹) *</label>
                <input id="price" name="price" type="number" min="0" className="form-input" placeholder="e.g. 5000" value={pet.price} onChange={handleChange} required={isSeller} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description" name="description"
                className="form-input"
                style={{ minHeight: 120, resize: 'vertical' }}
                placeholder="Tell potential adopters about this pet's personality, health, and history…"
                value={pet.description} onChange={handleChange}
              />
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', marginTop:8, padding:15, fontSize:'1rem' }}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? '🐾 Adding pet…' : 'Add Pet 🐾'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
