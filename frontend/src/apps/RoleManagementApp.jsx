// src/apps/UserManagementApp.jsx
import { Routes, Route } from 'react-router-dom';
import RolePermissionsList from '../role-management/RolePermissionsList';
import AddRolePermission from '../role-management/AddRolePermission';
import EditRolePermission from '../role-management/EditRolePermission';

import { AdminRoute } from '../routes/roleRoutes';

export default function RoleManagementApp() {
    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    <AdminRoute>
                        <RolePermissionsList />
                    </AdminRoute>
                } 
            />
             
             <Route 
                path="add" 
                element={
                    <AdminRoute>
                        <AddRolePermission />
                    </AdminRoute>
                } 
            />

<Route 
                path="edit/:rolePermissionId" 
                element={
                    <AdminRoute>
                        <EditRolePermission />
                    </AdminRoute>
                } 
            />

              
        </Routes>
    );
}
