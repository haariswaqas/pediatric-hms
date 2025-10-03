import { Routes, Route } from 'react-router-dom';
import ShiftList from '../shifts/ShiftList';
import ShiftAssignments from '../shifts/shift-assignments/ShiftAssignments';
import DoctorShiftAssignments from '../shifts/shift-assignments/DoctorShiftAssignments';
import LabTechShiftAssignments from '../shifts/shift-assignments/LabTechShiftAssignments';
import NurseShiftAssignments from '../shifts/shift-assignments/NurseShiftAssignments';
import PharmacistShiftAssignments from '../shifts/shift-assignments/PharmacistShiftAssignments';

import AddShift from '../shifts/AddShift';
import AddShiftAssignment from '../shifts/shift-assignments/AddShiftAssignment';
import EditShiftAssignment from '../shifts/shift-assignments/EditShiftAssignment';
import EditShift from '../shifts/EditShift';
import RoleBasedRoute from '../routes/RoleBasedRoute';
import {  AdminRoute } from '../routes/roleRoutes';

// Helper to wrap routes in AdminRoute
const withAdminRoute = (Component) => <AdminRoute>{Component}</AdminRoute>;

export default function ShiftApp() {
  return (
    <Routes>
      {/* Admin-protected routes */}
      <Route path="/" element={withAdminRoute(<ShiftList />)} />
      <Route path="assignments" element={withAdminRoute(<ShiftAssignments />)} />
      <Route path="add" element={withAdminRoute(<AddShift />)} />
      <Route path="edit/:shiftId" element={withAdminRoute(<EditShift />)} />
      <Route path="assign" element={withAdminRoute(<AddShiftAssignment />)} />
      <Route path="assign/:role/edit/:id" element={withAdminRoute(<EditShiftAssignment />)} />

      {/* Open or role-specific route */}
      <Route path="assignments/doctors" element={<RoleBasedRoute allowedRoles={['doctor', 'parent', 'admin']} 
      allowedComponent={<DoctorShiftAssignments />} 
      fallbackComponent={<DoctorShiftAssignments />} />} />
      <Route path="assignments/lab-techs" element={<RoleBasedRoute allowedRoles={['lab technician', 'admin']} 
      allowedComponent={<LabTechShiftAssignments />} 
      fallbackComponent={<LabTechShiftAssignments />} />} />
      <Route path="assignments/nurses" element={<RoleBasedRoute allowedRoles={['nurse', 'admin']} 
      allowedComponent={<NurseShiftAssignments />} 
      fallbackComponent={<NurseShiftAssignments />} />} />
      <Route path="assignments/pharmacists" element={<RoleBasedRoute allowedRoles={['pharmacist', 'admin']} 
      allowedComponent={<PharmacistShiftAssignments />} 
      fallbackComponent={<PharmacistShiftAssignments />} />} />
    </Routes>

    
  );
}
