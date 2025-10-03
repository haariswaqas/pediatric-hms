import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBed } from '../../store/admin/bedSlice';
import { fetchWards } from '../../store/admin/wardSlice';
import { useNavigate } from 'react-router-dom';
import { X, Save, XCircle, Calendar, ClipboardList, CheckCircle } from 'lucide-react';

export default function AddBed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.bed);
  const { wards } = useSelector((state) => state.ward);

  const [bedData, setBedData] = useState({
    ward: '',
    bed_number: '',
    is_occupied: false,
    last_cleaned: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchWards());
  }, [dispatch]);

  const closeModal = () => {
    if (isSubmitting) return;
    navigate('/wards');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBedData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field when user modifies it
   if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!bedData.ward) errors.ward = "Please select a ward";
    if (!bedData.bed_number) errors.bed_number = "Bed number is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      ...bedData,
      ward: Number(bedData.ward),
      last_cleaned: bedData.last_cleaned || null,
    };
    
    try {
      await dispatch(createBed(payload)).unwrap();
      navigate('/wards');
    } catch (err) {
      console.error('Error creating bed:', err);
      setIsSubmitting(false);
    }
  };

  // Format current date for default datetime-local value
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    // Set default time to now if not already set
    if (!bedData.last_cleaned) {
      setBedData(prev => ({
        ...prev,
        last_cleaned: getCurrentDateTime(),
      }));
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList size={24} className="text-blue-600 dark:text-blue-400" />
            Add New Bed
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Close"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
              <XCircle size={18} />
              <span>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ward */}
            <div>
              <label className="block mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
                Ward
              </label>
              <select
                name="ward"
                value={bedData.ward}
                onChange={handleChange}
                required
                className={`w-full border ${formErrors.ward ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
              >
                <option value="">Select Ward</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {formErrors.ward && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.ward}</p>
              )}
            </div>

            {/* Bed Number */}
            <div>
              <label className="block mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
                Bed Number
              </label>
              <input
                type="text"
                name="bed_number"
                value={bedData.bed_number}
                onChange={handleChange}
                required
                className={`w-full border ${formErrors.bed_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                placeholder="Enter unique bed number"
              />
              {formErrors.bed_number && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.bed_number}</p>
              )}
            </div>

            {/* Last Cleaned */}
            <div>
              <label className="mb-1.5 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                Last Cleaned
              </label>
              <input
                type="datetime-local"
                name="last_cleaned"
                value={bedData.last_cleaned}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Is Occupied */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-center">
              <div className="relative inline-flex items-center mr-3">
                <input
                  type="checkbox"
                  id="is_occupied"
                  name="is_occupied"
                  checked={bedData.is_occupied}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div 
                  className={`w-10 h-6 rounded-full transition-colors ${
                    bedData.is_occupied ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div 
                    className={`transform transition-transform w-5 h-5 bg-white rounded-full shadow-md ${
                      bedData.is_occupied ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  ></div>
                </div>
              </div>
              <label 
                htmlFor="is_occupied" 
                className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer flex items-center gap-1.5"
              >
                {bedData.is_occupied ? 
                  <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" /> : 
                  <XCircle size={16} className="text-gray-400 dark:text-gray-500" />
                }
                {bedData.is_occupied ? 'Occupied' : 'Available'}
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
                Notes
              </label>
              <textarea
                name="notes"
                value={bedData.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 rounded-b-xl">
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || isSubmitting}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            {loading || isSubmitting ? 'Saving...' : 'Add Bed'}
          </button>
        </div>
      </div>
    </div>
  );
}