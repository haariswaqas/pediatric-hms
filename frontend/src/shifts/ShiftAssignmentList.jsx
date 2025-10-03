// src/shifts/DoctorShiftAssignmentList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function ShiftAssignmentList() {
  const dispatch = useDispatch();
  const {
    items: doctorAssignments,
    loading,
    error
  } = useSelector(state => state.doctorShiftAssignments);

  useEffect(() => {
    dispatch(fetchDoctorAssignments());
  }, [dispatch]);

  if (loading) {
    return <p className="p-4 text-center">Loading doctor shift assignments...</p>;
  }
  if (error) {
    return <p className="p-4 text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Doctor Shift Assignments
      </h2>

      {doctorAssignments.length > 0 ? (
        <ul className="space-y-4">
          {doctorAssignments.map(assign => (
            <li
              key={assign.id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow"
            >
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Dr. {assign.doctor_details?.first_name}{' '}
                {assign.doctor_details?.last_name}
              </p>
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                Assigned Shifts:{' '}
                {assign.shift_details.map((shift, idx) => (
                  <span key={idx} className="inline-block mr-2">
                    {shift.day} ({shift.start_time} - {shift.end_time})
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No doctor assignments found.
        </p>
      )}
    </div>
  );
}
