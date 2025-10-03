// src/shifts/DoctorShiftAssignmentList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchDoctorAssignments,
  deleteDoctorAssignment
} from '../../store/shifts/doctorShiftAssignmentSlice';
import { UserPlus } from 'lucide-react';

// Import reusable components
import ShiftAssignmentChart from './components/ShiftAssignmentChart';
import ShiftAssignmentFilters from './components/ShiftAssignmentFilters';
import ShiftAssignmentItem from './components/ShiftAssignmentItem';
import EmptyAssignmentState from './components/EmptyAssignmentState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function DoctorShiftAssignments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: doctorAssignments = [],
    loading,
    error
  } = useSelector(state => state.doctorShiftAssignment);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterDay, setFilterDay] = useState('');
  const [showStats, setShowStats] = useState(false);

  // The role type identifier - change this in each role-specific component
  const roleType = 'doctor';

  // Fetch assignments on component mount
  useEffect(() => {
    dispatch(fetchDoctorAssignments());
  }, [dispatch]);

  // Get unique days from all shifts for filtering
  const uniqueDays = useMemo(() => {
    const days = new Set();
    doctorAssignments.forEach(assignment => {
      assignment.shift_details.forEach(shift => {
        days.add(shift.day);
      });
    });
    return Array.from(days).sort();
  }, [doctorAssignments]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    return doctorAssignments
      .filter(assign => {
        const doctorName = `${assign.doctor_details?.first_name} ${assign.doctor_details?.last_name}`.toLowerCase();
        const matchesSearch = doctorName.includes(searchTerm.toLowerCase());
        const matchesDay = filterDay === '' || assign.shift_details.some(shift => shift.day === filterDay);
        return matchesSearch && matchesDay;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'name') {
          const nameA = `${a.doctor_details?.last_name}, ${a.doctor_details?.first_name}`.toLowerCase();
          const nameB = `${b.doctor_details?.last_name}, ${b.doctor_details?.first_name}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
        } else if (sortField === 'shifts') {
          comparison = a.shift_details.length - b.shift_details.length;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [doctorAssignments, searchTerm, sortField, sortDirection, filterDay]);

  // Handle deletion
  const handleDelete = (id) => {
    dispatch(deleteDoctorAssignment(id));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm(''); 
    setFilterDay('');
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(fetchDoctorAssignments());
  };

  // Loading state
  if (loading) {
    return <LoadingState roleType={roleType} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} retry={handleRetry} roleType={roleType} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Doctor Shift Assignments
        </h2>
        <button
          onClick={() => navigate('/shifts/assign')}
          className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <UserPlus size={18} className="mr-2" />
          New Assignment
        </button>
      </div>

      {/* Filters */}
      <ShiftAssignmentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDay={filterDay}
        setFilterDay={setFilterDay}
        uniqueDays={uniqueDays}
        sortField={sortField}
        setSortField={setSortField}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        showStats={showStats}
        setShowStats={setShowStats}
        roleNameSingular={roleType}
      />

      {/* Statistics chart */}
      {showStats && (
        <ShiftAssignmentChart
          assignmentData={doctorAssignments}
          uniqueDays={uniqueDays}
          roleType={roleType}
          barColor="#3b82f6"
        />
      )}

      {/* Assignment list */}
      {filteredAndSortedAssignments.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedAssignments.map(assignment => (
              <ShiftAssignmentItem
                key={assignment.id}
                assignment={assignment}
                roleType={roleType}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyAssignmentState
          hasFilters={searchTerm !== '' || filterDay !== ''}
          clearFilters={clearFilters}
          roleType={roleType}
        />
      )}
    </div>
  );
}