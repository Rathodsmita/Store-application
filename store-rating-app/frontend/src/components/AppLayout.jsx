import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { to: '/admin', label: 'Dashboard', exact: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
  ],
  user: [
    { to: '/', label: 'Browse Stores', exact: true },
    { to: '/account', label: 'My Account' },
  ],
  store_owner: [
    { to: '/owner', label: 'Dashboard', exact: true },
    { to: '/account', label: 'My Account' },
  ],
};

const ROLE_LABEL = { admin: 'Administrator', user: 'Member', store_owner: 'Store Owner' };

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">★</span>
          RateHouse
        </div>

        <nav className="nav-group">
          <span className="nav-label">{ROLE_LABEL[user?.role] || ''}</span>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-block" style={{ color: '#C7D2FE' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            {subtitle && <div className="topbar-sub">{subtitle}</div>}
          </div>
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-soft)' }}>{user?.email}</div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
