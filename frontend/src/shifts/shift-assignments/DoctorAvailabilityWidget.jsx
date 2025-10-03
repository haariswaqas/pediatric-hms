import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorAssignments } from '../../store/shifts/doctorShiftAssignmentSlice';
import { FaClock, FaCalendarDay, FaUserMd, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { isDoctor } from '../../utils/roles';

const DoctorAvailabilityWidget = ({ selectedDoctorId, onTimeSelect }) => {
  const dispatch = useDispatch();
  const { items: doctorAssignments = [], loading } = useSelector(state => state.doctorShiftAssignment);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDoctorAssignments());
  }, [dispatch]);

  // Get availability for selected doctor
  const selectedDoctorAvailability = doctorAssignments.find(
    doctorShiftAssignment => doctorShiftAssignment.doctor_details.doctor_id === parseInt(selectedDoctorId)
  );

  // Get unique days for the selected doctor
  const availableDays = selectedDoctorAvailability?.shift_details?.map(shift => shift.day) || [];
  const uniqueDays = [...new Set(availableDays)].sort();

  // Get shifts for selected day
  const shiftsForSelectedDay = selectedDoctorAvailability?.shift_details?.filter(
    shift => shift.day === selectedDay
  ) || [];

  // Format time display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate time slots for a shift
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    
    // Generate 30-minute slots
    while (start < end) {
      const timeStr = start.toTimeString().slice(0, 5);
      slots.push(timeStr);
      start.setMinutes(start.getMinutes() + 30);
    }
    
    return slots;
  };

  const handleTimeClick = (time, day) => {
    if (onTimeSelect) {
      onTimeSelect(time, day);
    }
  };

  if (!selectedDoctorId) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <FaUserMd className="mr-2" />
          <span className="text-sm font-medium">Select a doctor to view available times</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading availability...</span>
        </div>
      </div>
    );
  }

  if (!selectedDoctorAvailability) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
          <FaClock className="mr-2" />
          <span className="text-sm font-medium">No availability found for selected doctor</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaCalendarDay className="text-green-600 dark:text-green-400 mr-2" />
          <span className="font-medium text-green-800 dark:text-green-200">
            Doctor Availability
          </span>
          <span className="ml-2 text-sm text-green-600 dark:text-green-400">
            ({uniqueDays.length} days available)
          </span>
        </div>
        {isExpanded ? (
          <FaChevronUp className="text-green-600 dark:text-green-400" />
        ) : (
          <FaChevronDown className="text-green-600 dark:text-green-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Day selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Days
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueDays.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(selectedDay === day ? '' : day)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots for selected day */}
          {selectedDay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Times for {selectedDay}
              </label>
              <div className="space-y-2">
                {shiftsForSelectedDay.map((shift, index) => {
                  const timeSlots = generateTimeSlots(shift.start_time, shift.end_time);
                  return (
                    <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                          {shift.shift_type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => handleTimeClick(time, selectedDay)}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            {formatTime(time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedDay && uniqueDays.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a day above to view available time slots
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityWidget;