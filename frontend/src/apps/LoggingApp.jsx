// src/apps/UserManagementApp.jsx
import { Routes, Route } from 'react-router-dom';
import SystemLogList from '../logging/SystemLogList';
import SystemLogAnalytics from '../logging/charts/SystemLogAnalytics';
import RestrictedRoute from '../routes/RestrictedRoute';

export default function LoggingApp() {
    return (
        <Routes>
            <Route 
                path="system-logs"
                element={
                    <RestrictedRoute allowedRoles={['admin']}> 
                        <SystemLogList />
                    </RestrictedRoute>
                }
            />
                <Route 
                path="log-analytics"
                element={
                    <RestrictedRoute allowedRoles={['admin']}> 
                        <SystemLogAnalytics />
                    </RestrictedRoute>
                }
            />

        </Routes>
    );
}
