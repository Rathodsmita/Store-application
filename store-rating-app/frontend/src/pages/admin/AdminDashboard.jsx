import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard.'));
  }, []);

  return (
    <AppLayout title="Dashboard" subtitle="Platform-wide overview">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Hero — same dark slate as sidebar */}
      <div style={{
        background: '#1c1f2e',
        borderRadius: 16,
        padding: '32px 36px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', border:'1px solid rgba(79,70,229,0.12)', top:-130, right:-80, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--color-primary)', margin:'0 0 10px' }}>
            System Administrator
          </p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.02em' }}>
            Welcome back
          </h2>
          <p style={{ color:'#6b7587', fontSize:14, margin:0 }}>
            Here's a live snapshot of your platform activity.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:20 }}>
        <StatCard label="Total Users"       value={stats?.totalUsers}   icon={<UserIcon />} />
        <StatCard label="Total Stores"      value={stats?.totalStores}  icon={<StoreIcon />} />
        <StatCard label="Ratings Submitted" value={stats?.totalRatings} icon={<StarIcon />} isAccent />
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:'22px 24px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--color-ink)', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quick Actions</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <ActionRow to="/admin/users"  label="Manage Users"  sub="Add, view & filter users" icon={<UserIcon />} />
            <ActionRow to="/admin/stores" label="Manage Stores" sub="Add stores, assign owners" icon={<StoreIcon />} />
            <ActionRow to="/account"      label="My Account"    sub="Update your password"     icon={<LockIcon />} />
          </div>
        </div>

        <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:'22px 24px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--color-ink)', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:'0.06em' }}>At a Glance</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label: 'Registered users',       value: stats?.totalUsers   ?? '—' },
              { label: 'Active store listings',  value: stats?.totalStores  ?? '—' },
              { label: 'Community ratings',      value: stats?.totalRatings ?? '—' },
              { label: 'Avg. ratings per store', value: stats ? (stats.totalStores ? (stats.totalRatings / stats.totalStores).toFixed(1) : '—') : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'var(--color-surface-sunken)', borderRadius:8 }}>
                <span style={{ fontSize:13, color:'var(--color-ink-soft)' }}>{label}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:15, color:'var(--color-ink)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, icon, isAccent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1c1f2e' : 'var(--color-surface)',
        border: `1px solid ${hovered ? '#1c1f2e' : 'var(--color-border)'}`,
        borderRadius: 14,
        padding: '22px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: hovered ? '0 8px 28px rgba(28,31,46,0.18)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 11, flexShrink: 0,
        background: hovered
          ? (isAccent ? 'rgba(245,158,11,0.15)' : 'rgba(79,70,229,0.15)')
          : (isAccent ? 'var(--color-accent-soft)' : 'var(--color-primary-soft)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s ease',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:34, fontWeight:700, color: hovered ? '#fff' : 'var(--color-ink)', lineHeight:1, transition:'color 0.2s ease' }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize:13, color: hovered ? 'rgba(255,255,255,0.55)' : 'var(--color-ink-soft)', marginTop:5, transition:'color 0.2s ease' }}>{label}</div>
      </div>
    </div>
  );
}

function ActionRow({ to, label, sub, icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={to} style={{ textDecoration:'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 12px', borderRadius:9,
          background: hovered ? 'var(--color-primary-soft)' : 'var(--color-surface-sunken)',
          transition:'background 0.15s ease',
        }}
      >
        <div style={{ width:32, height:32, borderRadius:7, background: hovered ? 'var(--color-primary)' : 'var(--color-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s ease' }}>
          {React.cloneElement(icon, { color: hovered ? '#fff' : 'var(--color-ink-faint)' })}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color: hovered ? 'var(--color-primary-dark)' : 'var(--color-ink)' }}>{label}</div>
          <div style={{ fontSize:12, color:'var(--color-ink-faint)', marginTop:1 }}>{sub}</div>
        </div>
        <svg style={{ marginLeft:'auto', opacity: hovered ? 1 : 0.25, transition:'opacity 0.15s' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hovered ? 'var(--color-primary)' : 'var(--color-ink)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </Link>
  );
}

function UserIcon({ color = 'var(--color-primary)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function StoreIcon({ color = 'var(--color-primary)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function LockIcon({ color = 'var(--color-ink-faint)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
