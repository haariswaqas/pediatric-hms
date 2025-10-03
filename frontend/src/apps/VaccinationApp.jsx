import { Routes, Route } from 'react-router-dom';
import RoleBasedRoute from '../routes/RoleBasedRoute';
import AddVaccine from '../vaccination/vaccines/AddVaccine';
import EditVaccine from '../vaccination/vaccines/EditVaccine';
import VaccineList from '../vaccination/vaccines/VaccineList';
import VaccinationRecordList from '../vaccination/vaccination-records/VaccinationRecordList';
import AddVaccinationRecord from '../vaccination/vaccination-records/AddVaccinationRecord';
import EditVaccinationRecord from '../vaccination/vaccination-records/EditVaccinationRecord';
import VaccinationRecords from '../vaccination/vaccination-records/VaccinationRecords';
import { AdminRoute } from '../routes/roleRoutes';
import RestrictedRoute from '../routes/RestrictedRoute';
export default function VaccinationApp () {

    return (
        <Routes> 
    
    <Route 
                path="/" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <VaccineList />
                  </RestrictedRoute>
                } 
            />

<Route 
                path="/vaccination-records/alt" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <VaccinationRecords />
                  </RestrictedRoute>
                } 
            />

<Route 
                path="/vaccination-records" 
                element={
                    <RestrictedRoute allowedRoles={['admin', 'parent', 'doctor', 'nurse', 'pharmacist']}>
                    <VaccinationRecordList />
                  </RestrictedRoute>
                } 
            />


<Route 
                path="/vaccination-records/add/:childId?" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['doctor', 'nurse', 'pharmacist']}
                    allowedComponent={<AddVaccinationRecord />}
                    fallbackComponent={<VaccinationRecordList/>}
                />
                } 
            />

    <Route 
                path="add" 
                element={
                    <AdminRoute>
                        <AddVaccine />
                    </AdminRoute >
                } 
            />

<Route 
                path="edit/:vaccineId" 
                element={
                    <AdminRoute>
                        <EditVaccine />
                    </AdminRoute >
                } 
            />

<Route 
                path="/vaccination-records/edit/:vaccinationRecordId" 
                element={
                    <RoleBasedRoute 
                    allowedRoles={['admin', 'doctor', 'nurse']}
                    allowedComponent={<EditVaccinationRecord />}
                    fallbackComponent={<VaccinationRecords />}
                />
                } 
            />



    </Routes>


    )
}