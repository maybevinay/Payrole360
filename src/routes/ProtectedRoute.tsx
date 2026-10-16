import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center text-xs text-[#5F6773]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <span>Authenticating enterprise session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account status check
  if (user.status === 'PENDING_APPROVAL') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.status === 'REJECTED' || user.status === 'SUSPENDED') {
    return <Navigate to="/account-rejected" replace />;
  }

  // Role validation
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to user's authorized home
      if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'HR') return <Navigate to="/hr/dashboard" replace />;
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
