import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { confirmAppointment, cancelAppointment, deleteAppointment } from '../../../store/appointments/appointmentSlice';
import ConfirmationModal from './ConfirmationModal';
import { isParent } from '../../../utils/roles';
import { Trash } from 'lucide-react';
const AppointmentActions = ({ appointmentId, status, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    confirmAction: null,
    variant: 'primary'
  });

  const handleConfirm = () => {
    setModalConfig({
      title: 'Confirm Appointment',
      message:
        'The parent of the child will be notified once you perform this action. Are you sure you want to confirm the appointment?',
      confirmText: 'Confirm Appointment',
      confirmAction: () => {
        dispatch(confirmAppointment(appointmentId)).then(() => {
          navigate('/appointments');
        });
        setShowConfirmModal(false);
        
      },
      variant: 'success'
    });
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    setModalConfig({
      title: 'Cancel Appointment',
      message:
        'Are you sure you want to cancel this appointment? This action cannot be undone and will notify all parties involved.',
      confirmText: 'Cancel Appointment',
      confirmAction: () => {
        dispatch(cancelAppointment(appointmentId)).then(() => {
          navigate('/appointments');
        });
        
        setShowConfirmModal(false);
      },
      variant: 'danger'
    });
    setShowConfirmModal(true);
  };

  const handleDelete = () => {
    setModalConfig({
      title: 'Delete Appointment',
      message:
        'Are you sure you want to delete this appointment?',
      confirmText: 'Delete Appointment',
      confirmAction: () => {
        dispatch(deleteAppointment(appointmentId));
        setShowConfirmModal(false);
      },
      variant: 'danger'
    });
    setShowConfirmModal(true);
  };

  // Debug the status value
  console.log("Current appointment status:", status);
  
  const isCancelled = status === 'CANCELLED';
  const isConfirmed = status === 'CONFIRMED';
  const isCompleted = status === 'COMPLETED';



  const shouldShowActionButtons = !isCancelled && !isConfirmed && !isCompleted
  const shouldShowDelete = isCancelled || isCompleted 
  

  return (
    <>
      <div className="border-t pt-6 mt-6 flex flex-wrap gap-4">
        {shouldShowActionButtons && (
          <>
            <button
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all duration-200 
                bg-green-600 hover:bg-green-700 text-white hover:shadow-md dark:bg-green-500 dark:hover:bg-green-600"
              onClick={handleConfirm}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Appointment
            </button>

            <button
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all duration-200 
                bg-red-600 hover:bg-red-700 text-white hover:shadow-md dark:bg-red-500 dark:hover:bg-red-600"
              onClick={handleCancel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Appointment
            </button>
          
          </>
        )}

        <button
          className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>
        {shouldShowDelete && (
  <button
    className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all duration-200 
      bg-red-600 hover:bg-red-700 text-white hover:shadow-md dark:bg-red-500 dark:hover:bg-red-600"
    onClick={handleDelete}
  >
    <Trash className="w-5 h-5" />
    Delete Appointment
  </button>
)}

      </div>

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.confirmAction}
        variant={modalConfig.variant}
      />
    </>
  );
};

export default AppointmentActions;