import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchDiagnosisById as fetchDiagnosis,
  updateDiagnosis
} from '../store/diagnosis/diagnosisSlice';
import { fetchChildren } from '../store/children/childManagementSlice';
import { fetchAppointments } from '../store/appointments/appointmentSlice';

const EditDiagnosis = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { diagnosisId } = useParams();

  const { selectedDiagnosis: diagnosis, loading, error } = useSelector((state) => state.diagnosis);
  const { children } = useSelector((state) => state.childManagement);
  const { appointments } = useSelector((state) => state.appointment);

  const [formData, setFormData] = useState({
    child: '',
    appointment: '',
    category: '',
    icd_code: '',
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

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchChildren());
    dispatch(fetchDiagnosis(diagnosisId));
  }, [dispatch, diagnosisId]);

  useEffect(() => {
    if (diagnosis) {
      setFormData({
       
        ...diagnosis,
        child: diagnosis.child ?? '',
        appointment: diagnosis.appointment ?? '',
        onset_date: new Date(diagnosis.onset_date).toISOString().split('T')[0]
      });
    }
  }, [diagnosis]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a copy of the data to be sent to the API
    const payload = {
      ...formData,
      // Ensure both child and title are included
      child: formData.child || '',
      title: formData.title || '',
      date_diagnosed: new Date(formData.date_diagnosed || new Date()).toISOString()
    };
    
    // Log the payload to verify it contains required fields
    console.log("Submitting diagnosis update with payload:", payload);
    
    dispatch(updateDiagnosis({ diagnosisId, updatedData: payload })).then((res) => {
      if (!res.error) {
        navigate('/diagnosis');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">
        Edit Diagnosis
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Child Select */}
        <div>
          <label htmlFor="child" className="block mb-1 text-gray-700 dark:text-gray-200">Patient</label>
          <select
            id="child"
            name="child"
            value={formData.child ?? ''}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select child</option>
            {children?.map(({ id, first_name, last_name }) => (
              <option key={id} value={id}>{first_name} {last_name}</option>
            ))}
          </select>
        </div>

        {/* Appointment Select */}
        <div>
          <label htmlFor="appointment" className="block mb-1 text-gray-700 dark:text-gray-200">Appointment</label>
          <select
            id="appointment"
            name="appointment"
            value={formData.appointment ?? ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select appointment</option>
            {appointments?.map(({ id, date, time }) => (
              <option key={id} value={id}>{date} {time}</option>
            ))}
          </select>
        </div>

        {/* Diagnosis Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block mb-1 text-gray-700 dark:text-gray-200">Diagnosis Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="category" className="block mb-1 text-gray-700 dark:text-gray-200">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="icd_code" className="block mb-1 text-gray-700 dark:text-gray-200">ICD-10 Code</label>
            <input
              type="text"
              id="icd_code"
              name="icd_code"
              value={formData.icd_code}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="status" className="block mb-1 text-gray-700 dark:text-gray-200">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
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

          <div>
            <label htmlFor="severity" className="block mb-1 text-gray-700 dark:text-gray-200">Severity</label>
            <select
              id="severity"
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

          <div>
            <label htmlFor="onset_date" className="block mb-1 text-gray-700 dark:text-gray-200">Onset Date</label>
            <input
              type="date"
              id="onset_date"
              name="onset_date"
              value={formData.onset_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Boolean Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_chronic"
                name="is_chronic"
                checked={formData.is_chronic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_chronic: e.target.checked
                }))}
                className="rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-200">Chronic Condition</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_congenital"
                name="is_congenital"
                checked={formData.is_congenital}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_congenital: e.target.checked
                }))}
                className="rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <span className="text-gray-700 dark:text-gray-200">Congenital Condition</span>
            </label>
          </div>
        </div>

        {/* Text Areas */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="description" className="block mb-1 text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="clinical_findings" className="block mb-1 text-gray-700 dark:text-gray-200">Clinical Findings</label>
            <textarea
              id="clinical_findings"
              name="clinical_findings"
              value={formData.clinical_findings}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            ></textarea>
          </div>

          <div>
            <label htmlFor="notes" className="block mb-1 text-gray-700 dark:text-gray-200">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Update Diagnosis
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDiagnosis;