import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchPrescriptions, deletePrescription } from '../store/prescriptions/prescriptionSlice';

const PrescriptionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptions, loading, error } = useSelector((s) => s.prescription);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    dispatch(fetchPrescriptions());
  }, [dispatch]);

  const handleAdd = () => navigate('/prescriptions/add');
  const addPrescriptionItem = (prescriptionId) => navigate(`/prescriptions/add-item/${prescriptionId}`);
  const goToPrescriptionItemsList = () => navigate('/prescriptions/items');
  const handleEdit = (prescriptionId) => navigate(`/prescriptions/edit/${prescriptionId}`);
  const handleDelete = (id) => {
    if (window.confirm('Delete this prescription?')) {
      dispatch(deletePrescription(id));
    }
  };
  const toggle = (id) => setExpandedRows((p) => ({ ...p, [id]: !p[id] }));

  if (loading) return <div className="text-center py-10 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error)   return <div className="text-center py-10 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">Prescriptions</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          + Add
        </button>
        <button
          onClick={goToPrescriptionItemsList}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          View Prescription Items
        </button>
   
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No prescriptions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-600">
                {['Doctor','Patient','Diagnosis','Weight','Valid Until','Status','Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-gray-700 dark:text-gray-200 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <>
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                      {p.doctor_details
                        ? `${p.doctor_details.first_name} ${p.doctor_details.last_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/children/child/${p.child_details?.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {p.child_details
                          ? `${p.child_details.first_name} ${p.child_details.last_name}`
                          : '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        to={`/diagnosis/detail/${p.diagnosis_details?.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {p.diagnosis_details?.title || '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-100">
                      {p.weight_at_prescription || '—'}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-100">
                      {p.valid_until || '—'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          p.status === 'ACTIVE'
                            ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                            : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(p.id)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => addPrescriptionItem(p.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        Add Item
                      </button>
                      <button
                        onClick={() => toggle(p.id)}
                        className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
                      >
                        {expandedRows[p.id] ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[p.id] && (
                    <tr className="bg-gray-100 dark:bg-gray-600">
                      <td colSpan="7" className="px-4 py-3 text-gray-700 dark:text-gray-200">
                        <strong>Notes:</strong> {p.notes || 'None'}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
