import { Routes, Route } from 'react-router-dom';

import AddLabTest from '../lab/lab-tests/AddLabTest'; 
import LabTestsList from '../lab/lab-tests/LabTestsList';
import ReferenceRangeList from '../lab/reference-ranges/ReferenceRangeList';
import EditLabTest from '../lab/lab-tests/EditLabTest';
import AddReferenceRange from '../lab/reference-ranges/AddReferenceRange';
import EditReferenceRange from '../lab/reference-ranges/EditReferenceRange';

import AddLabRequest from '../lab/lab-requests/AddLabRequest';
import LabRequestsList from '../lab/lab-requests/LabRequestsList';
import LabRequestItemsList from '../lab/lab-request-items/LabRequestItemsList';
import EditLabRequest from '../lab/lab-requests/EditLabRequest';
import AddLabRequestItem from '../lab/lab-request-items/AddLabRequestItem';

import AddLabResult from '../lab/lab-results/AddLabResult';
import AddLabResultParameter from '../lab/lab-result-parameters/AddLabResultParameter';
import EditLabResultParameter from '../lab/lab-result-parameters/EditLabResultParameter';
import RestrictedRoute from '../routes/RestrictedRoute';

import LabResultsList from '../lab/lab-results/LabResultsList';
import LabResultParameterList from '../lab/lab-result-parameters/LabResultParameterList';
import { DoctorRoute } from '../routes/roleRoutes';
export default function LabApp() {
    return (
        <Routes>
            <Route 
              path="/" 
              element={
                  <RestrictedRoute allowedRoles={['lab_tech', 'admin']}>
                      <LabTestsList />
                  </RestrictedRoute>
              } 
           />

<Route 
              path="/add" 
              element={
                  <RestrictedRoute allowedRoles={['lab_tech']}>
                      <AddLabTest />
                  </RestrictedRoute>
              } 
           />
<Route 
              path="/lab-requests" 
              element={
                  <RestrictedRoute allowedRoles={['lab_tech', 'doctor', 'admin', 'nurse']}>
                      <LabRequestsList />
                  </RestrictedRoute>
              } 
           />
           <Route 
              path="/lab-request-items" 
              element={
                  <RestrictedRoute allowedRoles={['lab_tech', 'doctor', 'admin', 'nurse']}>
                      <LabRequestItemsList />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/reference-ranges" 
              element={
                  <RestrictedRoute allowedRoles={['lab_tech', 'admin']}>
                      <ReferenceRangeList />
                  </RestrictedRoute>
              } 
           />






            <Route 
              path="/add-lab-request" 
              element={
                  <RestrictedRoute allowedRoles={["doctor"]}>
                      <AddLabRequest />
                  </RestrictedRoute>
              } 
           />
   <Route 
        path="add-lab-request-item/:labRequestId?" 
        element={
          <DoctorRoute>
            <AddLabRequestItem />
          </DoctorRoute>
        } 
      />
           <Route 
              path="/add-reference-range" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <AddReferenceRange />
                  </RestrictedRoute>
              } 
           />


           <Route 
              path="/edit/:labTestId" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <EditLabTest />
                  </RestrictedRoute>
              } 
           />      

 <Route 
              path="/edit-lab-request/:labRequestId" 
              element={
                  <RestrictedRoute allowedRoles={["doctor"]}>
                      <EditLabRequest />
                  </RestrictedRoute>
              } 
           />      
                

           <Route 
              path="/edit-reference-range/:referenceRangeId" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <EditReferenceRange />
                  </RestrictedRoute>
              } 
           />           

           <Route 
              path="/add-lab-result/:labRequestItemId?" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <AddLabResult />
                  </RestrictedRoute>
              } 
           /> 
           <Route 
              path="/add-lab-result-parameter/:labResultId?" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <AddLabResultParameter />
                  </RestrictedRoute>
              } 
           /> 
           <Route 
              path="/lab-results" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech", "doctor", "admin", "nurse"]}>
                      <LabResultsList />
                  </RestrictedRoute>
              } 
           /> 
           <Route 
              path="/lab-result-parameters" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech", "doctor", "admin", "nurse", "parent"]}>
                      <LabResultParameterList />
                  </RestrictedRoute>
              } 
           /> 

<Route 
              path="/add-lab-result-parameter/:labResultId?" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <AddLabResultParameter />
                  </RestrictedRoute>
              } 
           /> 
           <Route 
              path="/edit-lab-result-parameter/:labResultParameterId" 
              element={
                  <RestrictedRoute allowedRoles={["lab_tech"]}>
                      <EditLabResultParameter />
                  </RestrictedRoute>
              } 
           /> 
        </Routes>
    )
}