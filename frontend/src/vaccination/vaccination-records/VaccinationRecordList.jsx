// src/vaccination/vaccination-records/VaccinationRecordList.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchVaccinationRecords,
  deleteVaccinationRecord,
  clearSelectedVaccinationRecord,
  clearVaccinationRecordError,
} from '../../store/vaccination/vaccinationRecordSlice';
import { isDoctor, isNurse } from '../../utils/roles';
import ConfirmationModal from '../../utils/ConfirmationModal';
import { 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  SortAsc, 
  SortDesc, 
  Eye,
  Activity,
  Calendar,
  Filter,
  Users,
  Shield,
  Syringe,
  FileText,
  UserCheck
} from 'lucide-react';
import {isParent} from '../../utils/roles';

const VaccinationRecordList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vaccinationRecords, loading, error } = useSelector(
    (state) => state.vaccinationRecord
  );
  const { user } = useSelector((state) => state.auth);

  // State for filtering and sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('scheduled_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    dispatch(fetchVaccinationRecords());
    return () => {
      dispatch(clearSelectedVaccinationRecord());
      dispatch(clearVaccinationRecordError());
    };
  }, [dispatch]);

  // can the current user edit/delete this record?
  const canModify = (record) => {
    // doctor match
    if (isDoctor(user) && record.administered_by_details?.doctor_id === user.user_id) {
      return true;
    }
    // nurse match
    if (isNurse(user) && record.administered_by_details?.nurse_id === user.user_id) {
      return true;
    }
    return false;
  };

  const confirmDelete = (id) => {
    setActionId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteVaccinationRecord(actionId))
      .unwrap()
      .then(() => {
        toast.success('Vaccination record deleted successfully!');
        dispatch(fetchVaccinationRecords());
      })
      .catch(() => toast.error('Failed to delete vaccination record.'));
    setShowDeleteConfirm(false);
    setActionId(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setActionId(null);
  };

  const handleEdit = (record) => {
    dispatch(clearSelectedVaccinationRecord());
    navigate(`/vaccines/vaccination-records/edit/${record.id}`);
  };

  const handleAdd = () => {
    navigate('/vaccines/vaccination-records/add');
  };

  // Filtering and sorting logic
  const filteredRecords = vaccinationRecords.filter((record) => {
    const matchesSearch = searchTerm === '' || 
      `${record.child_details?.first_name} ${record.child_details?.last_name}`
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vaccine_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = sortField.includes('date') ? new Date(a[sortField] || 0) : a[sortField];
    const bValue = sortField.includes('date') ? new Date(b[sortField] || 0) : b[sortField];
    
    if (sortField.includes('date')) {
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    }
    
    const aStr = String(aValue || '').toLowerCase();
    const bStr = String(bValue || '').toLowerCase();
    
    if (sortDirection === 'desc') {
      return bStr.localeCompare(aStr);
    }
    return aStr.localeCompare(bStr);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors";
    switch (status) {
      case 'Administered':
        return `${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`;
      case 'Scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800`;
      case 'Missed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800`;
      case 'Overdue':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200 dark:border-slate-700`;
    }
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(vaccinationRecords.map(record => record.status))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title and Stats */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Vaccination Records
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Manage patient vaccination schedules and records
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Total: <span className="font-semibold text-slate-900 dark:text-white">{vaccinationRecords.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Administered: <span className="font-semibold text-slate-900 dark:text-white">
                      {vaccinationRecords.filter(r => r.status === 'Administered').length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Scheduled: <span className="font-semibold text-slate-900 dark:text-white">
                      {vaccinationRecords.filter(r => r.status === 'Scheduled').length}
                    </span>
                  </span>
                </div>
              </div>
            </div>

     {/* Action Buttons */}
{!isParent(user) ? (
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={handleAdd}
      className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
    >
      <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
      New Record
    </button>
  </div>
) : null}
</div>
</div>

{/* Search and Filters Section */}
{!isParent(user) && (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
    <div className="flex flex-col lg:flex-row gap-4">
      
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by child name, vaccine, or status..."
            className="w-full pl-4 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center space-x-2">
          {[
            { field: 'scheduled_date', label: 'Scheduled Date', icon: Calendar },
            { field: 'administered_date', label: 'Administered Date', icon: Calendar }
          ].map(({ field, label, icon: Icon }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all ${
                sortField === field
                  ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{label}</span>
              {sortField === field && (
                sortDirection === 'asc'
                  ? <SortAsc className="w-4 h-4" />
                  : <SortDesc className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)}


        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  {[
                    { key: 'Child', icon: Users },
                    { key: 'Vaccine', icon: Syringe },
                    { key: 'Dose', icon: FileText },
                    { key: 'Status', icon: Activity },
                    { key: 'Scheduled Date', icon: Calendar },
                    { key: 'Administered Date', icon: Calendar },
                    { key: 'Administered By', icon: UserCheck },
                    { key: 'Batch', icon: FileText },
                    { key: 'Actions', icon: null }
                  ].map(({ key, icon: Icon }) => (
                    <th key={key} className="px-6 py-4 text-left">
                      <div className="flex items-center space-x-2">
                        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {key}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedRecords.map((record, index) => (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <Link 
                        to={`/children/child/${record.child_details?.id}`} 
                        className="group flex items-center space-x-3 hover:no-underline"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {record.child_details?.first_name?.charAt(0)}{record.child_details?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            {record.child_details?.first_name} {record.child_details?.last_name}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {record.vaccine_details?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {record.vaccine_details?.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {record.dose_number}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={getStatusBadge(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(record.scheduled_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {record.administered_date 
                            ? new Date(record.administered_date).toLocaleDateString() 
                            : 'Not yet'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {canModify(record)
                          ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                              You
                            </span>
                          )
                          : `${record.administered_by_details?.first_name || ''} ${
                              record.administered_by_details?.last_name || ''
                            }`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {record.batch_number || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        {/* View Details */}
                        <button
                          onClick={() => navigate(`/vaccines/vaccination-records/detail/${record.id}`)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-all hover:scale-105"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Edit and Delete (only if user can modify) */}
                        {canModify(record) && (
                          <>
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 text-amber-600 dark:text-amber-400 rounded-lg transition-all hover:scale-105"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => confirmDelete(record.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-all hover:scale-105"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loading and Empty States */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading vaccination records...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-6 m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {!loading && sortedRecords.length === 0 && (
            <div className="py-16 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No vaccination records found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {statusFilter !== 'all' || searchTerm 
                      ? 'Try adjusting your search or filters.' 
                      : 'Get started by adding a new vaccination record.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          show={showDeleteConfirm}
          title="Delete Vaccination Record"
          message="Are you sure you want to delete this vaccination record? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default VaccinationRecordList;