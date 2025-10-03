// src/admissions/AddAdmission.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAdmission } from '../store/admissions/admissionSlice';
import { fetchChildren } from '../store/children/childManagementSlice';
import { fetchBeds } from '../store/admin/bedSlice';
import { fetchDiagnoses } from '../store/diagnosis/diagnosisSlice';
import { 
  UserPlus, 
  Bed, 
  Stethoscope, 
  FileText, 
  ClipboardList, 
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export default function AddAdmission() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { childId } = useParams();
  const { diagnosisId } = useParams();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchBeds());
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  // Handle childId from URL params
  useEffect(() => {
    if (childId && children.length > 0) {
      setFormData(fd => ({ ...fd, child: childId }));
    }
  }, [childId, children]);

  // If diagnosisId in URL, prefill both diagnosis & child
  useEffect(() => {
    if (diagnosisId && diagnoses.length > 0) {
      const sel = diagnoses.find(d => String(d.id) === String(diagnosisId));
      if (sel) {
        setFormData(fd => ({
          ...fd,
          diagnosis: diagnosisId,
          child: sel.admisison_details?.child_id || ""
        }));
      }
    }
  }, [diagnosisId, diagnoses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: null, form: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
  
    try {
      // Await the thunk and unwrap its payload
      await dispatch(createAdmission(formData)).unwrap();
  
      toast.success('Admission created successfully!', {
        position: 'bottom-right',
        autoClose: 3000,
      });
  
      navigate('/admissions');
    } catch (error) {
      // `error` is the rejected value
      toast.error(
        error?.message || 'Failed to create admission.',
        { position: 'bottom-right' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admissions')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admissions
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                {(() => {
                  const selectedChild = children.find(c => String(c.id) === String(formData.child));
                  return selectedChild
                    ? `Admit ${selectedChild.first_name} ${selectedChild.last_name}`
                    : 'New Admission';
                })()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                Add a new patient admission record
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Form Error Alert */}
          {errors.form && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.form}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label htmlFor="child" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <UserPlus className="w-4 h-4" />
                <span>Patient</span>
              </label>
              <select
                id="child"
                name="child"
                value={formData.child}
                onChange={handleChange}
                disabled={!!childId || !!diagnosisId}
                required
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Choose a patient</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>

            {/* Bed Assignment */}
            <div className="space-y-2">
              <label htmlFor="bed" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Bed className="w-4 h-4" />
                <span>Bed Assignment</span>
              </label>
              <select
                id="bed"
                name="bed"
                value={formData.bed}
                onChange={handleChange}
                required
                className={`w-full p-4 border ${errors.bed ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              >
                <option value="" disabled>Select available bed</option>
                {beds.map(b => (
                  <option key={b.id} value={b.id}>{b.ward_name} - Bed {b.bed_number}</option>
                ))}
              </select>
              {errors.bed && (
                <div className="flex items-center space-x-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.bed}</p>
                </div>
              )}
            </div>

            {/* Diagnosis Selection */}
            <div className="space-y-2">
              <label htmlFor="diagnosis" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Stethoscope className="w-4 h-4" />
                <span>Primary Diagnosis</span>
              </label>
              <select
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                disabled={!!diagnosisId}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select diagnosis</option>
                {diagnoses.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            {/* Text Areas Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Admission Reason */}
              <div className="space-y-2">
                <label htmlFor="admission_reason" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4" />
                  <span>Admission Reason</span>
                </label>
                <textarea
                  id="admission_reason"
                  name="admission_reason"
                  value={formData.admission_reason}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the reason for admission..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Initial Diagnosis */}
              <div className="space-y-2">
                <label htmlFor="initial_diagnosis" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <ClipboardList className="w-4 h-4" />
                  <span>Initial Assessment</span>
                </label>
                <textarea
                  id="initial_diagnosis"
                  name="initial_diagnosis"
                  value={formData.initial_diagnosis}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Initial diagnosis and assessment notes..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Creating Admission...' : 'Create Admission'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}