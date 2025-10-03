// src/children/ChildManagementApp.jsx
import { Routes, Route } from 'react-router-dom';
import ChildList from '../children/ChildList';
import ChildrenList from '../children/ChildrenList';
import ChildProfile from '../children/ChildProfile';
import AddChild from '../children/AddChild';
import AddPatient from '../children/AddPatient';
import EditChild from '../children/EditChild';
import EditMyChild from '../children/EditMyChild';
import RoleBasedRoute from '../routes/RoleBasedRoute';
import ChildMedicalHistoryPDFView from '../children/ChildMedicalHistoryPDFView';

export default function ChildManagementApp() {
    return (
        <Routes> 
            {/* List all children (patients) */}
            <Route 
  path="/" 
  element={
    <RoleBasedRoute 
      allowedRoles={['admin', 'doctor', 'nurse', 'lab_tech']}
      allowedComponent={<ChildrenList />}
      fallbackComponent={<ChildList />}
    />
  }
/>


            {/* View individual child (patient) profile */}
            <Route path="/child/:childId" element=
            
            { 
            <ChildProfile />
            
            } />

            {/* Add new child */}


            <Route 
                path="/add" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['admin', 'doctor', 'parent', 'nurse']}
                        allowedComponent={<AddPatient />}
                        
                    />
                } 
            />

            {/* Medical History PDF View */}
            <Route 
                path="/:childId/pdf" 
                element={
                    <RoleBasedRoute 
                        allowedRoles={['admin', 'doctor', 'nurse', 'lab_tech']}
                        allowedComponent={<ChildMedicalHistoryPDFView />}
                    />
                } 
            />



          

          

            <Route 
  path="/edit/:childId" 
  element={
    <RoleBasedRoute 
      allowedRoles={['admin', 'doctor', 'nurse', 'lab_tech']}
      allowedComponent={<EditChild />}
      fallbackComponent={<EditMyChild />}
    />
  }
/>
        </Routes>

    );
}
