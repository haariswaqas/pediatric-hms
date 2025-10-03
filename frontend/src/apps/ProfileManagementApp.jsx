// src/apps/ProfileManagementApp.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfilesList from '../profiles-management/ProfilesList';  // adjust the path if needed
import RestrictedRoute from '../routes/RestrictedRoute';

// Define roles
const roles = ['doctor', 'nurse', 'pharmacist', 'labtech', 'parent'];

// Component to display lists for each role
const MultiRoleProfileLists = () => (
  <div>
    {roles.map(role => (
      <div key={role} style={{ marginBottom: '2rem' }}>
        <ProfilesList role={role} />
      </div>
    ))}
  </div>
);

// Main Routing Component
export default function ProfileManagementApp() {
  return (
    <Routes>
      <Route 
        path="view-all"
        element={
          <RestrictedRoute allowedRoles={['admin']}>
            <MultiRoleProfileLists />
          </RestrictedRoute>
        } 
      />
    </Routes>
  );
}
