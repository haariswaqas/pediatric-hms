// src/shifts/PharmacistShiftAssignmentList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchPharmacistAssignments,
  deletePharmacistAssignment
} from '../../store/shifts/pharmacistShiftAssignmentSlice';
import { UserPlus } from 'lucide-react';

// Import reusable components
import ShiftAssignmentChart from './components/ShiftAssignmentChart';
import ShiftAssignmentFilters from './components/ShiftAssignmentFilters';
import ShiftAssignmentItem from './components/ShiftAssignmentItem';
import EmptyAssignmentState from './components/EmptyAssignmentState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function PharmacistShiftAssignments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: pharmacistAssignments = [],
    loading,
    error
  } = useSelector(state => state.pharmacistShiftAssignment);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterDay, setFilterDay] = useState('');
  const [showStats, setShowStats] = useState(false);

  const roleType = 'pharmacist';

  useEffect(() => {
    dispatch(fetchPharmacistAssignments());
  }, [dispatch]);

  const uniqueDays = useMemo(() => {
    const days = new Set();
    pharmacistAssignments.forEach(assignment => {
      assignment.shift_details.forEach(shift => {
        days.add(shift.day);
      });
    });
    return Array.from(days).sort();
  }, [pharmacistAssignments]);

  const filteredAndSortedAssignments = useMemo(() => {
    return pharmacistAssignments
      .filter(assign => {
        const pharmacistName = `${assign.pharmacist_details?.first_name} ${assign.pharmacist_details?.last_name}`.toLowerCase();
        const matchesSearch = pharmacistName.includes(searchTerm.toLowerCase());
        const matchesDay = filterDay === '' || assign.shift_details.some(shift => shift.day === filterDay);
        return matchesSearch && matchesDay;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          const nameA = `${a.pharmacist_details?.last_name}, ${a.pharmacist_details?.first_name}`.toLowerCase();
          const nameB = `${b.pharmacist_details?.last_name}, ${b.pharmacist_details?.first_name}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
        } else if (sortField === 'shifts') {
          comparison = a.shift_details.length - b.shift_details.length;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [pharmacistAssignments, searchTerm, sortField, sortDirection, filterDay]);

  const handleDelete = (id) => {
    dispatch(deletePharmacistAssignment(id));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDay('');
  };

  const handleRetry = () => {
    dispatch(fetchPharmacistAssignments());
  };

  if (loading) {
    return <LoadingState roleType={roleType} />;
  }

  if (error) {
    return <ErrorState error={error} retry={handleRetry} roleType={roleType} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Pharmacist Shift Assignments
        </h2>
        <button
          onClick={() => navigate('/shifts/assign/pharmacist/new')}
          className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <UserPlus size={18} className="mr-2" />
          New Assignment
        </button>
      </div>

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

      {showStats && (
        <ShiftAssignmentChart
          assignmentData={pharmacistAssignments}
          uniqueDays={uniqueDays}
          roleType={roleType}
          barColor="#3b82f6"  // Blue for pharmacists
        />
      )}

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
