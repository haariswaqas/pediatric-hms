import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWards, deleteWard } from '../store/admin/wardSlice';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Edit2, Search, Plus, RefreshCw, ChevronDown, ChevronUp, BedIcon } from 'lucide-react';
import BedList from './beds/BedList';

export default function WardList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wards, loading, error } = useSelector((s) => s.ward);
  
  // Local state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, wardId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWard, setExpandedWard] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });
  const [showBedList, setShowBedList] = useState(true);

  useEffect(() => {
    dispatch(fetchWards());
  }, [dispatch]);

  // Handlers
  const handleEdit = (id) => navigate(`/wards/edit/${id}`);
  const confirmDelete = (id, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, wardId: id });
  };
  const cancelDelete = () => setDeleteConfirm({ show: false, wardId: null });
  const handleDelete = () => {
    dispatch(deleteWard(deleteConfirm.wardId))
      .unwrap()
      .then(() => {
        // Refresh the wards list after successful deletion
        dispatch(fetchWards());
      })
      .finally(() => setDeleteConfirm({ show: false, wardId: null }));
  };
  
  const handleRefresh = () => {
    dispatch(fetchWards());
  };
  
  const toggleWardExpansion = (wardId) => {
    setExpandedWard(expandedWard === wardId ? null : wardId);
  };
  
  const toggleBedList = () => {
    setShowBedList(!showBedList);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Filter and sort wards
  const filteredWards = useMemo(() => {
    let result = [...wards];
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(ward => 
        ward.name.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortConfig.key) {
        case 'capacity':
        case 'available_beds':
          compareA = Number(a[sortConfig.key]);
          compareB = Number(b[sortConfig.key]);
          break;
        default:
          compareA = a[sortConfig.key];
          compareB = b[sortConfig.key];
      }
      
      if (compareA < compareB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return result;
  }, [wards, searchTerm, sortConfig]);

  // Calculate ward statistics
  const wardStats = useMemo(() => {
    return {
      total: wards.length,
      totalBeds: wards.reduce((sum, ward) => sum + Number(ward.capacity || 0), 0),
      availableBeds: wards.reduce((sum, ward) => sum + Number(ward.available_beds || 0), 0)
    };
  }, [wards]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ward Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hospital wards and their bed allocation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded shadow"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            <Link
              to="/wards/add"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              <Plus size={16} className="mr-2" />
              Add Ward
            </Link>
          </div>
        </div>

        {/* Ward Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Wards</h3>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{wardStats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Total Bed Capacity</h3>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{wardStats.totalBeds}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400">Available Beds</h3>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{wardStats.availableBeds}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search wards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Ward List */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading wards...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
            <div className="font-bold mb-1">Error loading wards</div>
            <div>{typeof error === 'object' ? JSON.stringify(error) : error}</div>
          </div>
        )}

        {!loading && !error && filteredWards.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {wards.length === 0 
                ? "No wards available. Add a new ward to get started." 
                : "No wards match your search criteria."}
            </p>
          </div>
        )}

        {!loading && !error && filteredWards.length > 0 && (
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Ward Name
                      <span className="ml-1">{getSortIndicator('name')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('capacity')}
                  >
                    <div className="flex items-center">
                      Capacity
                      <span className="ml-1">{getSortIndicator('capacity')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('available_beds')}
                  >
                    <div className="flex items-center">
                      Available Beds
                      <span className="ml-1">{getSortIndicator('available_beds')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredWards.map((ward) => (
                  <React.Fragment key={ward.id}>
                    <tr 
                      className="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => toggleWardExpansion(ward.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {ward.name}
                            </div>
                            {ward.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {ward.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{ward.capacity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          Number(ward.available_beds) > 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {ward.available_beds}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(ward.id);
                          }}
                          className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 mr-3"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => confirmDelete(ward.id, e)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedWard === ward.id && (
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan="4" className="px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <h4 className="font-semibold mb-2">Ward Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p><span className="font-medium">Location:</span> {ward.location || 'Not specified'}</p>
                                <p><span className="font-medium">Ward Type:</span> {ward.ward_type || 'Not specified'}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Capacity:</span> {ward.capacity} beds</p>
                                <p><span className="font-medium">Available:</span> {ward.available_beds} beds</p>
                                <p><span className="font-medium">Occupancy Rate:</span> {
                                  ward.capacity > 0 
                                    ? `${Math.round(((ward.capacity - ward.available_beds) / ward.capacity) * 100)}%` 
                                    : 'N/A'
                                }</p>
                              </div>
                            </div>
                            <div>
                              <p><span className="font-medium">Notes:</span> {ward.notes || 'No additional notes'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bed List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={toggleBedList}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <BedIcon className="mr-2" size={24} />
            Bed Management
          </h2>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {showBedList ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
        
        {showBedList && <BedList />}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cancelDelete}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              Delete Ward
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-2">
              Are you sure you want to delete this ward?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 text-center mb-6">
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
              >
                Delete Ward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}