// src/shifts/shift-assignments/AddShiftAssignment.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles } from '../../store/admin/profileManagementSlice';
import { fetchShifts } from '../../store/shifts/shiftSlice';
import { createDoctorAssignment } from '../../store/shifts/doctorShiftAssignmentSlice';
import { createNurseAssignment } from '../../store/shifts/nurseShiftAssignmentSlice';
import { createPharmacistAssignment } from '../../store/shifts/pharmacistShiftAssignmentSlice';
import { createLabTechAssignment } from '../../store/shifts/labtechShiftAssignmentSlice';

export default function AddShiftAssignment() {
  const dispatch = useDispatch();
  const [role, setRole] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedShifts, setSelectedShifts] = useState([]);

  const { profilesByRole, loading: profilesLoading, error: profilesError } = useSelector(state => state.profileManagement);
  const { shifts, loading: shiftsLoading, error: shiftsError } = useSelector(state => state.shifts);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    if (role) {
      dispatch(fetchProfiles({ role }));
      setSelectedPerson('');
      setSelectedShifts([]);
    }
  }, [dispatch, role]);

  const handleShiftChange = (e) => {
    const shiftId = e.target.value;
    
    // Convert to string to ensure consistent comparison
    const stringShiftId = String(shiftId);
    
    // If the shift is already selected, remove it, otherwise add it
    if (selectedShifts.includes(stringShiftId)) {
      setSelectedShifts(selectedShifts.filter(id => id !== stringShiftId));
    } else {
      setSelectedShifts([...selectedShifts, stringShiftId]);
    }
  };

  const isShiftSelected = (shiftId) => {
    // Convert to string for consistent comparison and check if it's in the array
    return selectedShifts.includes(String(shiftId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    let shiftData = {};
  
    switch (role) {
      case 'doctor':
        shiftData = { doctor: selectedPerson, shifts: selectedShifts };
        dispatch(createDoctorAssignment(shiftData));
        break;
      case 'nurse':
        shiftData = { nurse: selectedPerson, shifts: selectedShifts };
        dispatch(createNurseAssignment(shiftData));
        break;
      case 'pharmacist':
        shiftData = { pharmacist: selectedPerson, shifts: selectedShifts };
        dispatch(createPharmacistAssignment(shiftData));
        break;
      case 'labtech':
        shiftData = { lab_tech: selectedPerson, shifts: selectedShifts };
        dispatch(createLabTechAssignment(shiftData));
        break;
      default:
        alert('Please select a valid role.');
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Assign Shift</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-gray-700 dark:text-gray-300">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 p-2 block w-full rounded border dark:bg-gray-700 dark:text-gray-100"
            required
          >
            <option value="">-- Choose Role --</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="labtech">Lab Technician</option>
          </select>
        </div>

        {role && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Select {role}</label>
            {profilesLoading ? (
              <p className="text-gray-500 dark:text-gray-300">Loading {role} profiles...</p>
            ) : profilesError ? (
              <p className="text-red-500">Error loading profiles: {profilesError}</p>
            ) : (
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="mt-1 p-2 block w-full rounded border dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="">-- Choose {role} --</option>
                {profilesByRole?.[role]?.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.first_name} {person.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Select Shifts (Multiple)</label>
          {shiftsLoading ? (
            <p className="text-gray-500 dark:text-gray-300">Loading shifts...</p>
          ) : shiftsError ? (
            <p className="text-red-500">Error loading shifts: {shiftsError}</p>
          ) : (
            <div className="mt-1 p-2 border rounded dark:bg-gray-700">
              {shifts?.map(shift => (
                <div key={shift.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`shift-${shift.id}`}
                    value={shift.id}
                    checked={isShiftSelected(shift.id)}
                    onChange={handleShiftChange}
                    className="mr-2 cursor-pointer h-4 w-4"
                  />
                  <label 
                    htmlFor={`shift-${shift.id}`} 
                    className="text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {shift.day} ({shift.start_time} - {shift.end_time})
                  </label>
                </div>
              ))}
              {shifts?.length === 0 && (
                <p className="text-gray-500 dark:text-gray-300">No shifts available</p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={!selectedPerson || selectedShifts.length === 0}
        >
          Assign Shifts
        </button>
      </form>
    </div>
  );
}