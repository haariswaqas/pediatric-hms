// src/diagnosis/DiagnosisList.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate,Link } from 'react-router-dom';
import {
  fetchDiagnoses,
  markDiagnosisActive, markDiagnosisChronic, 
  markDiagnosisProvisional, markDiagnosisRecurrent, markDiagnosisResolved, markDiagnosisRuleOut
} from '../store/diagnosis/diagnosisSlice';
import ConfirmationModal from '../utils/ConfirmationModal';
import {toast} from 'react-toastify';
import DiagnosisSearch from './DiagnosisSearch'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  MoreVertical
} from 'lucide-react';

import { isDoctor, isParent } from '../utils/roles';


const STATUS_COLORS = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CHRONIC: 'bg-orange-100 text-orange-800',
  RECURRENT: 'bg-purple-100 text-purple-800',
  PROVISIONAL: 'bg-yellow-100 text-yellow-800',
  RULE_OUT: 'bg-red-100 text-red-800'
};

const SEVERITY_ICONS = {
  MILD: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  MODERATE: <Clock className="w-4 h-4 text-yellow-500" />,
  SEVERE: <AlertCircle className="w-4 h-4 text-orange-500" />,
  CRITICAL: <AlertCircle className="w-4 h-4 text-red-500" />
};

const DiagnosisList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { diagnoses, loading, error } = useSelector((state) => state.diagnosis);
  const {user} = useSelector((state) => state.auth)
  
  // Updated to match AdmissionList pattern
  const [filteredDiagnoses, setFilteredDiagnoses] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date_diagnosed');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    dispatch(fetchDiagnoses());
  }, [dispatch]);

  const addTreatment = (diagnosisId) => {
    navigate(`/diagnosis/treatments/add/${diagnosisId}`);
  };

  const addAttachment = (diagnosisId) => {
    navigate(`/diagnosis/attachments/add/${diagnosisId}`);
  };

  // Start with either searched results or full list (matching AdmissionList pattern)
  const baseList = filteredDiagnoses ?? diagnoses;

  // Apply status filter
  const statusFiltered = baseList.filter(diagnosis => {
    return statusFilter === 'all' || diagnosis.status === statusFilter;
  });

  // Apply sort
  const sortedDiagnoses = [...statusFiltered].sort((a, b) => {
    let cmp = 0;
    switch(sortField) {
      case 'date_diagnosed':
        cmp = new Date(b.date_diagnosed) - new Date(a.date_diagnosed);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'child':
        cmp = `${a.child_details?.first_name} ${a.child_details?.last_name}`.localeCompare(
          `${b.child_details?.first_name} ${b.child_details?.last_name}`
        );
        break;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(updateDiagnosisStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleViewDetails = (diagnosisId) => {
    navigate(`/diagnosis/detail/${diagnosisId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {isDoctor(user) && (
          <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/diagnosis/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Add Diagnosis
          </button>
        </div>
        )}
          {isParent(user) ? (
             <div className="flex items-center justify-between">
             <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Children's Diagnoses</h2>
             
           </div>
          ):(
<div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Diagnosis List</h2>
          
        </div>
          )
        } 
        

        {/* Search and Filters - Updated to match AdmissionList pattern */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 dark:text-white">
            <DiagnosisSearch
              onSearchResults={setFilteredDiagnoses}
              placeholder="Search diagnoses..."
              className="w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CHRONIC">Chronic</option>
            <option value="RECURRENT">Recurrent</option>
            <option value="PROVISIONAL">Provisional</option>
            <option value="RULE_OUT">Rule Out</option>
          </select>

          {/* Updated sort buttons to match AdmissionList pattern */}
          {['date_diagnosed', 'title', 'child'].map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className="flex items-center space-x-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <span className="capitalize">{field.replace('_', ' ')}</span>
              {sortField === field && (
                sortDirection === 'asc'
                  ? <SortAsc className="w-4 h-4" />
                  : <SortDesc className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Diagnosis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              {isDoctor(user) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedDiagnoses.map((diagnosis) => (
              <tr key={diagnosis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <Link to={`/children/child/${diagnosis.child_details?.id}`}>{diagnosis.child_details?.first_name} {diagnosis.child_details?.last_name}</Link>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {diagnosis.child_details?.age} yrs
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{diagnosis.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{diagnosis.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
  {isDoctor(user) ? (
    <select
      value={diagnosis.status}
      onChange={(e) => {
        const newStatus = e.target.value;
        switch (newStatus) {
          case 'ACTIVE':
            dispatch(markDiagnosisActive(diagnosis.id));
            break;
          case 'CHRONIC':
            dispatch(markDiagnosisChronic(diagnosis.id));
            break;
          case 'PROVISIONAL':
            dispatch(markDiagnosisProvisional(diagnosis.id));
            break;
          case 'RECURRENT':
            dispatch(markDiagnosisRecurrent(diagnosis.id));
            break;
          case 'RESOLVED':
            dispatch(markDiagnosisResolved(diagnosis.id));
            break;
          case 'RULE_OUT':
            dispatch(markDiagnosisRuleOut(diagnosis.id));
            break;
          default:
            break;
        }
      }}
      className={`px-2 py-1 text-xs font-semibold rounded-md ${STATUS_COLORS[diagnosis.status]} dark:bg-gray-700 dark:text-white`}
    >
      <option value="ACTIVE">Active</option>
      <option value="CHRONIC">Chronic</option>
      <option value="PROVISIONAL">Provisional</option>
      <option value="RECURRENT">Recurrent</option>
      <option value="RESOLVED">Resolved</option>
      <option value="RULE_OUT">Rule Out</option>
    </select>
  ) : (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[diagnosis.status]}`}>
      {diagnosis.status}
    </span>
  )}
</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {SEVERITY_ICONS[diagnosis.severity]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(diagnosis.date_diagnosed).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
  <div className="flex justify-end gap-2">
    <button
      onClick={() => handleViewDetails(diagnosis.id)}
      className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition"
    >
      View
    </button>
    {isDoctor(user) && (
    <button
      onClick={() => addTreatment(diagnosis.id)}
      className="px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md transition"
    >
      Treat
    </button>
    )}
    {isDoctor(user) && (
    <button
      onClick={() => addAttachment(diagnosis.id)}
      className="px-3 py-1 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded-md transition"
    >
      Attach
    </button>
    )}
                    {/* <button
                      onClick={() => handleStatusChange(diagnosis.id, diagnosis.status === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE')}
                      className="text-green-600 hover:text-green-900"
                    >
                      {diagnosis.status === 'ACTIVE' ? 'Mark Resolved' : 'Reactivate'}
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900 rounded-b-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedDiagnoses.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No diagnoses found
        </div>
      )}
    </div>
  );
};

export default DiagnosisList;