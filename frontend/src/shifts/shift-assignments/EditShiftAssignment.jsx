// src/shifts/shift-assignments/EditShiftAssignment.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchShifts } from '../../store/shifts/shiftSlice';
import { 
  fetchDoctorAssignmentById, 
  updateDoctorAssignment,
  clearCurrentAssignment as clearDoctorAssignment
} from '../../store/shifts/doctorShiftAssignmentSlice';
import { 
  fetchNurseAssignmentById, 
  updateNurseAssignment,
  clearCurrentAssignment as clearNurseAssignment 
} from '../../store/shifts/nurseShiftAssignmentSlice';
import { 
  fetchPharmacistAssignmentById, 
  updatePharmacistAssignment,
  clearCurrentAssignment as clearPharmacistAssignment
} from '../../store/shifts/pharmacistShiftAssignmentSlice';
import { 
  fetchLabTechAssignmentById, 
  updateLabTechAssignment,
  clearCurrentAssignment as clearLabTechAssignment
} from '../../store/shifts/labtechShiftAssignmentSlice';

export default function EditShiftAssignment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, id } = useParams(); // route: /assign/:role/edit/:id
  
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { shifts, loading: shiftsLoading, error: shiftsError } = useSelector(state => state.shifts);
  const currentAssignment = useSelector(state => {
    switch(role) {
      case 'doctor': return state.doctorShiftAssignment.currentAssignment;
      case 'nurse': return state.nurseShiftAssignment.currentAssignment;
      case 'pharmacist': return state.pharmacistShiftAssignment.currentAssignment;
      case 'labtech': return state.labtechShiftAssignment.currentAssignment;
      default: return null;
    }
  });

  const assignmentLoading = useSelector(state => {
    switch(role) {
      case 'doctor': return state.doctorShiftAssignment.loading;
      case 'nurse': return state.nurseShiftAssignment.loading;
      case 'pharmacist': return state.pharmacistShiftAssignment.loading;
      case 'labtech': return state.labtechShiftAssignment.loading;
      default: return false;
    }
  });
  const assignmentError = useSelector(state => {
    switch(role) {
      case 'doctor': return state.doctorShiftAssignment.error;
      case 'nurse': return state.nurseShiftAssignment.error;
      case 'pharmacist': return state.pharmacistShiftAssignment.error;
      case 'labtech': return state.labtechShiftAssignment.error;
      default: return null;
    }
  });

  // Fetch assignment + shifts on mount
  useEffect(() => {
    if (id && role) {
      dispatch(fetchShifts());
      switch(role) {
        case 'doctor': dispatch(fetchDoctorAssignmentById(id)); break;
        case 'nurse': dispatch(fetchNurseAssignmentById(id)); break;
        case 'pharmacist': dispatch(fetchPharmacistAssignmentById(id)); break;
        case 'labtech': dispatch(fetchLabTechAssignmentById(id)); break;
        default: console.error('Invalid role:', role);
      }
    }
    return () => {
      switch(role) {
        case 'doctor': dispatch(clearDoctorAssignment()); break;
        case 'nurse': dispatch(clearNurseAssignment()); break;
        case 'pharmacist': dispatch(clearPharmacistAssignment()); break;
        case 'labtech': dispatch(clearLabTechAssignment()); break;
        default: break;
      }
    };
  }, [dispatch, id, role]);

  // Populate selectedShifts from fetched assignment
  useEffect(() => {
    if (currentAssignment && !initialized && !assignmentLoading) {
      const shiftIds = currentAssignment.shifts?.map(s =>
        typeof s === 'object' ? String(s.id) : String(s)
      ) || [];
      setSelectedShifts(shiftIds);
      setInitialized(true);
    }
  }, [currentAssignment, assignmentLoading, initialized]);

  const isShiftSelected = shiftId => selectedShifts.includes(String(shiftId));

  const handleShiftChange = e => {
    const idStr = String(e.target.value);
    setSelectedShifts(prev =>
      prev.includes(idStr) ? prev.filter(i => i !== idStr) : [...prev, idStr]
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Need to include the person field so backend validation passes
    const personObj = currentAssignment?.[role];
    const personId = typeof personObj === 'object' ? personObj.id : personObj;

    // Convert shift IDs to numbers if needed
    const shifted = selectedShifts.map(s => Number(s));

    // Build payload including fixed person + updated shifts
    const data = { [role]: personId, shifts: shifted };
    const actionMap = {
      doctor: updateDoctorAssignment,
      nurse: updateNurseAssignment,
      pharmacist: updatePharmacistAssignment,
      labtech: updateLabTechAssignment
    };
    const updateAction = actionMap[role];
    if (updateAction) {
      dispatch(updateAction({ id, data }))
        .then(() => navigate('/shifts/assignments'));
    } else alert('Invalid role');
  };

  if ((assignmentLoading || shiftsLoading) && !initialized) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Loading Assignment...</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Assignment</h2>
        <p className="text-red-500">{assignmentError}</p>
        <button onClick={() => navigate('/shift-assignments')} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Back to Assignments
        </button>
      </div>
    );
  }

  // Helpers for display only
  const getRoleText = () => role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  const getPersonName = () => {
    const p = currentAssignment?.[role];
    return p ? (typeof p === 'object' ? `${p.first_name} ${p.last_name}` : String(p)) : '';
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Shift Assignment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Role (fixed)</label>
          <div className="mt-1 p-2 w-full rounded border bg-gray-100 dark:bg-gray-700 dark:text-gray-100">
            {getRoleText()}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300">Person (fixed)</label>
          <div className="mt-1 p-2 w-full rounded border bg-gray-100 dark:bg-gray-700 dark:text-gray-100">
            {getPersonName()}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Select Shifts (Multiple)</label>
          {shiftsLoading ? (
            <p className="text-gray-500 dark:text-gray-300">Loading shifts...</p>
          ) : shiftsError ? (
            <p className="text-red-500">Error loading shifts: {shiftsError}</p>
          ) : (
            <div className="mt-1 p-2 border rounded dark:bg-gray-700">
              {shifts.map(shift => (
                <div key={shift.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`shift-${shift.id}`}
                    value={shift.id}
                    checked={isShiftSelected(shift.id)}
                    onChange={handleShiftChange}
                    className="mr-2 cursor-pointer h-4 w-4"
                  />
                  <label htmlFor={`shift-${shift.id}`} className="text-gray-700 dark:text-gray-300 cursor-pointer">
                    {shift.day} ({shift.start_time} - {shift.end_time})
                  </label>
                </div>
              ))}
              {shifts.length === 0 && <p className="text-gray-500 dark:text-gray-300">No shifts available</p>}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={assignmentLoading || selectedShifts.length === 0}
          >
            {assignmentLoading ? 'Updating...' : 'Update Shifts'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/shift-assignments')}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
