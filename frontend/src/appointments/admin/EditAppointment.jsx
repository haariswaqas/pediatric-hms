// src/appointments/admin/EditAppointment.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAppointmentById,
  updateAppointment,
  fetchDoctors,
  fetchChildren,
} from '../../store/appointments/appointmentSlice';
import { FaPencilAlt } from 'react-icons/fa';
import { isDoctor } from '../../utils/roles';

const EditAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth);
  const { appointmentId } = useParams();


  const { selectedAppointment: appointment, loading, error, doctors, children } =
    useSelector((state) => state.appointment);

  const [formData, setFormData] = useState({
    doctor: '',
    child: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });

  useEffect(() => {
    dispatch(fetchAppointmentById(appointmentId));
    if (!isDoctor(user)) {
      dispatch(fetchDoctors());
    }
    dispatch(fetchChildren());
  }, [dispatch, appointmentId, user]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        doctor: String(appointment.doctor),
        child: String(appointment.child),
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        reason: appointment.reason || '',
      });
    }
  }, [appointment, doctors, children]);

  useEffect(() => {
    if (isDoctor(user)) {
      setFormData((prev) => ({ ...prev, doctor: user.id }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateAppointment({ appointmentId, updatedData: formData }))
      .then(() => navigate('/appointments'));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <FaPencilAlt className="text-3xl text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Appointment</h2>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg p-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
           {/* Doctor */}
{!isDoctor(user) && (
  <div className="mb-6">
    <label htmlFor="doctor" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <strong>Doctor</strong>
    </label>
    <select
      name="doctor"
      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={formData.doctor}
      onChange={handleChange}
      required
    >
      <option value="">-- Select Doctor --</option>
      {doctors.map((doc) => (
        <option key={doc.id} value={String(doc.id)}>
          {doc.full_name || `${doc.first_name} ${doc.last_name}`}
        </option>
      ))}
    </select>
  </div>
)}

{/* Hidden doctor field for doctors */}
{isDoctor(user) && (
  <input type="hidden" name="doctor" value={user.id} />
)}

            {/* Child */}
            <div className="mb-6">
              <label htmlFor="child" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <strong>Child</strong>
              </label>
              <select
                name="child"
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.child}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Child --</option>
                {children.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.full_name || `${c.first_name} ${c.last_name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div className="mb-6">
              <label htmlFor="appointment_date" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <strong>Appointment Date</strong>
              </label>
              <input
                type="date"
                name="appointment_date"
                id="appointment_date"
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.appointment_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Appointment Time */}
            <div className="mb-6">
              <label htmlFor="appointment_time" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <strong>Appointment Time</strong>
              </label>
              <input
                type="time"
                name="appointment_time"
                id="appointment_time"
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              />
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label htmlFor="reason" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <strong>Reason</strong>
              </label>
              <textarea
                name="reason"
                id="reason"
                rows="4"
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-6">
              <button
                type="submit"
                className="w-full py-3 px-6 text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Update Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAppointment;
