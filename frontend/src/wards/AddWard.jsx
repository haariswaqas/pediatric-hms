import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createWard } from '../store/admin/wardSlice';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function AddWard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.ward);

  const [wardData, setWardData] = useState({
    name: '',
    ward_type: '',
    capacity: '',
  });

  const closeModal = () => navigate('/wards');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWardData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: wardData.name,
      ward_type: wardData.ward_type,
      capacity: Number(wardData.capacity),
    };
    console.log('Data being sent:', payload);
    try {
      await dispatch(createWard(payload)).unwrap();
      navigate('/wards');
    } catch (err) {
      console.error('Error creating ward:', err);
    }
  };

  const wardTypes = [
    { value: 'GENERAL', label: 'General Ward' },
    { value: 'NICU', label: 'Neonatal Intensive Care Unit' },
    { value: 'PICU', label: 'Pediatric Intensive Care Unit' },
    { value: 'PRIVATE', label: 'Private Room' },
    { value: 'ISOLATION', label: 'Isolation Ward' },
    { value: 'SURGICAL', label: 'Surgical Ward' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
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
          Add Ward
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ward Name */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Ward Name
            </label>
            <input
              type="text"
              name="name"
              value={wardData.name}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              placeholder="Enter ward name"
            />
          </div>

          {/* Ward Type */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Ward Type
            </label>
            <select
              name="ward_type"
              value={wardData.ward_type}
              onChange={handleChange}
              required
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Select Ward Type</option>
              {wardTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={wardData.capacity}
              onChange={handleChange}
              required
              min={1}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              placeholder="Enter capacity (number of beds)"
            />
          </div>

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
              {loading ? 'Saving…' : 'Add Ward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
