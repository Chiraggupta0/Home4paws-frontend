import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import '../styles/Shop.css';

const CATEGORIES = [
  { k: 'all', l: 'All' },
  { k: 'Dog', l: '🐶 Dogs' },
  { k: 'Cat', l: '🐱 Cats' },
];
const TYPES = ['All', 'Food', 'Toy', 'Accessory', 'Grooming', 'Health'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('all');
  const [type, setType]         = useState('All');
  const [search, setSearch]     = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    api.get('/api/products')
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = useMemo(() => products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (type !== 'All' && p.type !== type) return false;
    const q = search.toLowerCase();
    if (q && !(p.name?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q))) return false;
    return true;
  }), [products, category, type, search]);

  return (
    <div className="page-wrapper">
      <div className="shop-header">
        <div className="container">
          <motion.div className="shop-header__inner"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div>
              <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>🛍️ Pet Store</p>
              <h1 className="shop-header__title">Everything for your<br /><em>furry friend</em></h1>
              <p className="shop-header__sub">Food, toys, grooming & more — for dogs and cats. 🛒</p>
            </div>
            <div className="shop-search">
              <span className="shop-search__icon">🔍</span>
              <input className="form-input shop-search__input" placeholder="Search products…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </motion.div>
          {role === 'ADMIN' && (
            <Link to="/admin/add-product" className="btn btn-primary" style={{ marginTop: 18 }}>➕ Add Product</Link>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
        <div className="shop-tabs">
          {CATEGORIES.map(c => (
            <button key={c.k} className={`shop-tab ${category === c.k ? 'shop-tab--active' : ''}`}
              onClick={() => setCategory(c.k)}>{c.l}</button>
          ))}
        </div>
        <div className="shop-types">
          {TYPES.map(t => (
            <button key={t} className={`shop-type ${type === t ? 'shop-type--active' : ''}`}
              onClick={() => setType(t)}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="paw-loader">🐾</div><p className="loading-text">Loading products…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>No products found</h3>
            <p>{search ? `No results for "${search}"` : 'No products in this category yet.'}</p>
          </div>
        ) : (
          <>
            <p className="shop-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="shop-grid">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} isAdmin={role === 'ADMIN'} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
