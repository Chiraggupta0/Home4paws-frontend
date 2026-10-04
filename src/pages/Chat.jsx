import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';

export default function Chat() {
  const { requestId } = useParams();
  const navigate      = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [needsSub, setNeedsSub] = useState(false);
  const [loading, setLoading]   = useState(true);
  const bottomRef = useRef(null);

  const myEmail = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1])).email;
    } catch { return null; }
  })();

  // Load history
  useEffect(() => {
    api.get(`/api/chat/${requestId}`)
      .then(r => setMessages(r.data))
      .catch(err => {
        if (err.response?.data?.message?.toLowerCase().includes('subscribe')) {
          setNeedsSub(true);
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  // SSE stream
  useEffect(() => {
    if (needsSub) return;
    const token = localStorage.getItem('token');
    const url   = `${import.meta.env.VITE_API_URL}/api/chat/stream/${requestId}`;
    const es    = new EventSource(`${url}?token=${token}`);

    es.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    });

    es.onerror = () => es.close();
    return () => es.close();
  }, [requestId, needsSub]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await api.post(`/api/chat/${requestId}`, { content: text });
    } catch (err) {
      if (err.response?.data?.message?.toLowerCase().includes('subscribe')) {
        setNeedsSub(true);
      } else {
        console.error(err);
      }
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="paw-loader">🐾</div>
        <p className="loading-text">Loading chat…</p>
      </div>
    );
  }

  if (needsSub) {
    return (
      <div className="page-wrapper" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
        <motion.div className="card" style={{ padding:48, textAlign:'center', maxWidth:440 }}
          initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>🔒</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:8 }}>Subscribe to chat</h2>
          <p style={{ color:'var(--text-muted)', marginBottom:20 }}>
            This seller's listing requires a ₹100 subscription before you can message them.
          </p>
          <button className="btn btn-primary" style={{ width:'100%', padding:15 }} onClick={() => navigate('/subscribe')}>
            Subscribe for ₹100 →
          </button>
          <button className="btn btn-outline" style={{ width:'100%', marginTop:10 }} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display:'flex', flexDirection:'column', height:'100vh', paddingTop:'var(--nav-height)' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#2C1810 0%,#6B3422 60%,#9B4E20 100%)', padding:'20px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => navigate(-1)} style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:'.9rem' }}>
            ← Back
          </button>
          <h2 style={{ color:'#fff', fontSize:'1.2rem', margin:0 }}>💬 Chat</h2>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 0' }}>
        <div className="container" style={{ maxWidth:680, display:'flex', flexDirection:'column', gap:10 }}>
          {messages.length === 0 && (
            <p style={{ textAlign:'center', color:'var(--text-muted)', marginTop:40 }}>No messages yet. Say hi! 👋</p>
          )}
          {messages.map((msg, i) => {
            const mine = msg.senderEmail === myEmail;
            return (
              <motion.div
                key={msg.id ?? i}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                style={{ display:'flex', flexDirection:'column', alignItems: mine ? 'flex-end' : 'flex-start' }}
              >
                <div style={{
                  maxWidth:'75%',
                  background: mine ? 'var(--primary)' : 'var(--card-bg)',
                  color: mine ? '#fff' : 'var(--dark)',
                  borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding:'10px 14px',
                  boxShadow:'0 2px 8px rgba(0,0,0,.07)',
                  fontSize:'.95rem',
                  lineHeight:1.5,
                }}>
                  {msg.content}
                </div>
                <p style={{ fontSize:'.7rem', color:'var(--text-muted)', marginTop:3, marginInline:4 }}>
                  {mine ? 'You' : msg.senderName} · {new Date(msg.sentAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </p>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ borderTop:'1px solid var(--border)', background:'var(--card-bg)', padding:'14px 0' }}>
        <div className="container" style={{ maxWidth:680, display:'flex', gap:10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            style={{
              flex:1, resize:'none', padding:'10px 14px', borderRadius:12, border:'1px solid var(--border)',
              fontFamily:'inherit', fontSize:'.95rem', outline:'none',
              background:'var(--bg)', color:'var(--dark)',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              background:'var(--primary)', color:'#fff', border:'none',
              borderRadius:12, padding:'10px 20px', cursor:'pointer',
              fontWeight:600, fontSize:'.95rem', flexShrink:0,
              opacity: (!input.trim() || sending) ? 0.5 : 1,
            }}
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
