import { Routes, Route } from 'react-router-dom';
import AddDrug from '../drugs/AddDrug';
import AddDrugInteraction from '../drugs/drug-interactions/AddDrugInteraction';
import EditDrug from '../drugs/EditDrug';
import EditDrugInteraction from '../drugs/drug-interactions/EditDrugInteraction';
import DrugList from '../drugs/DrugList';
import DrugDispenseList from '../drugs/drug-dispense/DrugDispenseList';
import DrugInteractionList from '../drugs/drug-interactions/DrugInteractionList';
import DrugDetail from '../drugs/DrugDetail';
import AddDrugDispense from '../drugs/drug-dispense/AddDrugDispense';
import EditDrugDispense from '../drugs/drug-dispense/EditDrugDispense';
import { PharmacistRoute } from '../routes/roleRoutes';
import RestrictedRoute from '../routes/RestrictedRoute';

export default function DrugApp() {
    return (
        <Routes>

            <Route 
              path="/" 
              element={
                  <RestrictedRoute allowedRoles={["pharmacist", "parent", "doctor", "admin"]}>
                      <DrugList />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/drug-dispenses" 
              element={
                  <RestrictedRoute allowedRoles={['pharmacist', 'parent', 'doctor', 'admin']}>
                      <DrugDispenseList />
                  </RestrictedRoute>
              } 
           />

<Route 
              path="/drug-dispenses/edit/:drugDispenseId" 
              element={
                  <RestrictedRoute allowedRoles={['pharmacist']}>
                      <EditDrugDispense />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/drug-interactions" 
              element={
                  <RestrictedRoute allowedRoles={['pharmacist', 'doctor', 'admin']}>
                      <DrugInteractionList />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="/:drugId" 
              element={
                  <RestrictedRoute allowedRoles={["pharmacist", "parent", "doctor", "admin"]}>
                      <DrugDetail />
                  </RestrictedRoute>
              } 
           />

           <Route 
              path="add" 
              element={
                  <PharmacistRoute>
                      <AddDrug />
                  </PharmacistRoute>
              } 
           />

           <Route 
              path="drug-dispenses/add/:prescriptionItemId?" 
              element={
                  <PharmacistRoute>
                      <AddDrugDispense />
                  </PharmacistRoute>
              } 
           />

           <Route 
              path="drug-interactions/add" 
              element={
                  <PharmacistRoute>
                      <AddDrugInteraction />
                  </PharmacistRoute>
              } 
           />
 <Route 
              path="drug-interactions/edit/:drugInteractionId" 
              element={
                  <PharmacistRoute>
                      <EditDrugInteraction />
                  </PharmacistRoute>
              } 
           />
           <Route 
              path="edit/:drugId" 
              element={
                  <PharmacistRoute>
                      <EditDrug />
                  </PharmacistRoute>
              } 
           />

           <Route 
              path="edit/:drugId" 
              element={
                  <PharmacistRoute>
                      <EditDrug />
                  </PharmacistRoute>
              } 
           />
           
        </Routes>
    );
}
