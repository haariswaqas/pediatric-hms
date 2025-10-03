import {Routes, Route} from 'react-router-dom';
import AdmissionList from '../admissions/AdmissionList';
import AdmissionDetail from '../admissions/AdmissionDetail';
import AddAdmission from '../admissions/AddAdmission';
import EditAdmission from '../admissions/EditAdmission';
import RestrictedRoute from '../routes/RestrictedRoute';
import AddAdmissionVital from '../admissions/admission-vitals/AddAdmissionVital';
import EditAdmissionVital from '../admissions/admission-vitals/EditAdmissionVital';
import VitalHistories from '../admissions/admission-vitals/VitalHistories';
import VitalHistory from '../admissions/admission-vitals/VitalHistory';


export default function AdmissionApp() {
    return (
        <Routes>





          <Route 
              path="/add/:childId?" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse"]}>
                      <AddAdmission />
                  </RestrictedRoute>
              } 
           />


   <Route 
              path="/add-vitals/:admissionId?" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse"]}>
                      <AddAdmissionVital />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/edit-vitals/:admissionVitalId" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse"]}>
                      <EditAdmissionVital />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/edit/:admissionId" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse"]}>
                      <EditAdmission />
                  </RestrictedRoute>
              } 
        />
           <Route 
              path="/detail/:admissionId" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse", "admin"]}>
                      <AdmissionDetail />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/" 
              element={
                  <RestrictedRoute allowedRoles={["doctor", "nurse", "admin", "parent"]}>
                      <AdmissionList />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/vital-histories" 
              element={
                  <RestrictedRoute allowedRoles={["admin","doctor", "nurse"]}>
                      <VitalHistories />
                  </RestrictedRoute>
              } 
           />
           
           <Route 
              path="/vital-history/:admissionVitalId" 
              element={
                  <RestrictedRoute allowedRoles={["admin","doctor", "nurse"]}>
                      <VitalHistory />
                  </RestrictedRoute>
              } 
           />
        </Routes>
    );
}
