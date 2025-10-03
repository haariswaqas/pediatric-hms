import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBeds, deleteBed } from '../../store/admin/bedSlice';
import { fetchWards } from '../../store/admin/wardSlice';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function BedList() {
  const dispatch = useDispatch();
  const { beds, loading, error } = useSelector((state) => state.bed);
  const { wards } = useSelector((state) => state.ward);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ ward: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'bed_number', direction: 'ascending' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, bedId: null });

  useEffect(() => {
    dispatch(fetchBeds());
    dispatch(fetchWards());
  }, [dispatch]);

  // Handlers
  const confirmDelete = (id, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, bedId: id });
  };

  const cancelDelete = () => setDeleteConfirm({ show: false, bedId: null });

  const handleDelete = () => {
    dispatch(deleteBed(deleteConfirm.bedId))
      .unwrap()
      .then(() => {
        // Refresh the beds list after successful deletion
        dispatch(fetchBeds());
      })
      .finally(() => setDeleteConfirm({ show: false, bedId: null }));
  };

  const handleRefresh = () => {
    dispatch(fetchBeds());
  };

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

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ ward: '', status: '' });
  };

  // Filter and sort beds
  const filteredBeds = useMemo(() => {
    let result = [...beds];

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter((bed) =>
        bed.bed_number.toString().toLowerCase().includes(lowercasedSearch) ||
        (bed.ward_name && bed.ward_name.toLowerCase().includes(lowercasedSearch)) ||
        (bed.notes && bed.notes.toLowerCase().includes(lowercasedSearch))
      );
    }

    // Apply filters
    if (filters.ward) {
      result = result.filter((bed) => bed.ward === parseInt(filters.ward));
    }

    if (filters.status) {
      result = result.filter((bed) =>
        filters.status === 'occupied' ? bed.is_occupied : !bed.is_occupied
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortConfig.key) {
        case 'ward_name':
          compareA = a.ward_name || '';
          compareB = b.ward_name || '';
          break;
        case 'is_occupied':
          compareA = a.is_occupied ? 1 : 0;
          compareB = b.is_occupied ? 1 : 0;
          break;
        case 'last_cleaned':
          compareA = a.last_cleaned ? new Date(a.last_cleaned).getTime() : 0;
          compareB = b.last_cleaned ? new Date(b.last_cleaned).getTime() : 0;
          break;
        case 'bed_number':
          compareA = Number(a.bed_number);
          compareB = Number(b.bed_number);
          break;
        default:
          compareA = a[sortConfig.key];
          compareB = b[sortConfig.key];
      }

      if (compareA < compareB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (compareA > compareB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return result;
  }, [beds, searchTerm, filters, sortConfig]);

  // Calculate bed statistics
  const bedStats = useMemo(() => {
    return {
      total: beds.length,
      available: beds.filter(bed => !bed.is_occupied).length,
      occupied: beds.filter(bed => bed.is_occupied).length
    };
  }, [beds]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bed Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage hospital beds and their availability
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
              to="/wards/beds/add"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              <Plus size={16} className="mr-2" />
              Add Bed
            </Link>
          </div>
        </div>

        {/* Bed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Beds</h3>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{bedStats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Available Beds</h3>
            <p className="text-2xl font-bold text-green-800 dark:text-green-300">{bedStats.available}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Occupied Beds</h3>
            <p className="text-2xl font-bold text-red-800 dark:text-red-300">{bedStats.occupied}</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search beds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Ward Filter */}
            <div className="flex-1 md:max-w-xs">
              <select
                value={filters.ward}
                onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">All Wards</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>{ward.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 md:max-w-xs">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="py-2 px-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading beds...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
            <div className="font-bold mb-1">Error loading beds</div>
            <div>{typeof error === 'object' ? JSON.stringify(error) : error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBeds.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {beds.length === 0 
                ? "No beds available. Add a new bed to get started." 
                : "No beds match your search criteria."}
            </p>
          </div>
        )}

        {/* Bed Table */}
        {!loading && !error && filteredBeds.length > 0 && (
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('id')}
                  >
                    <div className="flex items-center">
                      ID
                      <span className="ml-1">{getSortIndicator('id')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('ward_name')}
                  >
                    <div className="flex items-center">
                      Ward
                      <span className="ml-1">{getSortIndicator('ward_name')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('bed_number')}
                  >
                    <div className="flex items-center">
                      Bed Number
                      <span className="ml-1">{getSortIndicator('bed_number')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('is_occupied')}
                  >
                    <div className="flex items-center">
                      Status
                      <span className="ml-1">{getSortIndicator('is_occupied')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('last_cleaned')}
                  >
                    <div className="flex items-center">
                      Last Cleaned
                      <span className="ml-1">{getSortIndicator('last_cleaned')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredBeds.map((bed) => (
                  <tr key={bed.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {bed.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {bed.ward_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {bed.bed_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !bed.is_occupied 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {bed.is_occupied ? 'Occupied' : 'Available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {bed.last_cleaned ? new Date(bed.last_cleaned).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {bed.notes || 'No notes'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/wards/beds/edit/${bed.id}`}
                        className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 mr-3"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={(e) => confirmDelete(bed.id, e)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              Delete Bed
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-2">
              Are you sure you want to delete this bed?
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
                Delete Bed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}