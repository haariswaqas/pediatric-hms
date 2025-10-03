// src/routes/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/auth/authSlice';

const RestrictedRoute = ({ allowedRoles, children, fallback = "/auth/login" }) => {
  const userRole = useSelector(selectUserRole);

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.includes(userRole)) {
    return children;
  }

  return <Navigate to={fallback} replace />;
};

export default RestrictedRoute;