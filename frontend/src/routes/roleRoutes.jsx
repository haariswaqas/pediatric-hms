import React from 'react';
import RestrictedRoute from './RestrictedRoute';

// Define specific route components for each role
export const AdminRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['admin']}>{children}</RestrictedRoute>
);

export const DoctorRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['doctor']}>{children}</RestrictedRoute>
);

export const NurseRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['nurse']}>{children}</RestrictedRoute>
);

export const LabTechRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['lab_tech']}>{children}</RestrictedRoute>
);

export const PharmacistRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['pharmacist']}>{children}</RestrictedRoute>
);

export const ParentRoute = ({ children }) => (
  <RestrictedRoute allowedRoles={['parent']}>{children}</RestrictedRoute>
);
