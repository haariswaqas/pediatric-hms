import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate,Link } from 'react-router-dom';
import { fetchAppointmentById } from '../../store/appointments/appointmentSlice';
import AppointmentStatusBadge from './components/AppointmentStatusBadge';
import AppointmentActions from './components/AppointmentActions';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import { formatDateTime, formatTime, formatNewDate as formatDate } from './components/utils/dateUtils';

const AppointmentDetail = () => {
  const { appointmentId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedAppointment, loading, error } = useSelector((state) => state.appointment);

  useEffect(() => {
    dispatch(fetchAppointmentById(appointmentId));
    console.log("appointment payload:", selectedAppointment);

  }, [dispatch, appointmentId]);

  if (loading || !selectedAppointment) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

 
  // Get formatted values
  const formattedTime = formatTime(selectedAppointment.appointment_time);
  const formattedDate = formatDate(selectedAppointment.appointment_date);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 px-6 py-5">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Appointment Details</h2>
            <AppointmentStatusBadge status={selectedAppointment.status} />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
              <DetailBlock label="Doctor" value={`Dr. ${selectedAppointment.doctor_details.first_name} ${selectedAppointment.doctor_details.last_name}`} />
              
              <DetailBlock label="Child" value={<Link to={`/children/child/${selectedAppointment.child_details?.id}`}>{selectedAppointment.child_details?.first_name} {selectedAppointment.child_details?.last_name}</Link>} />
              <DetailBlock label="Age" value={`${selectedAppointment.child_details.age} years`} />
              <DetailBlock label="Parent / Guardian" value={`${selectedAppointment.child_details.primary_guardian_first_name} ${selectedAppointment.child_details.primary_guardian_last_name}`} />
              <div className="grid md:grid-cols-2 gap-4">
                <DateTimeBlock label="Created on" dateTime={selectedAppointment.created_at} formatter={formatDateTime} />
                <DateTimeBlock label="Last updated" dateTime={selectedAppointment.updated_at} formatter={formatDateTime} />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <DetailBlock label="Date" value={formattedDate} />
              <DetailBlock label="Time" value={formattedTime} />
              <DetailBlock label="Reason for Visit" value={selectedAppointment.reason} longText />
            </div>
          </div>

          <div className="pt-10">
            <AppointmentActions 
              appointmentId={appointmentId}
              status={selectedAppointment.status}
              onBack={() => navigate(-1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBlock = ({ label, value, longText = false }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
    <p className={`mt-1 ${longText ? 'text-base text-gray-700 dark:text-gray-200' : 'text-lg font-semibold text-gray-900 dark:text-white'}`}>
      {value}
    </p>
  </div>
);

const DateTimeBlock = ({ label, dateTime, formatter }) => {
  const formattedValue = formatter(dateTime);
  
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
      <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded">
        {formattedValue}
      </p>
    </div>
  );
};

export default AppointmentDetail;