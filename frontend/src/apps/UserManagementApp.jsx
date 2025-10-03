// src/apps/UserManagementApp.jsx
import { Routes, Route } from 'react-router-dom';
import UsersList from '../users/UsersList';
import AddUser from '../users/AddUser';
import EditUser from '../users/EditUser';
import AnalyticsDashboard from '../users/analytics/AnalyticsDashboard';
import SystemLogList from '../logging/SystemLogList';

import { AdminRoute } from '../routes/roleRoutes';

export default function UserManagementApp() {
    return (
        <Routes>
            <Route 
                path="view-all" 
                element={
                    <AdminRoute>
                        <UsersList />
                    </AdminRoute >
                } 
            />
                    <Route 
                path="user-analytics" 
                element={
                    <AdminRoute>
                        <AnalyticsDashboard />
                    </AdminRoute >
                } 
            />
            <Route 
                path="add" 
                element={
                    <AdminRoute>
                        <AddUser />
                    </AdminRoute >
                } 
            />
            <Route 
                path="edit/:id" 
                element={
                    <AdminRoute>
                        <EditUser />
                    </AdminRoute >
                } 
            />
                       <Route 
                path="system-logs" 
                element={
                    <AdminRoute>
                        <SystemLogList />
                    </AdminRoute >
                } 
            />
        </Routes>
    );
}
