import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 5;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAttempts(prev => prev + 1);
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Verify email matches the admin email specified in .env
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setError('Invalid credentials'); // vague error for wrong account
        setLoading(false);
        return;
      }

      onClose();
      navigate('/');
    } catch (err) {
      setError('An error occurred during sign in');
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        zIndex: 1000,
        width: '360px',
        color: '#333' // Explicit text color for light modal background
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome back</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />

          {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '6px', 
              border: 'none', 
              background: '#000', 
              color: '#fff', 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </>
  );
}
