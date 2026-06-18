import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';

import UserStores from './pages/user/UserStores';

import StoreOwnerDashboard from './pages/storeOwner/StoreOwnerDashboard';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner" replace />;
  return <UserStores />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

      <Route path="/account" element={<ProtectedRoute allowedRoles={['user', 'store_owner']}><Account /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/stores" element={<ProtectedRoute allowedRoles={['admin']}><AdminStores /></ProtectedRoute>} />

      <Route path="/owner" element={<ProtectedRoute allowedRoles={['store_owner']}><StoreOwnerDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
