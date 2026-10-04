import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const GRADIENTS = [
  'linear-gradient(135deg,#D4845A,#F5B942)',
  'linear-gradient(135deg,#9B4E20,#E8956A)',
  'linear-gradient(135deg,#6B3E26,#D4845A)',
  'linear-gradient(135deg,#A67C52,#F5B942)',
  'linear-gradient(135deg,#C96F3A,#FCDEA0)',
];

export default function ProductCard({ product, index = 0, isAdmin = false, onDelete }) {
  const grad = GRADIENTS[product.id % GRADIENTS.length] || GRADIENTS[0];
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="product-card__img" style={{ background: grad }}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} loading="lazy" />
          : <span className="product-card__ph">{product.category?.toLowerCase() === 'cat' ? '🐱' : '🐶'}</span>}
        {product.type && <span className="product-card__type">{product.type}</span>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && <p className="product-card__desc">{product.description}</p>}
        <div className="product-card__foot">
          <span className="product-card__price">₹{product.price?.toLocaleString('en-IN')}</span>
          {isAdmin ? (
            <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff' }}
              onClick={() => onDelete(product.id)}>Delete</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>
              {added ? '✓ Added' : '🛒 Add'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
