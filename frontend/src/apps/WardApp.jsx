import { Routes, Route } from 'react-router-dom';
import WardList from '../wards/WardList';
import AddWard from '../wards/AddWard';
import EditWard from '../wards/EditWard';

import BedList from '../wards/beds/BedList';
import AddBed from '../wards/beds/AddBed';
import EditBed from '../wards/beds/EditBed';

export default function WardApp() {
    return (
        <Routes> 
       
            <Route path="/" element={<WardList />} />  
            
            <Route path="add" element={<AddWard />} /> 
            <Route path="edit/:wardId" element={<EditWard />} />  

            <Route path="/beds" element={<BedList />} />  
            
            <Route path="/beds/add" element={<AddBed />} /> 
            <Route path="/beds/edit/:bedId" element={<EditBed />} />  

         
        </Routes>
    );
}