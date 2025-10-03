// src/beds/EditBed.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBed, fetchBedById, clearSelectedBed } from '../../store/admin/bedSlice';
import { fetchWards } from '../../store/admin/wardSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function EditBed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bedId } = useParams();
  const { selectedBed: bed, loading, error } = useSelector((state) => state.bed);
  const { wards } = useSelector((state) => state.ward);

  // Local state mirroring the bed fields
  const [bedData, setBedData] = useState({
    ward: '',
    bed_number: '',
    is_occupied: false,
    last_cleaned: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchBedById(bedId));
    dispatch(fetchWards());
    return () => {
      // Clear selected bed on unmount
      dispatch(clearSelectedBed());
    };
  }, [dispatch, bedId]);

  // Populate form when bed data is loaded
  useEffect(() => {
    if (bed && bed.id === Number(bedId)) {
      setBedData({
        ward: bed.ward || '',
        bed_number: bed.bed_number || '',
        is_occupied: bed.is_occupied ?? false,
        last_cleaned: bed.last_cleaned ? bed.last_cleaned.slice(0, 16) : '',
        notes: bed.notes || '',
      });
    }
  }, [bed, bedId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBedData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const closeModal = () => {
    navigate('/wards/beds');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...bedData,
      ward: Number(bedData.ward),
      last_cleaned: bedData.last_cleaned || null,
    };
    console.log('Data being sent:', payload);
    try {
        dispatch(updateBed({ bedId: bedId, updatedData: payload })).unwrap();
      navigate('/wards/beds');
    } catch (err) {
      console.error('Error updating bed:', err);
    }
  };

  if (loading && !bed) {
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
          Edit Bed
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ward */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Ward</label>
            <select
              name="ward"
              value={bedData.ward}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bed Number */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Bed Number</label>
            <input
              type="text"
              name="bed_number"
              value={bedData.bed_number}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Is Occupied */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_occupied"
              checked={bedData.is_occupied}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700 dark:text-gray-300">Is Occupied</label>
          </div>

          {/* Last Cleaned */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Last Cleaned</label>
            <input
              type="datetime-local"
              name="last_cleaned"
              value={bedData.last_cleaned}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              name="notes"
              value={bedData.notes}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              rows={3}
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
