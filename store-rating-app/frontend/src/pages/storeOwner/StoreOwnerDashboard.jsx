import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import RatingRing from '../../components/RatingRing';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/store-owner/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your dashboard.'));
  }, []);

  if (error) return (
    <AppLayout title="Dashboard" subtitle="Your store's performance">
      <div className="alert alert-error">{error}</div>
    </AppLayout>
  );

  if (!data) return (
    <AppLayout title="Dashboard" subtitle="Your store's performance">
      <div className="page-loading"><span className="spinner spinner-dark" /></div>
    </AppLayout>
  );

  if (!data.store) return (
    <AppLayout title="Dashboard" subtitle="Your store's performance">
      <div className="card card-pad"><p>{data.message}</p></div>
    </AppLayout>
  );

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data.raters.filter((r) => r.score === star).length,
  }));
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <AppLayout title={data.store.name} subtitle={data.store.address}>

      {/* Hero — same #1c1f2e as sidebar */}
      <div style={{
        background: '#1c1f2e',
        borderRadius: 16,
        padding: '32px 36px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', border:'1px solid rgba(79,70,229,0.1)', top:-110, right:-70, pointerEvents:'none' }} />

        {/* Ring */}
        <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
          <RatingRing value={data.averageRating} size={110} stroke={9} label="of 5" />
        </div>

        {/* Main text */}
        <div style={{ position:'relative', zIndex:1, flex:1, minWidth:160 }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--color-accent)', margin:'0 0 8px' }}>
            Store Performance
          </p>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:46, fontWeight:800, color:'#fff', lineHeight:1 }}>
            {data.averageRating > 0 ? data.averageRating.toFixed(1) : '—'}
          </div>
          <p style={{ color:'#6b7587', fontSize:14, margin:'8px 0 0' }}>
            Based on <span style={{ color:'rgba(255,255,255,0.85)', fontWeight:600 }}>{data.totalRatings}</span> {data.totalRatings === 1 ? 'rating' : 'ratings'}
          </p>
        </div>

        {/* Mini stats */}
        <div style={{ position:'relative', zIndex:1, display:'flex', gap:10, flexWrap:'wrap' }}>
          <MiniStat label="Avg Score"     value={data.averageRating > 0 ? data.averageRating.toFixed(2) : '—'} />
          <MiniStat label="Total Reviews" value={data.totalRatings} />
          <MiniStat label="5-Star"        value={dist[0].count} />
        </div>
      </div>

      {/* Breakdown + Table */}
      <div style={{ display:'grid', gridTemplateColumns:'250px 1fr', gap:16, alignItems:'start' }}>

        {/* Star breakdown */}
        <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:'20px 22px', boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--color-ink)', margin:'0 0 16px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Breakdown</p>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {dist.map(({ star, count }) => (
              <div key={star} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600, color:'var(--color-ink-soft)', width:12, textAlign:'right', flexShrink:0 }}>{star}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-accent)" style={{ flexShrink:0 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <div style={{ flex:1, height:6, borderRadius:3, background:'var(--color-surface-sunken)', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:3,
                    background:'var(--color-accent)',
                    width: `${(count / maxCount) * 100}%`,
                    opacity: count === 0 ? 0.15 : 0.85,
                    transition:'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color:'var(--color-ink)', width:18, textAlign:'right', flexShrink:0 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer table */}
        <div className="card">
          <div style={{ padding:'18px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ fontSize:13, fontFamily:'var(--font-display)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-ink)' }}>
              Customers who rated your store
            </h3>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, background:'var(--color-surface-sunken)', color:'var(--color-ink-soft)', border:'1px solid var(--color-border)', padding:'3px 10px', borderRadius:999, fontWeight:600 }}>
              {data.totalRatings} total
            </span>
          </div>
          <div className="table-wrap" style={{ padding:'12px 0' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {data.raters.length === 0 && (
                  <tr><td colSpan={4}>
                    <div className="empty-state">No ratings yet — check back once customers start rating your store.</div>
                  </td></tr>
                )}
                {data.raters.map((r) => (
                  <tr key={r.ratingId}>
                    <td style={{ fontWeight:600 }}>{r.user?.name || '—'}</td>
                    <td style={{ color:'var(--color-ink-soft)' }}>{r.user?.email || '—'}</td>
                    <td style={{ color:'var(--color-ink-soft)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.user?.address || '—'}</td>
                    <td><StarRating value={r.score} size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.05)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:10, padding:'12px 16px', textAlign:'center', minWidth:80,
    }}>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:20, fontWeight:700, color:'#fff', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'#6b7587', marginTop:5, whiteSpace:'nowrap' }}>{label}</div>
    </div>
  );
}
