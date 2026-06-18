import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/AppLayout';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortDir: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = { ...filters, ...sort };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api
      .get('/stores', { params })
      .then(({ data }) => setStores(data.stores))
      .catch((err) => setError(err.response?.data?.message || 'Could not load stores.'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 250);
    return () => clearTimeout(t);
  }, [fetchStores]);

  async function handleRate(store, score) {
    setSavingId(store.id);
    try {
      await api.post(`/stores/${store.id}/rating`, { rating: score });
      setStores((prev) =>
        prev.map((s) =>
          s.id === store.id
            ? recompute(s, score)
            : s
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your rating.');
    } finally {
      setSavingId(null);
    }
  }

  function recompute(store, newScore) {
    const hadPrevious = store.userRating != null;
    const priorTotal = store.overallRating * store.totalRatings;
    const totalRatings = hadPrevious ? store.totalRatings : store.totalRatings + 1;
    const adjustedTotal = hadPrevious ? priorTotal - store.userRating + newScore : priorTotal + newScore;
    const overallRating = totalRatings ? Math.round((adjustedTotal / totalRatings) * 10) / 10 : 0;
    return { ...store, userRating: newScore, totalRatings, overallRating };
  }

  return (
    <AppLayout title="Browse Stores" subtitle="Search registered stores and share your rating">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="field">
          <label>Store name</label>
          <input className="input" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search by name" />
        </div>
        <div className="field">
          <label>Address</label>
          <input className="input" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} placeholder="Search by address" />
        </div>
        <div className="field" style={{ maxWidth: 180 }}>
          <label>Sort by</label>
          <select className="input" value={sort.sortBy} onChange={(e) => setSort({ ...sort, sortBy: e.target.value })}>
            <option value="name">Name</option>
            <option value="rating">Overall rating</option>
          </select>
        </div>
      </div>

      {loading && stores.length === 0 ? (
        <div className="card card-pad"><span className="hint">Loading stores…</span></div>
      ) : stores.length === 0 ? (
        <div className="card"><div className="empty-state">No stores match your search.</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {stores.map((store) => (
            <div className="card card-pad" key={store.id}>
              <h3 style={{ fontSize: 17, marginBottom: 4 }}>{store.name}</h3>
              <p className="hint" style={{ marginBottom: 14 }}>{store.address}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <StarRating value={Math.round(store.overallRating)} size={16} />
                <span className="hint">
                  {store.overallRating > 0 ? `${store.overallRating} overall` : 'No ratings yet'} ({store.totalRatings})
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                <div className="hint" style={{ marginBottom: 6 }}>
                  {store.userRating ? 'Your rating — tap to change' : 'Tap a star to rate this store'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StarRating value={store.userRating} onChange={(v) => handleRate(store, v)} size={22} />
                  {savingId === store.id && <span className="spinner spinner-dark" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
