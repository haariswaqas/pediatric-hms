import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createLabRequestItem, clearLabRequestItemError } from '../../store/lab/labRequestItemSlice';
import { fetchLabRequests } from '../../store/lab/labRequestSlice';
import { fetchLabTests } from '../../store/lab/labTestSlice';
import {
  ClipboardList,
  User,
  FileText,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';

export default function AddLabRequestItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labRequestId } = useParams();

  const { labRequests } = useSelector(s => s.labRequest);
  const { labTests } = useSelector(s => s.labTest);
  const { loading, error } = useSelector(s => s.labRequestItem);

  const [formData, setFormData] = useState({
    lab_request: labRequestId || '',
    lab_test: '',
    notes: '',
    is_completed: false
  });
  const [formError, setFormError] = useState({});

  // Fetch available requests and tests
  useEffect(() => {
    dispatch(fetchLabRequests());
    dispatch(fetchLabTests());
  }, [dispatch]);

  // Clear backend error on unmount
  useEffect(() => {
    return () => { dispatch(clearLabRequestItemError()); };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormError(fe => ({ ...fe, [name]: null }));
    if (error) dispatch(clearLabRequestItemError());
  };

  const clearFields = () => {
    setFormData(fd => ({ ...fd, lab_test: '', notes: '', is_completed: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple client validation
    if (!formData.lab_request || !formData.lab_test) {
      setFormError({ form: 'Please select both lab request and test.' });
      return;
    }
    try {
      const res = await dispatch(createLabRequestItem(formData)).unwrap();
      toast.success('Lab request item added successfully!');
      clearFields();
    } catch (err) {
      toast.error(err || 'Failed to add lab request item.');
    }
  };

  const inputCls = `w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400`;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <ClipboardList className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
        Add Lab Request Item
      </h1>

      {formError.form && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {formError.form}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lab Request Select */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5 mr-2" /> Lab Request
          </label>
          <select
            name="lab_request"
            value={formData.lab_request}
            onChange={handleChange}
            required
            className={inputCls}
            disabled={!!labRequestId}
          >
            <option value="">Select Lab Request</option>
            {labRequests.map(lr => (
              <option key={lr.id} value={lr.id}>
                {lr.child_details?.first_name} {lr.child_details?.last_name} — {new Date(lr.date_requested).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Lab Test Select */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <PlusCircle className="w-5 h-5 mr-2" /> Lab Test
          </label>
          <select
            name="lab_test"
            value={formData.lab_test}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Lab Test</option>
            {labTests.map(lt => (
              <option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code})
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 mr-2" /> Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* Completed Checkbox */}
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <label className="text-gray-700 dark:text-gray-300">Completed?</label>
          <input
            type="checkbox"
            name="is_completed"
            checked={formData.is_completed}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-md transition disabled:opacity-50"
        >
          <ClipboardList className="w-5 h-5" /> Add Item
        </button>
      </form>
    </div>
  );
}
