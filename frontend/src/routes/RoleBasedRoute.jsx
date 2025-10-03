// src/routes/RoleBasedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/auth/authSlice';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({
  allowedRoles = [],
  allowedComponent,
  fallbackComponent,
  requireAuth = true,
  fallback = "/auth/login"
}) => {
  const userRole = useSelector(selectUserRole);

  if (requireAuth && !userRole) {
    return <Navigate to={fallback} replace />;
  }

  if (allowedRoles.includes(userRole)) {
    return allowedComponent;
  }

  return fallbackComponent ?? <Navigate to={fallback} replace />;
};

export default RoleBasedRoute;
