import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReferenceRanges,
  deleteReferenceRange,
  bulkUploadReferenceRanges
} from "../../store/lab/referenceRangeSlice";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  UploadCloud,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { isLabTech } from "../../utils/roles";

const ReferenceRangeList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { referenceRanges, loading, error } = useSelector((state) => state.referenceRange);
  const { user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabTest, setSelectedLabTest] = useState("");
  const [expandedTests, setExpandedTests] = useState(new Set());
  const [expandedParameters, setExpandedParameters] = useState(new Set());
  const [sortBy, setSortBy] = useState("lab_test");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    dispatch(fetchReferenceRanges());
  }, [dispatch]);

  // Group reference ranges by lab test and then by parameter
  const groupedRanges = React.useMemo(() => {
    if (!referenceRanges) return {};
    
    let filtered = referenceRanges.filter(range => {
      const matchesSearch = 
        range.lab_test_details.lab_test.toLowerCase().includes(searchTerm.toLowerCase()) ||
        range.parameter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        range.lab_test_details.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLabTest = !selectedLabTest || range.lab_test_details.lab_test === selectedLabTest;
      
      return matchesSearch && matchesLabTest;
    });

    return filtered.reduce((groups, range) => {
      const testKey = `${range.lab_test_details.name} (${range.lab_test_details.code})`;
      if (!groups[testKey]) {
        groups[testKey] = {};
      }
      
      const parameterKey = range.parameter_name;
      if (!groups[testKey][parameterKey]) {
        groups[testKey][parameterKey] = [];
      }
      
      groups[testKey][parameterKey].push(range);
      return groups;
    }, {});
  }, [referenceRanges, searchTerm, selectedLabTest, sortBy, sortOrder]);

  // Get unique lab tests for filter
  const uniqueLabTests = React.useMemo(() => {
    if (!referenceRanges) return [];
    return [...new Set(referenceRanges.map(range => range.lab_test_details.lab_test))];
  }, [referenceRanges]);

  // Pagination for grouped data
  const groupedEntries = Object.entries(groupedRanges);
  const totalPages = Math.ceil(groupedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGroups = groupedEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleBulkUpload = () => {
    if (!file) return alert("Please select an Excel file to upload.");
    const formData = new FormData();
    formData.append("file", file);
    dispatch(bulkUploadReferenceRanges(formData)).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(fetchReferenceRanges());
        setFile(null);
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this reference range?")) {
      dispatch(deleteReferenceRange(id)).then(() => dispatch(fetchReferenceRanges()));
    }
  };

  const toggleTestExpansion = (testKey) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testKey)) {
      newExpanded.delete(testKey);
    } else {
      newExpanded.add(testKey);
    }
    setExpandedTests(newExpanded);
  };

  const toggleParameterExpansion = (parameterKey) => {
    const newExpanded = new Set(expandedParameters);
    if (newExpanded.has(parameterKey)) {
      newExpanded.delete(parameterKey);
    } else {
      newExpanded.add(parameterKey);
    }
    setExpandedParameters(newExpanded);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLabTest("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                <ListIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reference Ranges</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage laboratory test reference ranges and parameters
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
          
              <div className="flex items-center gap-2">
              {isLabTech(user) && (
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".xlsx,.xls"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    {file ? file.name.substring(0, 20) + '...' : 'Choose File'}
                  </label>
                  <button
                  onClick={handleBulkUpload}
                  disabled={!file}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload Excel
                </button>
                <button
                onClick={() => navigate("/labs/add-reference-range")}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Reference Range
              </button>
                </div>
              )}
                
               
              </div>
              
             
            </div>
            
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by test name, parameter, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Lab Test Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lab Test
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedLabTest}
                  onChange={(e) => setSelectedLabTest(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                >
                  <option value="">All Lab Tests</option>
                  {uniqueLabTests.map(test => (
                    <option key={test} value={test}>{test}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items per page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Reset Filters
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {currentGroups.length} of {groupedEntries.length} lab tests
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading reference ranges...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Grouped Results */}
            <div className="space-y-4">
              {currentGroups.length > 0 ? (
                currentGroups.map(([testKey, parameters]) => (
                  <div key={testKey} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Test Header */}
                    <button
                      onClick={() => toggleTestExpansion(testKey)}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testKey}</h3>
                        <span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          {Object.keys(parameters).length} parameters
                        </span>
                      </div>
                      {expandedTests.has(testKey) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {/* Parameters Content */}
                    {expandedTests.has(testKey) && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        {Object.entries(parameters).map(([parameterName, ranges], paramIndex) => {
                          const parameterKey = `${testKey}-${parameterName}`;
                          return (
                            <div key={parameterKey} className={`${paramIndex > 0 ? 'border-t border-gray-100 dark:border-gray-600' : ''}`}>
                              {/* Parameter Header */}
                              <button
                                onClick={() => toggleParameterExpansion(parameterKey)}
                                className="w-full px-6 py-3 bg-gray-25 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-4 h-4 mr-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{parameterName}</h4>
                                  <span className="ml-3 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                                    {ranges.length} ranges
                                  </span>
                                </div>
                                {expandedParameters.has(parameterKey) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </button>

                              {/* Parameter Ranges Table */}
                              {expandedParameters.has(parameterKey) && (
                                <div className="overflow-x-auto bg-white dark:bg-gray-800">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age Range</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference Range</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                      {ranges.map((range, index) => (
                                        <tr key={range.id} className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                              {range.min_age_months} - {range.max_age_months} months
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              range.gender === 'M' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                              range.gender === 'F' ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' :
                                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                            }`}>
                                              {range.gender || 'Both'}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                              {range.textual_reference || `${range.min_value} - ${range.max_value}`}
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                                              {range.unit}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                              {range.notes || '-'}
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                              <button
                                                onClick={() => navigate(`/reference-ranges/${range.id}`)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
                                                title="View"
                                              >
                                                <Eye className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => navigate(`/labs/edit-reference-range/${range.id}`)}
                                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors duration-200"
                                                title="Edit"
                                              >
                                                <Edit3 className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={() => handleDelete(range.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                                                title="Delete"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <ListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reference ranges found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || selectedLabTest ? 'Try adjusting your filters or search terms.' : 'Get started by adding your first reference range.'}
                  </p>
                  <button
                    onClick={() => navigate("/reference-ranges/create")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reference Range
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {currentPage} of {totalPages} ({groupedEntries.length} total lab tests)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReferenceRangeList;