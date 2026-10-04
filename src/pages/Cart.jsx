import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, setQty, removeItem, clear, count, total } = useCart();
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setPaying(true);
    try {
      const { data } = await api.post('/api/orders/checkout', {
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
      });

      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId,
        name: 'Home4Paws Store', description: `${count} item(s)`,
        theme: { color: '#E05A1C' },
        handler: async (response) => {
          try {
            await api.post('/api/orders/verify', {
              orderId:   response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            clear();
            navigate('/orders');
          } catch (err) {
            console.error(err);
            alert('Payment verification failed. Contact support if money was deducted.');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { alert('Payment failed. Please try again.'); setPaying(false); });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not start checkout. Try again.');
      setPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse the store and add some goodies for your pet.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Go to Shop 🛍️</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding: 'clamp(50px,7vw,80px) 0 clamp(30px,4vw,48px)' }}>
        <div className="container">
          <p className="section-eyebrow" style={{ color: 'var(--accent)' }}>🛒 Cart</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontFamily: "'Playfair Display',serif", marginTop: 8 }}>Your Cart</h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 80, maxWidth: 720 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, i) => (
            <motion.div key={item.id} className="card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛍️'}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <h3 style={{ fontSize: '1rem' }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-sm btn-ghost-dark" onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                <button className="btn btn-sm btn-ghost-dark" onClick={() => setQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 800 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>✕</button>
            </motion.div>
          ))}
        </div>

        <div className="card" style={{ padding: '24px 28px', marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Total ({count} item{count !== 1 ? 's' : ''})</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <motion.button className="btn btn-primary" style={{ width: '100%', padding: 15, fontSize: '1.05rem' }}
            onClick={handleCheckout} disabled={paying} whileTap={{ scale: .97 }}>
            {paying ? '⏳ Processing…' : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}
          </motion.button>
          <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            Secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
