import { Routes, Route } from 'react-router-dom';
import AddAppointment from "../appointments/admin/AddAppointment";
import EditAppointment from "../appointments/admin/EditAppointment";
import AppointmentList from "../appointments/admin/AppointmentList";
import AppointmentDetail from "../appointments/admin/AppointmentDetail";

export default function AppointmentApp () {
        return (
            <Routes> 
                {/* List all children (patients) */}
                <Route path="/" element={<AppointmentList />} /> 
    
                {/* View individual appointment (patient) profile */}
                <Route path="/:appointmentId" element={<AppointmentDetail />} />
    
    
                {/* Add new appointment */}
               <Route path="/add/:childId?" element={<AddAppointment />} />

    
              
    
                {/* Edit appointment */}
                <Route path="/edit/:appointmentId" element={<EditAppointment />} />
            </Routes>
        );
}