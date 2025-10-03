// src/components/PageHeader.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../../../utils/roles';
import { fetchAppointments,
  generateAppointmentReport,
  autoCompleteAll,
} from '../../../store/appointments/appointmentSlice';
import { useDispatch } from 'react-redux';
import { CheckCircle, RefreshCw, Plus} from 'lucide-react';

const PageHeader = ({ title, subtitle, user }) => {
  const dispatch = useDispatch();
  const [toast, setToast] = useState(null);

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateReport = () => {
    dispatch(generateAppointmentReport())
      .unwrap()
      .then(() => showToast('Report generated successfully!', 'success'))
      .catch((err) => showToast(`Error: ${err.message}`, 'error'));
  };

  const handleAutoComplete = () => {
    dispatch(autoCompleteAll())
      .unwrap()
      .then(() => {
        showToast('All appointments auto‑completed!', 'success');
        
        // After completing, you might want to dispatch an action to reload the appointments data
        dispatch(fetchAppointments());  // Assuming you have a `fetchAppointments` action to fetch data
      })
      .catch((err) => {
        showToast(`Error: ${err.message}`, 'error');
      });
  };
  

  return (
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        <Link
          to="/appointments/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Appointment
        </Link>

        {isAdmin(user) && (
          <>
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Generate Report
            </button>

            <button
              onClick={handleAutoComplete}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Auto‑Complete All
            </button>
          </>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded-md shadow-lg text-white ${
            toast.variant === 'success'
              ? 'bg-green-500 dark:bg-green-600'
              : 'bg-red-500 dark:bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
