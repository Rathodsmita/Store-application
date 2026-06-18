import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import api from '../api/axios';
import { validatePassword } from '../utils/validators';

export default function Account() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const passwordErr = validatePassword(form.newPassword);
    if (passwordErr) return setError(passwordErr);
    if (form.newPassword !== form.confirmPassword) {
      return setError('New password and confirmation do not match.');
    }

    setSubmitting(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout title="My Account" subtitle="Update your password">
      <div className="card card-pad" style={{ maxWidth: 460 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              className="input"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              className="input"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
            <span className="hint">8–16 characters, 1 uppercase letter, 1 special character.</span>
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input
              type="password"
              className="input"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={submitting} type="submit">
            {submitting ? <span className="spinner" /> : 'Update password'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
