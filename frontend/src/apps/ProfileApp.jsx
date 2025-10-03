// src/apps/ProfileApp.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MyProfile from '../profile/MyProfile';
import EditProfile from '../profile/EditProfile';

export default function ProfileApp() {
  return (
    <Routes>
      {/* Profile Routes */}
      <Route path="view" element={<MyProfile />} />
      <Route path="edit" element={<EditProfile />} />

      {/* Catch-all to navigate back to 'view' profile if something is wrong */}
      <Route path="*" element={<Navigate to="/profile/view" replace />} />
    </Routes>
  );
}
