import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAdmissionVital } from '../../store/admissions/admissionVitalSlice';
import { fetchAdmissions } from '../../store/admissions/admissionSlice';
import ConfirmationModal from '../../utils/ConfirmationModal';
import { Heart, Thermometer, Activity, Droplets, User } from 'lucide-react';

export default function AddAdmissionVital() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admissionId } = useParams();
  const { admissions, loading } = useSelector((s) => s.admission);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    admission: '',
    temperature: '',
    heart_rate: '',
    systolic: '',
    diastolic: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    consciousness_level: '',
  
    head_circumference: '',
    capillary_refill: '',
    pain_score: '',
    glucose_level: '',
    hydration_status: '',
    notes: '',
  });

  useEffect(() => {
    if(admissionId) setFormData((fd) => ({ ...fd, admission: admissionId }));
  }, [admissionId]);

  useEffect(() => {
    dispatch(fetchAdmissions());
  }, [dispatch]);

  useEffect(() => {
    if (admissionId && admissions.length > 0) {
      setFormData((fd) => ({ ...fd, admission: admissionId }));
    }
  }, [admissionId, admissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };


  const sanitizeFormData = (data) => {
    const cleaned = { ...data };
    const optionalFields = [
      'head_circumference',
      'capillary_refill',
      'pain_score',
      'glucose_level',
      'hydration_status',
      'notes',
      'oxygen_saturation',
      'consciousness_level',
    ];
    optionalFields.forEach((key) => {
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    });
    return cleaned;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = sanitizeFormData(formData);
  
    dispatch(createAdmissionVital(cleanedData)).then((res) => {
      if (!res.error) {
        toast.success('Admission vital created successfully!', {
          position: 'bottom-right',
          autoClose: 3000,
        });
        navigate('/admissions/vital-histories');
      } else {
        toast.error('Failed to create admission.', { position: 'bottom-right' });
      }
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      
     
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="text-blue-600" size={28} />
          Add Admission Vitals
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Record vital signs and measurements for the patient
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admission Selection Section */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
            <User size={20} />
            Patient Admission
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="admission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Admission *
              </label>
              <select
                id="admission"
                name="admission"
                value={formData.admission}
                onChange={handleChange}
                required
                disabled={!!admissionId }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an admission</option>
                {admissions.map((admission) => (
                  <option key={admission.id} value={admission.id}>
                    {admission.child_details.first_name  + " " + admission.child_details.last_name || `Patient ID: ${admission.child_id}`} - 
                    Admission #{admission.id} 
                   
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Primary Vitals Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
            <Thermometer size={20} />
            Primary Vital Signs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Temperature (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="36.5"
              />
            </div>

            <div>
              <label htmlFor="heart_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heart Rate (bpm) *
              </label>
              <input
                type="number"
                id="heart_rate"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="80"
              />
            </div>

            <div>
              <label htmlFor="systolic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Systolic Pressure *
              </label>
              <input
                type="text"
                id="systolic"
                name="systolic"
                value={formData.systolic}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="120"
              />
            </div>

            <div>
              <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Diastolic Pressure *
              </label>
              <input
                type="text"
                id="diastolic"
                name="diastolic"
                value={formData.diastolic}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="80"
              />
            </div>

            <div>
              <label htmlFor="respiratory_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Respiratory Rate *
              </label>
              <input
                type="number"
                id="respiratory_rate"
                name="respiratory_rate"
                value={formData.respiratory_rate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20"
              />
            </div>

            <div>
              <label htmlFor="oxygen_saturation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Oxygen Saturation (%)
              </label>
              <input
                type="number"
                id="oxygen_saturation"
                name="oxygen_saturation"
                value={formData.oxygen_saturation}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98"
              />
            </div>

            <div>
              <label htmlFor="consciousness_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consciousness Level (AVPU)
              </label>
              <select
                id="consciousness_level"
                name="consciousness_level"
                value={formData.consciousness_level}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                <option value="Alert">Alert</option>
                <option value="Verbal">Verbal</option>
                <option value="Pain">Pain</option>
                <option value="Unresponsive">Unresponsive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Measurements Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
            <Heart size={20} />
            Additional Measurements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="head_circumference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Head Circumference (cm)
              </label>
              <input
                type="number"
                step="0.1"
                id="head_circumference"
                name="head_circumference"
                value={formData.head_circumference}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="35.0"
              />
            </div>

            <div>
              <label htmlFor="capillary_refill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capillary Refill (sec)
              </label>
              <input
                type="number"
                step="0.1"
                id="capillary_refill"
                name="capillary_refill"
                value={formData.capillary_refill}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2.0"
              />
            </div>

            <div>
              <label htmlFor="pain_score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pain Score (0-10)
              </label>
              <input
                type="number"
                id="pain_score"
                name="pain_score"
                value={formData.pain_score}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="glucose_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Glucose Level (mg/dL)
              </label>
              <input
                type="number"
                step="0.1"
                id="glucose_level"
                name="glucose_level"
                value={formData.glucose_level}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90"
              />
            </div>

            <div>
              <label htmlFor="hydration_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hydration Status
              </label>
              <select
                id="hydration_status"
                name="hydration_status"
                value={formData.hydration_status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="Well hydrated">Well hydrated</option>
                <option value="Mild dehydration">Mild dehydration</option>
                <option value="Moderate dehydration">Moderate dehydration</option>
                <option value="Severe dehydration">Severe dehydration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
            <Droplets size={20} />
            Additional Notes
          </h3>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clinical Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Enter any additional observations, notes, or comments about the patient's condition..."
            />
          </div>
        </div>
   {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-md"
          >
            <Activity size={16} />
            <span>{submitting ? 'Saving...' : 'Save Vitals'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          handleConfirmSubmit();
        }}
        title="Confirm Vital Signs Submission"
        message="Are you sure you want to submit this vital signs record? Please ensure all measurements are accurate."
        confirmText="Submit Vitals"
        variant="success"
      />
    </div>
  );
}