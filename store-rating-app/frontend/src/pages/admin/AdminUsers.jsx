import React, { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../components/AppLayout';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validators';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Administrator' },
  { value: 'user', label: 'Normal user' },
  { value: 'store_owner', label: 'Store owner' },
];

const ROLE_BADGE_LABEL = { admin: 'Admin', user: 'Normal user', store_owner: 'Store owner' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortDir: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, ...sort };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api
      .get('/admin/users', { params })
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(err.response?.data?.message || 'Could not load users.'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250); // light debounce while typing filters
    return () => clearTimeout(t);
  }, [fetchUsers]);

  function openDetail(row) {
    api.get(`/admin/users/${row.id}`).then(({ data }) => setDetailUser(data.user));
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (r) => <span title={r.address}>{truncate(r.address, 40)}</span> },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (r) => <span className={`badge badge-${r.role}`}>{ROLE_BADGE_LABEL[r.role]}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button className="btn btn-secondary btn-sm" onClick={() => openDetail(r)}>
          View
        </button>
      ),
    },
  ];

  return (
    <AppLayout title="Users" subtitle="Administrators, normal users, and store owners">
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
        <div className="field">
          <label>Role</label>
          <select className="input" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add user</button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          rows={users}
          sortBy={sort.sortBy}
          sortDir={sort.sortDir}
          onSort={(sortBy, sortDir) => setSort({ sortBy, sortDir })}
          emptyMessage={loading ? 'Loading users…' : 'No users match these filters.'}
        />
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetchUsers(); }} />}
      {detailUser && <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </AppLayout>
  );
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errs = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      address: validateAddress(form.address),
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
      await api.post('/admin/users', form);
      onCreated();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setServerError(data?.message || 'Could not create user.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add a new user" onClose={onClose}>
      {serverError && <div className="alert alert-error">{serverError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Full name</label>
          <input className={`input ${errors.name ? 'has-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name ? <span className="error-text">{errors.name}</span> : <span className="hint">20–60 characters.</span>}
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
        <div className="form-row">
          <div className="field">
            <label>Password</label>
            <input type="password" className={`input ${errors.password ? 'has-error' : ''}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          <div className="field">
            <label>Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Normal user</option>
              <option value="admin">Administrator</option>
              <option value="store_owner">Store owner</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
          {submitting ? <span className="spinner" /> : 'Create user'}
        </button>
      </form>
    </Modal>
  );
}

function UserDetailModal({ user, onClose }) {
  return (
    <Modal title="User details" onClose={onClose}>
      <DetailRow label="Name" value={user.name} />
      <DetailRow label="Email" value={user.email} />
      <DetailRow label="Address" value={user.address} />
      <DetailRow label="Role" value={ROLE_BADGE_LABEL[user.role]} />
      {user.role === 'store_owner' && (
        <>
          <DetailRow label="Store" value={user.storeName || 'Not linked to a store yet'} />
          <DetailRow label="Average rating" value={user.rating > 0 ? `${user.rating} / 5` : 'No ratings yet'} />
        </>
      )}
    </Modal>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="hint" style={{ marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}
