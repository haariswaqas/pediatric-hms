import { Route, Routes } from "react-router-dom";
import PrescriptionList from "../prescriptions/PrescriptionList";
import PrescriptionItemList from "../prescriptions/prescription-items/PrescriptionItemList";
import AddPrescription from "../prescriptions/AddPrescription";
import AddPrescriptionItem from "../prescriptions/prescription-items/AddPrescriptionItem";
import EditPrescription from "../prescriptions/EditPrescription";
import EditPrescriptionItem from "../prescriptions/prescription-items/EditPrescriptionItem";
import { DoctorRoute } from "../routes/roleRoutes";
import RoleBasedRoute from "../routes/RoleBasedRoute";
import RestrictedRoute from "../routes/RestrictedRoute";

export default function PrescriptionApp() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <RestrictedRoute allowedRoles={["doctor", 'parent', "admin", "nurse"]} fallback="/prescriptions/items">
            <PrescriptionList />
          </RestrictedRoute>
        } 
      />
      <Route 
        path="items" 
        element={
          <RestrictedRoute allowedRoles={[
            "doctor",
            "parent", 
            "admin",
            "nurse",
            "pharmacist"
          ]}>
            <PrescriptionItemList />
          </RestrictedRoute>
        } 
      />
      
      {/* Route for adding prescription from child profile */}
      <Route 
        path="add/:childId?"
        element={
          <DoctorRoute>
            <AddPrescription />
          </DoctorRoute>
        }
      />
      
      {/* Route for adding prescription from diagnosis */}
      <Route 
        path="add/diagnosis/:diagnosisId" 
        element={
          <DoctorRoute>
            <AddPrescription />
          </DoctorRoute>
        } 
      />
      
      <Route 
        path="add-item/:prescriptionId?" 
        element={
          <DoctorRoute>
            <AddPrescriptionItem />
          </DoctorRoute>
        } 
      />
      <Route 
        path="edit-item/:prescriptionItemId" 
        element={
          <DoctorRoute>
            <EditPrescriptionItem />
          </DoctorRoute>
        } 
      />
      <Route 
        path="edit/:prescriptionId" 
        element={
          <DoctorRoute>
            <EditPrescription />
          </DoctorRoute>
        } 
      />
    </Routes>
  );
}