import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axiosConfig';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate('/login');
        return;
      }

      const token = data.session.access_token;
      try {
        // Carry the role picked on the register page through Google's redirect —
        // Supabase OAuth doesn't preserve our custom user_metadata like email signUp does.
        const pendingRole = sessionStorage.getItem('pendingRole');
        sessionStorage.removeItem('pendingRole');

        const res = await api.post('/api/auth/sync', pendingRole ? { role: pendingRole } : {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem('token', token);
        localStorage.setItem('role',  res.data.role);

        const role = res.data.role;
        if (role === 'NGO_SHELTER') navigate('/my-dogs');
        else if (role === 'SELLER')  navigate('/seller/my-pets');
        else                          navigate('/pets');
      } catch {
        navigate('/login');
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="loading-screen">
      <div className="paw-loader">🐾</div>
      <p className="loading-text">Signing you in…</p>
    </div>
  );
}
