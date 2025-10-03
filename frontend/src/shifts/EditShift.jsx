// src/users/EditShiftModal.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateShift, fetchShiftById, clearSelectedShift } from '../store/shifts/shiftSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function EditShift() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shiftId } = useParams();

  const { selectedShift, loading, error } = useSelector((state) => state.shifts);

  const [shiftData, setShiftData] = useState({
    day: '',
    start_time: '',
    end_time: '',
  });

  // Fetch shift on mount
  useEffect(() => {
    dispatch(fetchShiftById(shiftId));
    return () => {
      // clean up selectedShift when unmounting
      dispatch(clearSelectedShift());
    };
  }, [dispatch, shiftId]);

  // When the API returns, populate the form
  useEffect(() => {
    if (selectedShift) {
      setShiftData({
        day: selectedShift.day || '',
        start_time: selectedShift.start_time.slice(0,5), // "HH:MM:SS" → "HH:MM"
        end_time: selectedShift.end_time.slice(0,5),
      });
    }
  }, [selectedShift]);

  const handleChange = (e) => {
    setShiftData((s) => ({
      ...s,
      [e.target.name]: e.target.value,
    }));
  };

  const closeModal = () => {
    navigate('/shifts');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      day: shiftData.day,
      start_time: shiftData.start_time.length === 5 
        ? `${shiftData.start_time}:00` 
        : shiftData.start_time,
      end_time: shiftData.end_time.length === 5 
        ? `${shiftData.end_time}:00` 
        : shiftData.end_time,
    };

    try {
      await dispatch(updateShift({ shiftId, updatedData: payload })).unwrap();
      navigate('/shifts');
    } catch (err) {
      console.error('Error updating shift:', err);
    }
  };

  // If still loading the shift, you can show a spinner or nothing
  if (loading && !selectedShift) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Edit Shift
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Day
            </label>
            <select
              name="day"
              value={shiftData.day}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Select a day</option>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              step="1"
              value={shiftData.start_time}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              End Time
            </label>
            <input
              type="time"
              name="end_time"
              step="1"
              value={shiftData.end_time}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
