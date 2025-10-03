import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, searchChildren } from '../../store/children/childManagementSlice';
import { createAppointment, fetchDoctors } from '../../store/appointments/appointmentSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserMd, FaChild, FaSearch } from 'react-icons/fa';
import { hasAnyRole, isDoctor } from '../../utils/roles';

import DoctorAvailabilityWidget from '../../shifts/shift-assignments/DoctorAvailabilityWidget';

const AddAppointment = () => {
  const dispatch = useDispatch();
  const { children } = useSelector((state) => state.childManagement);
  const { doctors, loading, error } = useSelector((state) => state.appointment);
  const { childId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctor: '',
    child: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'PENDING'
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedChildName, setSelectedChildName] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChildren());
  
    if (isDoctor(user)) {
      console.log('Not fetching doctors since the doctor is logged in');
    } else if (hasAnyRole(user, ['parent', 'nurse', 'pharmacist', 'admin'])) {
      dispatch(fetchDoctors());
    }
  }, [dispatch, user]);
  
  const selectedChild = childId 
    ? children.find((child) => String(child.id) === String(childId))
    : null;

  useEffect(() => {
    if (childId) {
      setFormData(prev => ({
        ...prev,
        child: childId
      }));
      // Set the selected child name for display
      if (selectedChild) {
        setSelectedChildName(selectedChild.full_name || `${selectedChild.first_name} ${selectedChild.last_name}`);
      }
    }
  }, [childId, selectedChild]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
    
    if (query.trim().length > 0) {
      dispatch(searchChildren(query));
    } else {
      dispatch(fetchChildren());
    }
  };

  // Handle child selection from dropdown
  const handleChildSelect = (child) => {
    setFormData(prev => ({
      ...prev,
      child: child.id
    }));
    setSelectedChildName(child.full_name || `${child.first_name} ${child.last_name}`);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Clear child selection
  const handleClearChild = () => {
    setFormData(prev => ({
      ...prev,
      child: ''
    }));
    setSelectedChildName('');
    setSearchQuery('');
    setShowDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createAppointment(formData));
    navigate('/appointments')
  };

  // Handle time selection from availability widget
  const handleTimeSelect = (time, day) => {
    // Convert day to date format if needed
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Simple logic: if selected day is today or later this week, use this week
    // Otherwise, assume next week (this is simplified - you may want more sophisticated date handling)
    let targetDate = new Date();
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = daysOfWeek.indexOf(currentDay);
    const selectedDayIndex = daysOfWeek.indexOf(day);
    
    let daysToAdd = selectedDayIndex - currentDayIndex;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Next week
    }
    
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    
    setFormData(prev => ({
      ...prev,
      appointment_date: targetDate.toISOString().split('T')[0],
      appointment_time: time
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 flex items-center">
          <FaCalendarAlt className="mr-3 text-blue-600" size={24} />
          {selectedChild
            ? `Schedule Appointment for ${selectedChild.first_name} ${selectedChild.last_name}`
            : 'Add New Appointment'}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4" ref={dropdownRef}>
            <label htmlFor="child" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Child
            </label>
            
            {!childId ? (
              <div className="relative">
                {selectedChildName ? (
                  // Show selected child with option to change
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <FaChild className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <div className="w-full pl-10 pr-20 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                        {selectedChildName}
                      </div>
                      <button
                        type="button"
                        onClick={handleClearChild}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show search input
                  <>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for a child..."
                        className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowDropdown(true)}
                      />
                    </div>
                    
                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {children.length > 0 ? (
                          children.map((child) => (
                            <div
                              key={child.id}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                              onClick={() => handleChildSelect(child)}
                            >
                              <div className="flex items-center">
                                <FaChild className="mr-2 text-blue-500" />
                                <div>
                                  <div className="font-medium">
                                    {child.full_name || `${child.first_name} ${child.last_name}`}
                                  </div>
                                  {child.date_of_birth && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      DOB: {new Date(child.date_of_birth).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'No children found' : 'Start typing to search...'}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // When childId is provided via URL params
              <div className="relative">
                <FaChild className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  value={selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : ''}
                  disabled
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="reason" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
            <textarea
              name="reason"
              id="reason"
              rows="3"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.reason}
              onChange={handleChange}
            ></textarea>
          </div>

          {hasAnyRole(user, ['nurse', 'admin', 'pharmacist', 'parent']) && (
            <div className="mb-4">
              <label htmlFor="doctor" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
              <div className="relative">
                <FaUserMd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  name="doctor"
                  id="doctor"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name || `${doc.first_name} ${doc.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                {/* Doctor Availability Widget */}
                <DoctorAvailabilityWidget 
                  selectedDoctorId={formData.doctor}
                  onTimeSelect={handleTimeSelect}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="appointment_date" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="date"
                name="appointment_date"
                id="appointment_date"
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.appointment_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="appointment_time" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <div className="relative">
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="time"
                name="appointment_time"
                id="appointment_time"
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !formData.child}
          >
            {loading ? 'Saving...' : 'Add Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAppointment;