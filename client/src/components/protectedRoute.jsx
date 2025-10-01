// Imports
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { toast } from 'sonner';

function ProtectedRoute({ allowedRoles }) { // 'allowedRoles' is the key prop
  const { user, loading, error } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />; // Not logged in, go to login
  }

  // If user is logged in, check their role against allowedRoles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User logged in but doesn't have the required role
    const message = `Access Denied: User ${user.email} (Role: ${user.role}) attempted to access restricted area.`
    console.warn(message);
    toast.error(message);
    return <Navigate to="/home" replace />; // Redirect to home or an access denied page
  }

  // If logged in AND has allowed role (or no specific roles required), render content
  return <Outlet />;
}

export default ProtectedRoute;