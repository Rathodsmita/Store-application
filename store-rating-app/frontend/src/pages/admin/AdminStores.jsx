import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/AppLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import api from '../../api/axios';
import { validateEmail, validateAddress } from '../../utils/validators';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortDir: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = { ...filters, ...sort };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api
      .get('/admin/stores', { params })
      .then(({ data }) => setStores(data.stores))
      .catch((err) => setError(err.response?.data?.message || 'Could not load stores.'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(fetchStores, 250);
    return () => clearTimeout(t);
  }, [fetchStores]);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (r) => <span title={r.address}>{truncate(r.address, 40)}</span> },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating value={Math.round(r.rating)} size={15} />
          <span className="hint">{r.rating > 0 ? r.rating.toFixed(1) : 'No ratings'} ({r.totalRatings})</span>
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Stores" subtitle="All stores registered on the platform">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="field">
          <label>Name</label>
          <input className="input" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search by name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} placeholder="Search by email" />
        </div>
        <div className="field">
          <label>Address</label>
          <input className="input" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} placeholder="Search by address" />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add store</button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={stores}
          sortBy={sort.sortBy}
          sortDir={sort.sortDir}
          onSort={(sortBy, sortDir) => setSort({ sortBy, sortDir })}
          emptyMessage={loading ? 'Loading stores…' : 'No stores match these filters.'}
        />
      </div>

      {showAdd && <AddStoreModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchStores(); }} />}
    </AppLayout>
  );
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function AddStoreModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/store-owners-available').then(({ data }) => setOwners(data.owners));
  }, []);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Store name is required.';
    const emailErr = validateEmail(form.email);
    const addressErr = validateAddress(form.address);
    if (emailErr) errs.email = emailErr;
    if (addressErr) errs.address = addressErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      onCreated();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setServerError(data?.message || 'Could not create store.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add a new store" onClose={onClose}>
      {serverError && <div className="alert alert-error">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Store name</label>
          <input className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Email</label>
          <input className={`input ${errors.email ? 'has-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        <div className="field">
          <label>Address</label>
          <textarea className={`input ${errors.address ? 'has-error' : ''}`} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>
        <div className="field">
          <label>Store owner (optional)</label>
          <select className="input" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
            <option value="">No owner linked yet</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
            ))}
          </select>
          {errors.ownerId && <span className="error-text">{errors.ownerId}</span>}
          <span className="hint">Only users with the Store Owner role and no store yet appear here.</span>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
          {submitting ? <span className="spinner" /> : 'Create store'}
        </button>
      </form>
    </Modal>
  );
}
