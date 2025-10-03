import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTreatments } from '../../store/diagnosis/treatmentSlice';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical
} from 'lucide-react';
import { isDoctor } from '../../utils/roles';

const TreatmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { treatments, loading, error } = useSelector((state) => state.treatment);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    dispatch(fetchTreatments());
  }, [dispatch]);

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = 
      treatment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.diagnosis_details?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const sortedTreatments = [...filteredTreatments].sort((a, b) => {
    let cmp = 0;
    switch(sortField) {
      case 'created_at':
        cmp = new Date(b.created_at) - new Date(a.created_at);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'diagnosis':
        cmp = a.diagnosis_details?.title.localeCompare(b.diagnosis_details?.title);
        break;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleAddTreatment = () => {
    navigate(`/diagnosis/treatments/add`);
  };

  const handleEditTreatment = (treatmentId) => {
    navigate(`/diagnosis/treatments/edit/${treatmentId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Treatments
          </h2>
          {user.role === 'doctor' && (
            <button
              onClick={handleAddTreatment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Treatment
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'title') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('title');
                    setSortDirection('asc');
                  }
                }}
              >
                Treatment Title
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'diagnosis') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('diagnosis');
                    setSortDirection('asc');
                  }
                }}
              >
                Diagnosis
                {sortField === 'diagnosis' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'created_at') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('created_at');
                    setSortDirection('asc');
                  }
                }}
              >
                Created At
                {sortField === 'created_at' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : sortedTreatments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No treatments found
                </td>
              </tr>
            ) : (
              sortedTreatments.map((treatment) => (
                <tr key={treatment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {treatment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {treatment.diagnosis_details?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(treatment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isDoctor(user) && (
                      <button
                        onClick={() => handleEditTreatment(treatment.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TreatmentList;