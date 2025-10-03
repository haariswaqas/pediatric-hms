import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChildren } from '../store/children/childManagementSlice';
import { fetchBeds } from '../store/admin/bedSlice';
import { fetchDiagnoses } from '../store/diagnosis/diagnosisSlice';
import { fetchAdmissionById, updateAdmission } from '../store/admissions/admissionSlice';

export default function EditAdmission() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admissionId } = useParams();

  const { selectedAdmission: admission, loading, error } = useSelector((s) => s.admission);
  const { children } = useSelector((s) => s.childManagement);
  const { beds } = useSelector((s) => s.bed);
  const { diagnoses } = useSelector((s) => s.diagnosis);

  const [formData, setFormData] = useState({
    child: '',
    bed: '',
    diagnosis: '',
    admission_reason: '',
    initial_diagnosis: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchBeds());
    dispatch(fetchDiagnoses());
    dispatch(fetchAdmissionById(admissionId));
  }, [dispatch, admissionId]);

  useEffect(() => {
    if (admission) {
      setFormData({
        child: String(admission.child || ''),
        bed: String(admission.bed_details?.id || admission.bed || ''),
        diagnosis: String(admission.diagnosis || ''),
        admission_reason: admission.admission_reason || '',
        initial_diagnosis: admission.initial_diagnosis || ''
      });
    }
  }, [admission, beds, children, diagnoses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: null, form: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(updateAdmission({ admissionId, updatedData: formData })).then((res) => {
      if (!res.error) {
        navigate('/admissions');
      } else {
        const payload = res.error.payload || {};
        if (payload.bed) {
          setErrors(errs => ({
            ...errs,
            bed: Array.isArray(payload.bed) ? payload.bed[0] : payload.bed
          }));
        } else if (payload.detail) {
          setErrors(errs => ({ ...errs, form: payload.detail }));
        } else {
          setErrors(errs => ({ ...errs, form: 'An unexpected error occurred.' }));
        }
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
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Admission</h1>

      {errors.form && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child */}
        <div>
          <label htmlFor="child" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Child
          </label>
          <select
            id="child"
            name="child"
            value={formData.child}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a child</option>
            {children.map(c => (
              <option key={c.id} value={String(c.id)}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Bed */}
        <div>
          <label htmlFor="bed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bed
          </label>
          <select
            id="bed"
            name="bed"
            value={formData.bed}
            onChange={handleChange}
            required
            className={`mt-1 block w-full p-2 border 
                       ${errors.bed ? 'border-red-500' : 'border-gray-300'} 
                       dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select a bed</option>
            {beds.map(b => (
              <option key={b.id} value={String(b.id)}>
                {b.ward_name} - Bed {b.bed_number}
              </option>
            ))}
          </select>
          {errors.bed && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bed}</p>
          )}
        </div>

        {/* Diagnosis */}
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Diagnosis
          </label>
          <select
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a diagnosis</option>
            {diagnoses.map(d => (
              <option key={d.id} value={String(d.id)}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        {/* Admission Reason */}
        <div>
          <label htmlFor="admission_reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Admission Reason
          </label>
          <textarea
            id="admission_reason"
            name="admission_reason"
            value={formData.admission_reason}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Initial Diagnosis */}
        <div>
          <label htmlFor="initial_diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Initial Diagnosis
          </label>
          <textarea
            id="initial_diagnosis"
            name="initial_diagnosis"
            value={formData.initial_diagnosis}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
