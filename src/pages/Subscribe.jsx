import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';

export default function Subscribe() {
  const navigate  = useNavigate();
  const role      = localStorage.getItem('role');
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);

  useEffect(() => {
    api.get('/api/payment/status')
      .then(r => setStatus(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/api/payment/create-order');

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        order_id:    data.orderId,
        name:        'Home4Paws',
        description: '1 Month Subscription',
        theme:       { color: '#E05A1C' },
        handler: async (response) => {
          try {
            await api.post('/api/payment/verify', {
              orderId:   response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            const { data: fresh } = await api.get('/api/payment/status');
            setStatus(fresh);
          } catch (err) {
            console.error(err);
            alert('Payment verification failed. Contact support if money was deducted.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Could not start payment. Try again.');
      setPaying(false);
    }
  };

  const goBack = () => {
    if (role === 'NORMAL_USER') navigate('/pets');
    else if (role === 'SELLER') navigate('/seller/add-pet');
    else navigate('/');
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="paw-loader">🐾</div>
      <p className="loading-text">Checking subscription…</p>
    </div>
  );

  if (status?.subscribed) return (
    <div className="page-wrapper" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
      <motion.div className="card" style={{ padding:48, textAlign:'center', maxWidth:440 }}
        initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}>
        <div style={{ fontSize:'3rem', marginBottom:16 }}>✅</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', marginBottom:8 }}>You're subscribed!</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:8 }}>
          Your subscription is active until <strong>{new Date(status.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</strong>.
        </p>
        <button className="btn btn-primary" style={{ marginTop:20 }} onClick={goBack}>
          Continue →
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div style={{ background:'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding:'clamp(60px,8vw,100px) 0 clamp(40px,5vw,60px)' }}>
        <div className="container">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
            <p className="section-eyebrow" style={{color:'var(--accent)'}}>🔓 Unlock</p>
            <h1 style={{color:'#fff', fontSize:'clamp(2rem,4vw,2.8rem)', fontFamily:"'Playfair Display',serif", marginTop:8}}>
              Subscribe to Continue
            </h1>
            <p style={{color:'rgba(255,255,255,.6)', marginTop:8}}>
              {role === 'NORMAL_USER'
                ? 'Subscribe to send adoption requests and find your perfect pet.'
                : 'Subscribe to list your pets and connect with buyers.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop:48, paddingBottom:80, maxWidth:480 }}>
        <motion.div className="card" style={{ padding:'clamp(28px,5vw,48px)', textAlign:'center' }}
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.1 }}>

          <div style={{ fontSize:'3rem', marginBottom:16 }}>🐾</div>

          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:8 }}>
            Home4Paws Monthly Plan
          </h2>

          <div style={{ margin:'24px 0' }}>
            <span style={{ fontSize:'3rem', fontWeight:800, color:'var(--primary)' }}>₹100</span>
            <span style={{ color:'var(--text-muted)', fontSize:'1rem' }}>/month</span>
          </div>

          <div style={{ textAlign:'left', marginBottom:28, display:'flex', flexDirection:'column', gap:10 }}>
            {(role === 'NORMAL_USER' ? [
              '✅ Send unlimited adoption requests',
              '✅ Chat with shelters and sellers',
              '✅ Get priority responses',
              '✅ Cancel anytime',
            ] : [
              '✅ List unlimited pets for sale',
              '✅ Receive buyer inquiries',
              '✅ Chat with interested adopters',
              '✅ Cancel anytime',
            ]).map(f => (
              <p key={f} style={{ color:'var(--dark)', fontSize:'.95rem' }}>{f}</p>
            ))}
          </div>

          <motion.button
            className="btn btn-primary"
            style={{ width:'100%', padding:15, fontSize:'1.05rem' }}
            onClick={handlePay}
            disabled={paying}
            whileTap={{ scale:.97 }}
          >
            {paying ? '⏳ Processing…' : 'Pay ₹100 & Subscribe'}
          </motion.button>

          <p style={{ fontSize:'.78rem', color:'var(--text-muted)', marginTop:12 }}>
            Secure payment via Razorpay · Auto-renews monthly
          </p>
        </motion.div>
      </div>
    </div>
  );
}
