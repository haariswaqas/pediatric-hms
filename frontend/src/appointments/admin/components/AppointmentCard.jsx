import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAppointment } from '../../../store/appointments/appointmentSlice';
import { formatDate, formatTime } from './utils/dateUtils';
import { isDoctor } from '../../../utils/roles';


const AppointmentCard = ({ appointment, isAdmin,  navigate }) => {
  const dispatch = useDispatch();
  const { id, status, parent_details, doctor_details, child_details, appointment_date, appointment_time, reason } = appointment;
const { user } = useSelector((state) => state.auth);
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      dispatch(deleteAppointment(id));
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/appointments/edit/${id}`);
  };

  const handleView = (e) => {
    navigate(`/appointments/${id}`);
  };

  // Status colors
  const statusColors = {
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800',
    COMPLETED: 'bg-blue-100 text-black dark:bg-blue-500 dark:text-gray border-green-300 dark:border-green-800'
  };

  return (
    <div
      onClick={handleView}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-700/30 transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
    >
      {/* Status Bar */}
      <div className={`w-full h-2 ${statusColors[status].split(' ')[0]}`}></div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {id}
            </h3>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-500 dark:text-gray-400">Parent:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {parent_details ? `${parent_details.first_name} ${parent_details.last_name}` : '—'}
            </span>
          </div>
          
          <div className="flex items-start">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-500 dark:text-gray-400">Doctor:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {doctor_details.first_name} {doctor_details.last_name}
            </span>
          </div>
          
          <div className="flex items-start">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-500 dark:text-gray-400">Child:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {child_details.first_name} {child_details.last_name} ({child_details.age} yrs)
            </span>
          </div>
          
          <div className="flex items-start">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-500 dark:text-gray-400">When:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(appointment_date)} at {formatTime(appointment_time)}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reason for Visit</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{reason}</p>
        </div>
        
        <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin || isDoctor(user) ? (
            <>
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              {status === 'PENDING' && (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;