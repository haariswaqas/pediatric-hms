// src/users/ShiftList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShifts, deleteShift } from '../store/shifts/shiftSlice';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Edit2 } from 'lucide-react';
export default function ShiftList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shifts, loading, error } = useSelector((s) => s.shifts);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, shiftId: null });

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  const handleEdit = (id) => navigate(`/shifts/edit/${id}`);
  const confirmDelete = (id) => setDeleteConfirm({ show: true, shiftId: id });
  const cancelDelete = () => setDeleteConfirm({ show: false, shiftId: null });
  const handleDelete = () => {
    dispatch(deleteShift(deleteConfirm.shiftId))
      .unwrap()
      .finally(() => setDeleteConfirm({ show: false, shiftId: null }));
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Shift Schedule</h2>
        <Link
          to="/shifts/add"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          + Add Shift
        </Link>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading shifts…</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Error loading shifts: {JSON.stringify(error)}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-left text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-200 dark:bg-gray-800 uppercase text-sm font-medium text-gray-700 dark:text-gray-100">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`
                    ${idx % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}
                    hover:bg-gray-100 dark:hover:bg-gray-600
                  `}
                >
                  <td className="px-4 py-2">{s.day}</td>
                  <td className="px-4 py-2">{s.start_time}</td>
                  <td className="px-4 py-2">{s.end_time}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(s.id)}
                      className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(s.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6 relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this shift? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
             
           
            
             
            </div>
          </div>
         
        </div>
        
      )}
    </div>
  );
}
