import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, autoCompleteAll } from '../../store/appointments/appointmentSlice';
import { useNavigate } from 'react-router-dom';
import AppointmentSearch from './AppointmentSearch';
import AppointmentCard from './components/AppointmentCard';
import AppointmentStats from './components/AppointmentStats';
import AppointmentFilters from './components/AppointmentFilters';
import AppointmentCharts from './components/AppointmentCharts';
import PageHeader from './components/PageHeader';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';


const AppointmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading, error } = useSelector((state) => state.appointment);
  const [filteredAppointments, setFilteredAppointments] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showStats, setShowStats] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAppointments())
    
    
  }, [dispatch]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    
    if (status === 'ALL') {
      setFilteredAppointments(null);
      return;
    }

    
    
    const filtered = appointments.filter(appt => appt.status === status);
    setFilteredAppointments(filtered);
  };

  const displayAppointments = filteredAppointments || appointments;
  
  // Group appointments by status for stats
  const stats = {
    TOTAL: appointments?.length || 0,
    CONFIRMED: appointments?.filter(a => a.status === 'CONFIRMED').length || 0,
    PENDING: appointments?.filter(a => a.status === 'PENDING').length || 0,
    CANCELLED: appointments?.filter(a => a.status === 'CANCELLED').length || 0,
    COMPLETED: appointments?.filter(a => a.status === 'COMPLETED').length || 0
  };

  if (loading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  // do nothing

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Appointments"
          subtitle="Manage your scheduled appointments"
          user={user}
        />
        
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 dark:text-white">
                <AppointmentSearch onSearchResults={setFilteredAppointments} />
                <AppointmentFilters 
                  activeFilter={filterStatus} 
                  onFilterChange={handleFilterChange}
                  stats={stats}
                />
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {showStats ? 'Hide' : 'Show'} Analytics Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${showStats ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            
              {showStats && (
                <>
                  <AppointmentStats stats={stats} />
                  <div className="mt-6">
                    <AppointmentCharts appointments={appointments} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {filterStatus === 'ALL' ? 'All Appointments' : `${filterStatus} Appointments`}
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm font-normal">
              {`(${displayAppointments.length} ${displayAppointments.length === 1 ? 'item' : 'items'})`}
            </span>
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                isAdmin={user && user.role === 'admin'}
                navigate={navigate}
              />
              
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;