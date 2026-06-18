import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/validators';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const errs = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    Object.keys(errs).forEach((k) => !errs[k] && delete errs[k]);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setServerError(data?.message || 'Could not create your account. Please try again.');
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
        width: '100%', maxWidth: 440,
        background: 'var(--color-surface)',
        borderRadius: 20,
        padding: '36px 36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        border: '1px solid var(--color-border)',
      }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--color-ink)', margin:'0 0 4px', letterSpacing:'-0.02em' }}>
          Create your account
        </h2>
        <p style={{ fontSize:13.5, color:'var(--color-ink-soft)', margin:'0 0 26px' }}>
          It only takes a minute.
        </p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Alexandra Johnson Whitfield" />
            {errors.name ? <span className="error-text">{errors.name}</span> : <span className="hint">20–60 characters.</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" className={`input ${errors.email ? 'has-error' : ''}`} value={form.email} onChange={(e) => update('email', e.target.value)} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <textarea id="address" className={`input ${errors.address ? 'has-error' : ''}`} rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
            {errors.address ? <span className="error-text">{errors.address}</span> : <span className="hint">Max 400 characters.</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className={`input ${errors.password ? 'has-error' : ''}`} value={form.password} onChange={(e) => update('password', e.target.value)} />
            {errors.password ? <span className="error-text">{errors.password}</span> : <span className="hint">8–16 characters, 1 uppercase, 1 special character.</span>}
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop:8, padding:'11px', fontSize:14 }} disabled={submitting} type="submit">
            {submitting ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div style={{ margin:'24px 0 0', paddingTop:20, borderTop:'1px solid var(--color-border)', textAlign:'center', fontSize:13, color:'var(--color-ink-soft)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--color-primary)', fontWeight:600 }}>Log in</Link>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop:24, fontSize:12, color:'rgba(255,255,255,0.2)', position:'relative', zIndex:1 }}>
        © {new Date().getFullYear()} RateHouse. All rights reserved.
      </p>
    </div>
  );
}
