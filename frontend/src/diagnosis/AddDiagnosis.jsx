import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {createDiagnosis} from '../store/diagnosis/diagnosisSlice';
import { fetchChildren } from '../store/children/childManagementSlice';
import { fetchAppointments } from '../store/appointments/appointmentSlice';
import { FaCalendarAlt } from 'react-icons/fa';

export default function AddDiagnosis() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { childId } = useParams();
  const { children, loading, error } = useSelector((s) => s.childManagement);
  const { appointments } = useSelector((s) => s.appointment);

  const [formData, setFormData] = useState({
    child: '',
    appointment: '',
    category: '',
    title: '',
    description: '',
    status: 'ACTIVE',
    severity: '',
    onset_date: new Date().toISOString().split('T')[0],
    is_chronic: false,
    is_congenital: false,
    clinical_findings: '',
    notes: '',
  });

  const [newDiagId, setNewDiagId] = useState(null);
  const [showNextModal, setShowNextModal] = useState(false);

  // Pre‐fill child if routed in
  useEffect(() => {
    if (childId) setFormData((f) => ({ ...f, child: childId }));
  }, [childId]);

  // Load children & appointments
  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      
    };
    dispatch(createDiagnosis(payload)).then((res) => {
      if (!res.error) {
        setNewDiagId(res.payload.id);
        setShowNextModal(true);
      }
    });
  };
  const filteredAppointments = appointments.filter(
    (appt) => String(appt.child_details?.id) === String(formData.child)
  );

  const goAddPrescription = () => navigate(`/prescriptions/add/diagnosis/${newDiagId}`);
  const goAddTreatment   = () => navigate(`/diagnosis/treatments/add/${newDiagId}`);
 const goAdmit = () => navigate(`/admissions/add/${newDiagId}`);
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-md mt-10">
      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 flex items-center">
        <FaCalendarAlt className="mr-3 text-blue-600 dark:text-blue-400" size={24} />
        {childId
          ? `Diagnose ${children.find(c => String(c.id) === childId)?.first_name || ''}`
          : 'Add New Diagnosis'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Patient</label>
          <select
            name="child"
            value={formData.child}
            onChange={handleChange}
            disabled={!!childId}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select child</option>
            {children.map(({ id, first_name, last_name }) => (
              <option key={id} value={id}>
                {first_name} {last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Appointment</label>
          <select
            name="appointment"
            value={formData.appointment}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select appointment</option>
            {filteredAppointments.map(({ id, appointment_date, appointment_time, child_details }) => (
              <option key={id} value={id}>
                {appointment_date} {appointment_time} - {child_details?.first_name} {child_details?.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Diagnosis Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Category</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CHRONIC">Chronic</option>
            <option value="RECURRENT">Recurrent</option>
            <option value="PROVISIONAL">Provisional</option>
            <option value="RULE_OUT">Rule Out</option>
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Severity</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select severity</option>
            <option value="MILD">Mild</option>
            <option value="MODERATE">Moderate</option>
            <option value="SEVERE">Severe</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Onset Date */}
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Onset Date</label>
          <input
            type="date"
            name="onset_date"
            value={formData.onset_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Flags */}
        <div className="grid md:grid-cols-2 gap-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_chronic"
              checked={formData.is_chronic}
              onChange={handleChange}
              className="rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-200">Chronic Condition</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_congenital"
              checked={formData.is_congenital}
              onChange={handleChange}
              className="rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-200">Congenital Condition</span>
          </label>
        </div>

        {/* Text areas */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Clinical Findings</label>
            <textarea
              name="clinical_findings"
              rows="3"
              value={formData.clinical_findings}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Additional Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            {loading ? 'Saving…' : 'Save Diagnosis'}
          </button>
        </div>
      </form>

      {showNextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-11/12 max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Diagnosis Created!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              What would you like to do next?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={goAddPrescription}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
              >
                📝 Add Prescription
              </button>
              <button
                onClick={goAddTreatment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
              >
                💉 Add Treatment
              </button>
              <button
                onClick={goAdmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
              >
                🏥 Admit Patient
              </button>
            </div>
            <button
              onClick={() => setShowNextModal(false)}
              className="mt-4 block mx-auto text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
