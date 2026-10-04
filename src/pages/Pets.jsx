import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import PetCard from '../components/PetCard';
import '../styles/Pets.css';

const MAX_BUDGET = 1000000; // ₹10L

const CATEGORIES = [
  { key: 'all',   label: 'All' },
  { key: 'Dog',   label: '🐶 Dogs' },
  { key: 'Cat',   label: '🐱 Cats' },
  { key: 'Other', label: '🐾 Small Pets' },
];
const GENDERS = [
  { key: 'any',    label: 'Any' },
  { key: 'Male',   label: '♂ Male' },
  { key: 'Female', label: '♀ Female' },
];
const SORTS = [
  { key: 'new',       label: "What's New" },
  { key: 'priceAsc',  label: 'Price: Low to High' },
  { key: 'priceDesc', label: 'Price: High to Low' },
  { key: 'ageAsc',    label: 'Age: Low to High' },
  { key: 'ageDesc',   label: 'Age: High to Low' },
];

const fmtINR = n => '₹' + Number(n).toLocaleString('en-IN');

function Pill({ active, onClick, children }) {
  return (
    <button type="button" className={`pf-pill ${active ? 'pf-pill--active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

// mode: 'ngo' shows only free NGO/shelter adoptions, 'marketplace' shows only priced seller listings.
export default function Pets({ mode = 'ngo' }) {
  const [pets, setPets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  // Filters
  const [category, setCategory] = useState('all');
  const [gender,   setGender]   = useState('any');
  const [stateSel, setStateSel] = useState('');
  const [citySel,  setCitySel]  = useState('');
  const [budget,   setBudget]   = useState(MAX_BUDGET);
  const [breed,    setBreed]    = useState('');
  const [sort,     setSort]     = useState('new');

  useEffect(() => {
    api.get('/api/pets')
      .then(r => setPets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build dropdown / list options from the data itself
  const states = useMemo(
    () => [...new Set(pets.map(p => p.state).filter(Boolean))].sort(),
    [pets]
  );
  const cities = useMemo(
    () => [...new Set(pets.filter(p => !stateSel || p.state === stateSel).map(p => p.city).filter(Boolean))].sort(),
    [pets, stateSel]
  );
  const breeds = useMemo(() => {
    const counts = {};
    pets.forEach(p => { if (p.breed) counts[p.breed] = (counts[p.breed] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]); // [[breed, count], …] desc
  }, [pets]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = pets.filter(p => {
      if (mode === 'ngo'         && p.price != null) return false;
      if (mode === 'marketplace' && p.price == null) return false;

      const sp = p.species?.toLowerCase();
      if (category === 'Dog'   && sp !== 'dog') return false;
      if (category === 'Cat'   && sp !== 'cat') return false;
      if (category === 'Other' && (sp === 'dog' || sp === 'cat')) return false;

      if (gender !== 'any' && p.gender !== gender) return false;
      if (stateSel && p.state !== stateSel) return false;
      if (citySel  && p.city  !== citySel)  return false;
      if (breed    && p.breed !== breed)    return false;

      // Budget applies to priced pets; free adoptions always pass
      if (p.price != null && p.price > budget) return false;

      if (q && !(
        p.name?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        p.species?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      )) return false;

      return true;
    });

    const num = (a, b, sel) => (sel(a) ?? 0) - (sel(b) ?? 0);
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'priceAsc':  return num(a, b, p => p.price);
        case 'priceDesc': return num(b, a, p => p.price);
        case 'ageAsc':    return num(a, b, p => p.age);
        case 'ageDesc':   return num(b, a, p => p.age);
        default:          return (b.id ?? 0) - (a.id ?? 0); // newest first
      }
    });
  }, [pets, mode, category, gender, stateSel, citySel, breed, budget, search, sort]);

  const resetFilters = () => {
    setCategory('all'); setGender('any');
    setStateSel(''); setCitySel(''); setBudget(MAX_BUDGET); setBreed(''); setSort('new'); setSearch('');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="pets-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="pets-header__inner"
          >
            <div>
              <p className="section-eyebrow">{mode === 'marketplace' ? 'From verified sellers' : 'Waiting for you'}</p>
              <h1 className="pets-header__title">
                {mode === 'marketplace' ? <>Find Your New<br /><em>Companion</em></> : <>Find Your New<br /><em>Best Friend</em></>}
              </h1>
              <p className="pets-header__sub">
                {mode === 'marketplace'
                  ? 'Pets listed by sellers. Subscribe (₹100/mo) to send a request and chat. 🐾'
                  : 'Free adoptions from NGOs & shelters. Every pet here needs a caring home. 🐾'}
              </p>
            </div>
            <div className="pets-search">
              <span className="pets-search__icon">🔍</span>
              <input
                type="text" className="form-input pets-search__input"
                placeholder="Search by name, breed, species or city…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body: filter sidebar + results */}
      <div className="container pets-layout">
        {/* ── Filter sidebar ── */}
        <aside className="pets-filter">
          <div className="pets-filter__head">
            <h3>Filter</h3>
            <button type="button" className="pf-clear" onClick={resetFilters}>Clear all</button>
          </div>

          <div className="pf-section">
            <p className="pf-section__title">Pet Category</p>
            <div className="pf-pills">
              {CATEGORIES.map(c => (
                <Pill key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>{c.label}</Pill>
              ))}
            </div>
          </div>

          <div className="pf-section">
            <p className="pf-section__title">Gender</p>
            <div className="pf-pills">
              {GENDERS.map(g => (
                <Pill key={g.key} active={gender === g.key} onClick={() => setGender(g.key)}>{g.label}</Pill>
              ))}
            </div>
          </div>

          <div className="pf-section">
            <p className="pf-section__title">Location</p>
            <select className="pf-select" value={stateSel}
              onChange={e => { setStateSel(e.target.value); setCitySel(''); }}>
              <option value="">All states</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="pf-select" value={citySel}
              onChange={e => setCitySel(e.target.value)} style={{ marginTop: 8 }}>
              <option value="">All cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {mode === 'marketplace' && (
            <div className="pf-section">
              <p className="pf-section__title">Budget</p>
              <input
                type="range" className="pf-range"
                min="0" max={MAX_BUDGET} step="5000"
                value={budget} onChange={e => setBudget(Number(e.target.value))}
              />
              <div className="pf-range-labels"><span>₹0</span><span>₹10L</span></div>
              <p className="pf-budget-val">Your Budget: <strong>{fmtINR(budget)}</strong></p>
            </div>
          )}

          <div className="pf-section">
            <p className="pf-section__title">Sort By</p>
            <select className="pf-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.filter(s => mode === 'marketplace' || !s.key.startsWith('price')).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {breeds.length > 0 && (
            <div className="pf-section">
              <p className="pf-section__title">Most Popular Breeds</p>
              <div className="pf-breeds">
                {breeds.map(([b, c]) => (
                  <button key={b} type="button"
                    className={`pf-breed ${breed === b ? 'pf-breed--active' : ''}`}
                    onClick={() => setBreed(breed === b ? '' : b)}>
                    <span>{b}</span><span className="pf-breed__count">({c})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Results ── */}
        <div className="pets-main">
          {loading ? (
            <div className="loading-screen">
              <div className="paw-loader">🐾</div>
              <p className="loading-text">Fetching furry friends…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🐶</div>
              <h3>No pets found</h3>
              <p>{search ? `No results for "${search}"` : 'Try adjusting your filters.'}</p>
              <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={resetFilters}>Clear filters</button>
            </div>
          ) : (
            <>
              <p className="pets-count">{filtered.length} pet{filtered.length !== 1 ? 's' : ''} found</p>
              <div className="pets-grid">
                {filtered.map((pet, i) => (
                  <PetCard key={pet.id} pet={pet} index={i} showStatus />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
