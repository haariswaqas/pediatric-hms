import { Routes, Route } from 'react-router-dom';
import RoleBasedRoute from '../routes/RoleBasedRoute';
import AddDiagnosis from '../diagnosis/AddDiagnosis';
import AddTreatment from '../diagnosis/treatment/AddTreatment';
import AddAttachment from '../diagnosis/attachment/AddAttachment';
import DiagnosisList from '../diagnosis/DiagnosisList';
import EditDiagnosis from '../diagnosis/EditDiagnosis';
import EditTreatment from '../diagnosis/treatment/EditTreatment';
import DiagnosisDetail from '../diagnosis/DiagnosisDetail';
import { DoctorRoute } from '../routes/roleRoutes';
import TreatmentList from '../diagnosis/treatment/TreatmentList';
import AttachmentList from '../diagnosis/attachment/AttachmentList';
import RestrictedRoute from '../routes/RestrictedRoute';
import EditAttachment from '../diagnosis/attachment/EditAttachment';

export default function DiagnosisApp() {
    return (
        <Routes>
           

               {/* Add new appointment */}
               <Route 
                path="add/:childId??" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor']}
                    allowedComponent={<AddDiagnosis />}
                    fallbackComponent={<DiagnosisList />}
                  />
                } 
            />

            <Route 
                path="attachments/add/:diagnosisId?" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor', 'lab_tech']}
                    allowedComponent={<AddAttachment />}
                    fallbackComponent={<TreatmentList />}
                  />
                } 
            />
            
            <Route 
                path="attachments/edit/:attachmentId" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor', 'lab_tech']}
                    allowedComponent={<EditAttachment />}
                    fallbackComponent={<TreatmentList />}
                  />
                } 
            />
            
            <Route 
                path="/" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <DiagnosisList />
                    </RestrictedRoute>
                } 
            />


            <Route 
                path="treatments" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <TreatmentList />
                    </RestrictedRoute>
                } 
            />
            
            <Route 
                path="attachments" 
                element={
                    <RestrictedRoute allowedRoles={['doctor', 'lab_tech', 'nurse']}>
                    <AttachmentList />
                    </RestrictedRoute>
                } 
            />
            <Route 
                path="edit/:diagnosisId" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor']}
                    allowedComponent={<EditDiagnosis />}
                    fallbackComponent={<DiagnosisList />}
                  />
                } 
            />
              <Route 
                path="treatments/edit/:treatmentId" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor']}
                    allowedComponent={<EditTreatment />}
                    fallbackComponent={<TreatmentList />}
                  />
                } 
            />
            
            <Route 
                path="detail/:diagnosisId" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <DiagnosisDetail />
                  </RestrictedRoute>
                } 
            />

            {/* Add new treatment */}
            <Route 
                path="treatments/add/:diagnosisId??" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor']}
                    allowedComponent={<AddTreatment />}
                    fallbackComponent={<TreatmentList />}
                  />
                } 
            />
        </Routes>
    )
}