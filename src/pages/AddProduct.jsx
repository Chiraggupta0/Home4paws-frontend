import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { supabase } from '../lib/supabaseClient';

const EMPTY = { name: '', category: 'Dog', type: 'Food', price: '', stock: '', description: '' };
const TYPES = ['Food', 'Toy', 'Accessory', 'Grooming', 'Health'];

export default function AddProduct() {
  const [product, setProduct] = useState(EMPTY);
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const fileRef               = useRef();

  const handleChange = e => setProduct({ ...product, [e.target.name]: e.target.value });
  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f); setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    try {
      let imageUrl = null;
      if (photo) {
        const ext  = photo.name.split('.').pop();
        const path = `products/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('pet-images').upload(path, photo, { upsert: true });
        if (upErr) throw new Error('Image upload failed: ' + upErr.message);
        const { data } = supabase.storage.from('pet-images').getPublicUrl(path);
        imageUrl = data?.publicUrl ?? null;
      }
      await api.post('/api/products', { ...product, imageUrl });
      setSuccess(true); setProduct(EMPTY); setPhoto(null); setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
            <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>🛍️ Admin</p>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,4vw,2.8rem)', fontFamily: "'Playfair Display',serif", marginTop: 8 }}>Add a Product</h1>
            <p style={{ color: 'rgba(255,255,255,.6)', marginTop: 8 }}>List a product in the pet store.</p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 640 }}>
        <motion.div className="card" style={{ padding: 'clamp(28px,5vw,48px)' }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }}>

          {error   && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>🎉 Product added to the store!</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="form-group">
              <label className="form-label">Product Photo</label>
              <div onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: preview ? 0 : '32px 16px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', background: 'var(--bg-alt)' }}>
                {preview
                  ? <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
                  : (<><div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📷</div><p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Click to upload a photo</p></>)}
              </div>
              {preview && <button type="button" onClick={() => { setPhoto(null); setPreview(null); }} style={{ marginTop: 6, fontSize: '.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove photo</button>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Product Name *</label>
              <input id="name" name="name" className="form-input" placeholder="e.g. Chicken & Rice Dog Food" value={product.name} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">For *</label>
                <select id="category" name="category" className="form-input form-select" value={product.category} onChange={handleChange} required>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="type">Type *</label>
                <select id="type" name="type" className="form-input form-select" value={product.type} onChange={handleChange} required>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (₹) *</label>
                <input id="price" name="price" type="number" min="0" className="form-input" placeholder="e.g. 499" value={product.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="stock">Stock</label>
                <input id="stock" name="stock" type="number" min="0" className="form-input" placeholder="e.g. 50" value={product.stock} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea id="description" name="description" className="form-input" style={{ minHeight: 100, resize: 'vertical' }}
                placeholder="Describe the product…" value={product.description} onChange={handleChange} />
            </div>

            <motion.button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8, padding: 15, fontSize: '1rem' }}
              disabled={loading} whileTap={{ scale: .97 }}>
              {loading ? '🛍️ Adding…' : 'Add Product 🛍️'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
