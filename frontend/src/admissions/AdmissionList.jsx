// src/admissions/AdmissionList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAdmissions, deleteAdmission, dischargeChild, generateAdmissionReport } from '../store/admissions/admissionSlice';
import ConfirmationModal from '../utils/ConfirmationModal';
import AdmissionSearch from './AdmissionSearch';
import { 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  SortAsc, 
  SortDesc, 
  FileText, 
  UserMinus,
  Eye,
  Activity,
  Calendar,
  Filter,
  Users,
  ClipboardList,
  Download,
  Stethoscope
} from 'lucide-react';
import { isParent, isDoctor } from '../utils/roles';

export default function AdmissionList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { admissions, loading, error, reportData } = useSelector((state) => state.admission);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  // instead of searchTerm, we'll drive filtering via this state:
  const [filteredAdmissions, setFilteredAdmissions] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('admission_date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdmissions());
  }, [dispatch]);

  const addVitals = (admissionId) => {
    navigate(`/admissions/add-vitals/${admissionId}`);
  };
  const getStatus = (r) =>
    r.admission_date && !r.discharge_date
      ? 'Admitted'
      : r.discharge_date
      ? 'Discharged'
      : 'Unknown';

  const confirmGenerateReport = () => {
    setShowReportConfirm(true);
  };
  
  const handleGenerateReportConfirmed = () => {
    dispatch(generateAdmissionReport())
      .unwrap()
      .then(() => {
        toast.success('Report generated and sent successfully!');
        setTimeout(() => navigate('/reports'), 2000);
      })
      .catch(() => toast.error('Failed to generate or send report.'));
    setShowReportConfirm(false);
  };

  // Discharge functions
  const confirmDischarge = (admissionId) => {
    setActionId(admissionId);
    setShowDischargeConfirm(true);
  };

  const handleConfirmDischarge = () => {
    dispatch(dischargeChild(actionId))
      .unwrap()
      .then(() => toast.success('Child discharged successfully!'))
      .catch(() => toast.error('Failed to discharge child.'));
    setShowDischargeConfirm(false);
    setActionId(null);
    navigate('/admissions')
  };

  const handleCancelDischarge = () => {
    setShowDischargeConfirm(false);
    setActionId(null);
  };

  // Delete functions
  const confirmDelete = (id) => {
    setActionId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdmission(actionId))
      .unwrap()
      .then(() => toast.success('Admission record deleted successfully!'))
      .catch(() => toast.error('Failed to delete admission.'));
    setShowDeleteConfirm(false);
    setActionId(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setActionId(null);
  };

  // start with either searched results or full list
  const baseList = filteredAdmissions ?? admissions;

  // apply status filter
  const statusFiltered = baseList.filter((r) =>
    statusFilter === 'all' ? true : getStatus(r) === statusFilter
  );

  // apply sort
  const sorted = [...statusFiltered].sort((a, b) => {
    const da = new Date(a[sortField] || 0);
    const db = new Date(b[sortField] || 0);
    return sortDirection === 'desc' ? db - da : da - db;
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
      case 'Admitted':
        return `${baseClasses} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`;
      case 'Discharged':
        return `${baseClasses} bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200 dark:border-slate-700`;
      default:
        return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800`;
    }
  };

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
                  <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  {isParent(user) && (
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                      Children Admissions
                    </h1>
                  )}
                  {!isParent(user) && (
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                      Patient Admissions
                    </h1>
                  )}
                  {isParent(user) && (
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Manage your children admissions and discharges
                    </p>
                  )}
                  {!isParent(user) && (
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      Manage patient admissions and discharges
                    </p>
                  )}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Total: <span className="font-semibold text-slate-900 dark:text-white">{admissions.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Active: <span className="font-semibold text-slate-900 dark:text-white">
                      {admissions.filter(r => getStatus(r) === 'Admitted').length}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-3">
  {isDoctor(user) && (
    <>
      {/* Generate Report */}
      <button
        onClick={confirmGenerateReport}
        className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/25"
      >
        <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        Generate Report
      </button>

      {/* New Admission */}
      <button
        onClick={() => navigate('/admissions/add')}
        className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25"
      >
        <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
        New Admission
      </button>
    </>
  )}


            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 dark:text-white">
              <div className="relative">
                <AdmissionSearch
                  onSearchResults={setFilteredAdmissions}
                  placeholder="Search by patient name, reason, or diagnosis..."
                  className="w-full pl-4 pr-4 py-3 border border-slate-300  dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <option value="Admitted">Currently Admitted</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>

              {/* Sort Buttons */}
              <div className="flex items-center space-x-2">
                {[
                  { field: 'admission_date', label: 'Admission Date', icon: Calendar },
                  { field: 'discharge_date', label: 'Discharge Date', icon: Calendar }
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

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
  <tr>
    {[
      { key: 'Child', icon: Users },
      { key: 'Reason', icon: ClipboardList },
      { key: 'Diagnosis', icon: Stethoscope },
      { key: 'Status', icon: Activity },
      { key: 'Admission Date', icon: Calendar },
      { key: 'Discharge Date', icon: Calendar },
      // Only add Actions column if NOT a parent
      ...(!isParent(user) ? [{ key: 'Actions', icon: null }] : []),
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
                {sorted.map((r, index) => (
                  <tr 
                    key={r.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <Link 
                        to={`/children/child/${r.child_details?.id}`} 
                        className="group flex items-center space-x-3 hover:no-underline"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {r.child_details?.first_name?.charAt(0)}{r.child_details?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            {r.child_details?.first_name} {r.child_details?.last_name}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                        {r.admission_reason}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <Link 
                        to={`/diagnosis/detail/${r.diagnosis_details?.id}`} 
                        className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <span>{r.diagnosis_details?.title}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <span className={getStatusBadge(getStatus(r))}>
                        {getStatus(r)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(r.admission_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {r.discharge_date ? new Date(r.discharge_date).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </td>
                    {!isParent(user) && (
  <td className="px-6 py-5">
    <div className="flex items-center space-x-2">
      {/* View Details */}
      <button
        onClick={() => navigate(`/admissions/detail/${r.id}`)}
        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-all hover:scale-105"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Add Vitals */}
      <button
        onClick={() => addVitals(r.id)}
        className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all hover:scale-105"
        title="Add Vitals"
      >
        <Activity className="w-4 h-4" />
      </button>

      {/* Edit */}
      <button
        onClick={() => navigate(`/admissions/edit/${r.id}`)}
        className="p-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-800/50 text-amber-600 dark:text-amber-400 rounded-lg transition-all hover:scale-105"
        title="Edit Admission"
      >
        <Edit className="w-4 h-4" />
      </button>

      {/* Discharge (only for admitted patients) */}
      {getStatus(r) === 'Admitted' && (
        <button
          onClick={() => confirmDischarge(r.id)}
          className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all hover:scale-105"
          title="Discharge Patient"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => confirmDelete(r.id)}
        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-all hover:scale-105"
        title="Delete Admission"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </td>
)}

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
                <span>Loading admissions...</span>
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
          
          {!loading && sorted.length === 0 && (
            <div className="py-16 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <ClipboardList className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No admissions found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {statusFilter !== 'all' || filteredAdmissions 
                      ? 'Try adjusting your search or filters.' 
                      : 'Get started by adding a new admission.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <ConfirmationModal
          show={showReportConfirm}
          onConfirm={handleGenerateReportConfirmed}
          onClose={() => setShowReportConfirm(false)}
          title="Generate Admission Report"
          message="Are you sure you want to generate the admission report and send it to doctors/nurses on the system? This action cannot be reversed."
        />

        <ConfirmationModal
          show={showDeleteConfirm}
          title="Delete Admission"
          message="Are you sure you want to delete this admission? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          confirmText="Delete"
          variant="danger"
        />

        <ConfirmationModal
          show={showDischargeConfirm}
          title="Discharge Patient"
          message="Are you sure you want to discharge this patient? This will mark the admission as completed and set the discharge date."
          onConfirm={handleConfirmDischarge}
          onClose={handleCancelDischarge}
          confirmText="Discharge"
          variant="primary"
        />
      </div>
      </div>
  );
}