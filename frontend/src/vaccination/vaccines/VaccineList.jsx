import React, { useState, useEffect } from "react";
import { fetchVaccines, deleteVaccine } from "../../store/vaccination/vaccineSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { isAdmin, hasAnyRole, isDoctor } from "../../utils/roles";

export default function VaccineList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { vaccines, loading, error } = useSelector((state) => state.vaccine);
  const [expandedVaccineId, setExpandedVaccineId] = useState(null);
  const toggleDescription = (vaccineId) => {
    setSelectedVaccineId(prev => (prev === vaccineId ? null : vaccineId));
  };
  const [selectedVaccineId, setSelectedVaccineId] = useState(null);
  // Enhanced delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, 
    vaccineId: null,
    vaccineName: "",
    isDeleting: false
  });

  useEffect(() => {
    dispatch(fetchVaccines());
  }, [dispatch]);

 // const administerVaccine = (vaccineId) => {
   // navigate(`/vaccines/vaccination-records/add/vaccine/${vaccineId}`);
  //};
  const openDeleteConfirmation = (vaccineId, vaccineName) => {
    setDeleteConfirm({
      show: true,
      vaccineId,
      vaccineName,
      isDeleting: false
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirm({
      show: false,
      vaccineId: null,
      vaccineName: "",
      isDeleting: false
    });
  };

  const handleDelete = () => {
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    
    dispatch(deleteVaccine(deleteConfirm.vaccineId))
      .unwrap()
      .then(() => {
        closeDeleteConfirmation();
        // You could add a toast notification here
      })
      .catch((err) => {
        console.error("Error deleting vaccine:", err);
        setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
        // You could add an error toast notification here
      });
  };

  const handleEdit = (vaccineId) => {
    navigate(`/vaccines/edit/${vaccineId}`);
  };

  if (loading && vaccines.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Vaccines</h2>
        {hasAnyRole(user, 'admin', 'nurse', 'doctor') && (
            <div>
          <Link 
            to="/vaccines/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add New Vaccine
          </Link>
            <Link 
            to="/vaccines/vaccination-records/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Check Vaccination Records      
          </Link>
          <Link 
            to="/vaccines/vaccination-records/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            New Vaccination Record      
          </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          Refreshing vaccine data...
        </div>
      )}

      {!loading && vaccines.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No vaccines found. {isAdmin(user) && "Add your first vaccine."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-md shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doses</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age Range</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booster</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                {isAdmin(user) && (
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
  {vaccines.map((vaccine) => (
    <React.Fragment key={vaccine.id}>
      <tr 
        onClick={() => toggleDescription(vaccine.id)}
        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      >
        <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">
          {vaccine.name}
        </td>
        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">
          {vaccine.doses_required}
        </td>
        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">
          {vaccine.recommended_age_start ?? '0'} - 
          {vaccine.recommended_age_end ?? ' No limit'}
        </td>
        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-300">
          {vaccine.booster_required ? 
            `Yes (${vaccine.booster_interval_months} months)` : 
            'No'}
        </td>
        <td className="py-4 px-6 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs ${
            vaccine.is_active ? 
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {vaccine.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        {isDoctor(user) && (
          <td className="py-4 px-6 text-sm text-right">
            <div className="flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(vaccine.id);
                }}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-1" /* svg props */ />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  administerVaccine(vaccine.id);
                }}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-1" /* svg props */ />
                Administer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteConfirmation(vaccine.id, vaccine.name);
                }}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-1" /* svg props */ />
                Delete
              </button>
            </div>
          </td>
        )}
      </tr>

      {/* Expanded Description Row */}
      {selectedVaccineId === vaccine.id && (
        <tr className="bg-gray-50 dark:bg-gray-700">
          <td colSpan={isAdmin(user) ? 6 : 5} className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
            <strong>Description:</strong><br />
            {vaccine.description || "No description provided."}
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md mx-auto rounded-lg shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-4">
              Delete Vaccine
            </h3>
            
            <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.vaccineName}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDeleteConfirmation}
                disabled={deleteConfirm.isDeleting}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md focus:outline-none"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleteConfirm.isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none flex items-center"
              >
                {deleteConfirm.isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}