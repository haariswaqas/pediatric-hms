import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createLabRequest } from '../../store/lab/labRequestSlice';
import { fetchChildren } from '../../store/children/childManagementSlice';
import { fetchDiagnoses } from '../../store/diagnosis/diagnosisSlice';
import {
  Users,
  TestTube,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  Droplets,
  Info,
  DollarSign,
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react';

export default function AddLabRequest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { childId, diagnosisId } = useParams();

  const { loading, error } = useSelector((s) => s.labRequest);
  const { children } = useSelector((s) => s.childManagement);
  const { diagnoses } = useSelector((s) => s.diagnosis);

  const [formData, setFormData] = useState({
    child: '',
    diagnosis: '',
    status: 'ORDERED',
    priority: 'ROUTINE',
    scheduled_date: '',
    clinical_notes: '',
    special_instructions: '',
    is_fasting: false,
    is_billable: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  // Prefill child
  useEffect(() => {
    if (childId && children.length) {
      setFormData(fd => ({ ...fd, child: childId }));
    }
  }, [childId, children]);

  // Prefill diagnosis
  useEffect(() => {
    if (diagnosisId && diagnoses.length) {
      setFormData(fd => ({ ...fd, diagnosis: diagnosisId }));
    }
  }, [diagnosisId, diagnoses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(errs => ({ ...errs, [name]: null, form: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Convert datetime-local string to ISO format for backend if date is provided
      if (submitData.scheduled_date) {
        submitData.scheduled_date = new Date(submitData.scheduled_date).toISOString();
      }

      const resultAction = await dispatch(createLabRequest(submitData));
      
      if (createLabRequest.fulfilled.match(resultAction)) {
        toast.success('Lab request created successfully!', { 
          position: 'bottom-right', 
          autoClose: 3000 
        });
        navigate(`/labs/add-lab-request-item/${resultAction.payload.id}`);
      } else {
        // Handle rejected case
        const errorMessage = resultAction.payload?.message || 
                           resultAction.error?.message || 
                           'Failed to create lab request.';
        setErrors({ form: errorMessage });
        toast.error(errorMessage, { position: 'bottom-right' });
      }
    } catch (error) {
      console.error('Error creating lab request:', error);
      const errorMessage = 'An error occurred while creating lab request.';
      setErrors({ form: errorMessage });
      toast.error(errorMessage, { position: 'bottom-right' });
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
            onClick={() => navigate('/lab-requests')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lab Requests
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TestTube className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                New Lab Request
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                Create a new laboratory test request
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Error Alert */}
          {errors.form && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.form}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Child */}
            <div className="space-y-2">
              <label htmlFor="child" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4" />
                <span>Patient</span>
              </label>
              <select
                id="child"
                name="child"
                value={formData.child}
                onChange={handleChange}
                required
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="" disabled>Choose a patient</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <label htmlFor="diagnosis" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Stethoscope className="w-4 h-4" />
                <span>Diagnosis</span>
              </label>
              <select
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <option value="" disabled>Select diagnosis</option>
                {diagnoses.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>Status</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="ORDERED">Ordered</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COLLECTED">Collected</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label htmlFor="priority" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <DollarSign className="w-4 h-4" />
                  <span>Priority</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT</option>
                </select>
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <label htmlFor="scheduled_date" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Scheduled Date</span>
              </label>
              <input
                type="datetime-local"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="clinical_notes" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Info className="w-4 h-4" />
                <span>Clinical Notes</span>
              </label>
              <textarea
                id="clinical_notes"
                name="clinical_notes"
                rows={3}
                value={formData.clinical_notes}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 resize-none"
                placeholder="Enter relevant clinical information..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="special_instructions" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4" />
                <span>Special Instructions</span>
              </label>
              <textarea
                id="special_instructions"
                name="special_instructions"
                rows={3}
                value={formData.special_instructions}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 resize-none"
                placeholder="Any special handling instructions..."
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <input
                  type="checkbox"
                  name="is_fasting"
                  checked={formData.is_fasting}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Fasting</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <input
                  type="checkbox"
                  name="is_billable"
                  checked={formData.is_billable}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-green-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Requesting...' : 'Create Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}