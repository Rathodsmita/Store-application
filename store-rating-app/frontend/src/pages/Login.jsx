import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'store_owner') navigate('/owner');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c1f2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* subtle bg rings */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', border:'1px solid rgba(79,70,229,0.08)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:380, height:380, borderRadius:'50%', border:'1px solid rgba(79,70,229,0.06)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, position:'relative', zIndex:1 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:'var(--color-primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18, boxShadow:'0 2px 14px rgba(79,70,229,0.45)' }}>★</div>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, color:'#fff', letterSpacing:'-0.02em' }}>RateHouse</span>
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: 'var(--color-surface)',
        borderRadius: 20,
        padding: '36px 36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        border: '1px solid var(--color-border)',
      }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--color-ink)', margin:'0 0 4px', letterSpacing:'-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ fontSize:13.5, color:'var(--color-ink-soft)', margin:'0 0 26px' }}>
          Log in to continue to your dashboard.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop:8, padding:'11px', fontSize:14 }} disabled={submitting} type="submit">
            {submitting ? <span className="spinner" /> : 'Log in'}
          </button>
        </form>

        <div style={{ margin:'24px 0 0', paddingTop:20, borderTop:'1px solid var(--color-border)', textAlign:'center', fontSize:13, color:'var(--color-ink-soft)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color:'var(--color-primary)', fontWeight:600 }}>Sign up for free</Link>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop:24, fontSize:12, color:'rgba(255,255,255,0.2)', position:'relative', zIndex:1 }}>
        © {new Date().getFullYear()} RateHouse. All rights reserved.
      </p>
    </div>
  );
}
