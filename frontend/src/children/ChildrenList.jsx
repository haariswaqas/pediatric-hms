// src/children/ChildList.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, deleteChild } from '../store/children/childManagementSlice';
import { bulkUploadChildren } from '../store/children/childManagementSlice';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Edit2, User, Filter, ChevronDown, BarChart2, List, FileText, UploadCloud, XCircle,
  Grid, PieChart, Calendar, Droplet, School, Activity, 
  Search, X, AlertCircle, ChevronRight, Plus
} from 'lucide-react';
import ChildSearch from './ChildSearch';
import StatisticsOverview from './components/StatisticsOverview';
import GenderDistribution from './components/GenderDistribution';
import AgeDistribution from './components/AgeDistribution';
import BloodGroupDistribution from './components/BloodGroupDistribution';
import { isAdmin } from '../utils/roles';


import ConfirmationModal from '../utils/ConfirmationModal';
import {toast} from 'react-toastify';
export default function ChildList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user} = useSelector((state) => state.auth)
  const { children, loading, error } = useSelector(state => state.childManagement);
  const [delConfirm, setDelConfirm] = useState({ show: false, id: null });
  const [filteredChildren, setFilteredChildren] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    bloodGroup: '',
    vaccinationStatus: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    confirmText: '',
    variant: 'primary'
  });
  const [activePatient, setActivePatient] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    childName: ''
  });

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const bookAppointment = (childId) => {
    navigate(`/appointments/add/${childId}`);
  };

  const addDiagnosis = (childId) => {
    navigate(`/diagnosis/add/${childId}`);
  };
  const addAdmission = (childId) => {
    navigate(`/admissions/add/${childId}`);
  }

  const addVaccinationRecord = (childId) => {
    navigate(`/vaccines/vaccination-records/add/${childId}`);
  };

  const confirmDelete = (id, name) => {
    setDeleteModal({ show: true, id, childName: name });
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, childName: '' });
  };

  const handleDelete = () => {
    dispatch(deleteChild(deleteModal.id)).unwrap()
      .then(() => {
        // Refresh the children list after successful deletion
        dispatch(fetchChildren());
        toast.success(`Successfully deleted patient from the system`);
      })
      .catch((error) => {
        console.error('Error deleting child:', error);
        toast.error('Failed to delete patient. Please try again.');
      })
      .finally(() => {
        setDeleteModal({ show: false, id: null, childName: '' });
      });
  };

  const handleSearchResults = (results) => {
    setFilteredChildren(results);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (childrenList) => {
    if (!childrenList) return [];
    
    return childrenList.filter(child => {
      // Gender filter
      if (filters.gender && child.gender !== filters.gender) return false;
      
      // Blood group filter
      if (filters.bloodGroup && child.blood_group !== filters.bloodGroup) return false;
      
     
      
      // Age range filter
      if (filters.ageRange) {
        const age = parseInt(child.age);
        if (filters.ageRange === '0-2' && (age < 0 || age > 2)) return false;
        if (filters.ageRange === '3-5' && (age < 3 || age > 5)) return false;
        if (filters.ageRange === '6-12' && (age < 6 || age > 12)) return false;
        if (filters.ageRange === '13-18' && (age < 13 || age > 18)) return false;
      }
      
      return true;
    });
  };

  const handlePatientQuickView = (patient) => {
    setActivePatient(patient);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
    setTimeout(() => setActivePatient(null), 300); // Clear after animation
  };

  // Get blood group badge color
  const getBloodGroupColor = (bloodGroup) => {
    switch (bloodGroup) {
      case 'A+': return 'bg-red-100 text-red-800';
      case 'A-': return 'bg-red-100 text-red-800';
      case 'B+': return 'bg-blue-100 text-blue-800';
      case 'B-': return 'bg-blue-100 text-blue-800';
      case 'AB+': return 'bg-purple-100 text-purple-800';
      case 'AB-': return 'bg-purple-100 text-purple-800';
      case 'O+': return 'bg-green-100 text-green-800';
      case 'O-': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine which list of children to display
  const baseChildren = filteredChildren || children;
  const displayedChildren = applyFilters(baseChildren);

  const onSelectFile = (e) => {
      const selected = e.target.files[0];
      if (selected && /\.(xls|xlsx)$/i.test(selected.name)) {
        setFile(selected);
      } else {
        toast.error("Please select a valid Excel file (.xls or .xlsx)");
        e.target.value = null;
        setFile(null);
      }
    };
  
    const handleBulkUpload = async () => {
      if (!file) {
        return toast.error("No file selected. Please choose an Excel file.");
      }
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const action = await dispatch(bulkUploadChildren(formData));
      setUploading(false);
      if (action.meta.requestStatus === 'fulfilled') {
        toast.success("Patients uploaded successfully!");
        dispatch(fetchChildren());
        setFile(null);
        fileInputRef.current.value = null;
      } else {
        toast.error(action.payload || "Upload failed. Please try again.");
      }
    };
  

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-white dark:to-black text-black p-6 shadow-md dark:from-gray-60 dark:text-white">

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
              <p className="text-blue-100 mt-1">Manage and view patient information</p>
            </div>
            <div className="flex gap-2">
              
            <Link
                to="/children/add"
                className="bg-white text-blue-700 hover:bg-white dark:to-black px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors"
              >
                <Plus size={18} className="mr-1" /> New Patient
              </Link>
              
              {isAdmin(user) && (
  <>
    {/* Excel file input */}
    <label className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer transition">
      <FileText className="h-5 w-5 mr-2" />
      <span>{file?.name || "Select Excel File"}</span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={onSelectFile}
        className="hidden"
      />
    </label>

    {/* Upload Excel button */}
    <button
      onClick={handleBulkUpload}
      disabled={!file || uploading}
      className={`px-4 py-2 rounded-md flex items-center transition ${
        file && !uploading
          ? "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 text-white"
          : "bg-gray-300 text-gray-600 cursor-not-allowed"
      }`}
    >
      {uploading ? (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      ) : (
        <UploadCloud className="h-5 w-5 mr-2" />
      )}
      <span>{uploading ? "Uploading..." : "Upload Excel"}</span>
    </button>

    {file && (
      <button
        onClick={() => {
          setFile(null);
          fileInputRef.current.value = null;
        }}
        className="text-red-600 dark:text-red-400 ml-2"
      >
        <XCircle className="h-5 w-5" title="Clear file selection" />
      </button>
    )}
  </>
)}

            </div>
            
            
          </div>
          
          {/* Search bar - moved to header for prominence */}
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 right-50 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-blue-300" />
            </div>
            <ChildSearch 
              onSearchResults={handleSearchResults} 
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 text-white placeholder-blue-200 border-0 focus:ring-2 focus:ring-black focus:bg-white/20 focus:outline-none"
              placeholderClassName="text-black-200"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* View toggle and filters row */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm flex">
              <button 
                onClick={() => setView('table')} 
                className={`p-2 rounded-md transition-colors ${view === 'table' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                aria-label="Table view"
              >
                <List size={20} />
              </button>
           
  
              <button 
                onClick={() => setView('grid')} 
                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                aria-label="Grid view"
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setView('analytics')} 
                className={`p-2 rounded-md transition-colors ${view === 'analytics' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                aria-label="Analytics view"
              >
                <BarChart2 size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${showFilters ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} shadow-sm transition-colors`}
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {displayedChildren && (
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 text-sm font-medium">
              {displayedChildren.length} {displayedChildren.length === 1 ? 'patient' : 'patients'}
            </div>
          )}
        </div>
        
        {/* Active filters */}
        {Object.values(filters).some(v => v) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.gender && (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-3 py-1 rounded-full flex items-center">
                Gender: {filters.gender === 'M' ? 'Male' : filters.gender === 'F' ? 'Female' : 'Other'}
                <button onClick={() => setFilters(prev => ({ ...prev, gender: '' }))} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.ageRange && (
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-3 py-1 rounded-full flex items-center">
                Age: {filters.ageRange} years
                <button onClick={() => setFilters(prev => ({ ...prev, ageRange: '' }))} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.bloodGroup && (
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-3 py-1 rounded-full flex items-center">
                Blood: {filters.bloodGroup}
                <button onClick={() => setFilters(prev => ({ ...prev, bloodGroup: '' }))} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
           
            
            <button
              onClick={() => setFilters({
                gender: '',
                ageRange: '',
                bloodGroup: '',
               
              })}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
        
        {/* Filter panel */}
  
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md mb-6 border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">All genders</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age Range</label>
                <select
                  id="ageRange"
                  name="ageRange"
                  value={filters.ageRange}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">All ages</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-12">6-12 years</option>
                  <option value="13-18">13-18 years</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">All blood groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
        
            </div>
          </div>
        )}

        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-md mb-6" role="alert">
            <div className="flex items-center mb-2">
              <AlertCircle size={20} className="mr-2" />
              <p className="font-bold">Error loading patients</p>
            </div>
            <p className="text-sm">{JSON.stringify(error)}</p>
          </div>
        )}

        {/* Main content based on view */}
        {!loading && !error && (
          <>
            {/* Table View - Improved */}
            {view === 'table' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age & DOB</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blood Group</th>


                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {displayedChildren && displayedChildren.length > 0 ? (
                        displayedChildren.map(c => (
                          <tr
                            key={c.id}
                            className="group hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => handlePatientQuickView(c)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                {c.profile_picture ? (
                                  <img 
                                    src={c.profile_picture} 
                                    alt={`${c.first_name} ${c.last_name}`} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-white dark:to-black flex items-center justify-center text-white shadow">
                                    <User size={16} />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {c.first_name} {c.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                                      c.gender === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                      c.gender === 'F' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' : 
                                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    }`}>
                                      {c.gender === 'M' ? 'Male' : c.gender === 'F' ? 'Female' : 'Other'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{c.age} years</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Calendar size={14} className="mr-1" /> {c.date_of_birth}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(c.blood_group)}`}>
                                  <Droplet size={12} className="mr-1" /> {c.blood_group}
                                </span>
                                
                                {c.vaccination_status && (
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getVaccinationStatusColor(c.vaccination_status)}`}>
                                    <Activity size={12} className="mr-1" /> {c.vaccination_status}
                                  </span>
                                )}
                              </div>
                            </td>
                        
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/children/edit/${c.id}`);
                                  }}
                                  className="inline-flex items-center p-2 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800 rounded-full transition-colors"
                                  aria-label="Edit patient"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(c.id);
                                  }}
                                  className="inline-flex items-center p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 rounded-full transition-colors"
                                  aria-label="Delete patient"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/children/child/${c.id}`);
                                  }}
                                  className="inline-flex items-center p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 rounded-full transition-colors"
                                  aria-label="View patient details"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            {filteredChildren !== null ? (
                              <div className="flex flex-col items-center">
                                <Search size={36} className="mb-2 text-gray-400" />
                                <p className="text-lg font-medium">No matching patients found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <User size={36} className="mb-2 text-gray-400" />
                                <p className="text-lg font-medium">No patients available</p>
                                <p className="text-sm">Start by adding new patients</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View - Modernized Card Layout */}
            {view === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedChildren && displayedChildren.length > 0 ? (
                  displayedChildren.map(c => (
                    <div 
                      key={c.id} 
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => handlePatientQuickView(c)}
                    >
                      <div className="h-28 bg-gradient-to-r from-blue-500 to-white dark:to-black relative">
                        {c.profile_picture ? (
                          <img 
                            src={c.profile_picture} 
                            alt={`${c.first_name} ${c.last_name}`} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <User size={48} className="text-white/70" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex space-x-1">
                        <button
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/children/edit/${c.id}`);
  }}
  className="p-1.5 bg-blue-400 dark:bg-gray-700/30 hover:bg-blue-600 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 rounded-full transition-colors"
  aria-label="Edit patient"
>
  <Edit2 size={14} />
</button>
<button
  onClick={(e) => {
    e.stopPropagation();
    confirmDelete(c.id);
  }}
  className="p-1.5 bg-red-400/30 dark:bg-gray-700/30 hover:bg-red-500/50 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 rounded-full transition-colors"
  aria-label="Delete patient"
>
  <Trash2 size={14} />
</button>

                               
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{c.first_name} {c.last_name}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            c.gender === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                            c.gender === 'F' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' : 
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            <User size={12} className="mr-1" />
                            {c.gender === 'M' ? 'Male' : c.gender === 'F' ? 'Female' : 'Other'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(c.blood_group)}`}>
                            <Droplet size={12} className="mr-1" />
                            {c.blood_group}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-gray-500" />
                            <span>{c.age} years ({c.date_of_birth})</span>
                          </div>
                          
                          {c.school && (
                            <div className="flex items-center">
                              <School size={14} className="mr-2 text-gray-500" />
                              <span className="truncate">{c.school}</span>
                            </div>
                          )}
                          
                        </div>
                        
                        <Link
                          to={`/children/child/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          View Details
                          <ChevronRight size={16} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
                    {filteredChildren !== null ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full p-3 mb-4">
                          <Search size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No matching patients found</h3>
                        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full p-3 mb-4">
                          <User size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No patients available</h3>
                        <p className="text-gray-600 dark:text-gray-400">Get started by adding your first patient</p>
                        <Link
                          to="/children/add"
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors"
                        >
                          <Plus size={18} className="mr-1" /> Add Patient
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Analytics View - Keep as is with minor styling improvements */}
            {view === 'analytics' && (
              <>
                {displayedChildren && displayedChildren.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                      <StatisticsOverview children={displayedChildren} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                          <User size={18} className="mr-2 text-blue-600" />
                          Gender Distribution
                        </h3>
                        <GenderDistribution children={displayedChildren} />
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                          <Calendar size={18} className="mr-2 text-green-600" />
                          Age Distribution
                        </h3>
                        <AgeDistribution children={displayedChildren} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                          <Droplet size={18} className="mr-2 text-red-600" />
                          Blood Group Distribution
                        </h3>
                        <BloodGroupDistribution children={displayedChildren} />
                      </div>
                      
                   
                    </div>
                    
                   
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full p-3 mb-4">
                        <BarChart2 size={24} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No data to analyze</h3>
                      <p className="text-gray-600 dark:text-gray-400">Add patients to view analytics and statistics</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Patient Quick View Modal */}
        {showQuickView && activePatient && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={closeQuickView}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div 
                className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-12 sm:align-middle sm:max-w-3xl sm:w-full animate-slideIn`}
              >
                <div className="absolute top-0 right-0 pt-6 pr-6">
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={closeQuickView}
                  >
                    <span className="sr-only">Close</span>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="h-40 bg-gradient-to-r from-blue-500 to-white dark:to-black flex justify-center items-center">
                  {activePatient.profile_picture ? (
                    <img 
                      src={activePatient.profile_picture} 
                      alt={`${activePatient.first_name} ${activePatient.last_name}`} 
                      className="h-28 w-28 rounded-full object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center text-blue-600">
                      <User size={48} />
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white" id="modal-title">
                      {activePatient.first_name} {activePatient.last_name}
                    </h3>
                    <div className="flex justify-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        activePatient.gender === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                        activePatient.gender === 'F' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' : 
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {activePatient.gender === 'M' ? 'Male' : activePatient.gender === 'F' ? 'Female' : 'Other'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(activePatient.blood_group)}`}>
                        {activePatient.blood_group}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Age</div>
                      <div className="font-medium text-gray-900 dark:text-white">{activePatient.age} years</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Birth Date</div>
                      <div className="font-medium text-gray-900 dark:text-white">{activePatient.date_of_birth}</div>
                    </div>
                    {activePatient.school && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg col-span-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">School</div>
                        <div className="font-medium text-gray-900 dark:text-white">{activePatient.school}</div>
                      </div>
                    )}
                    {activePatient.vaccination_status && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg col-span-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Vaccination Status</div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            activePatient.vaccination_status.includes('Complete') ? 'bg-green-500' :
                            activePatient.vaccination_status.includes('Partial') ? 'bg-yellow-500' :
                            activePatient.vaccination_status.includes('Pending') ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}></span>
                          {activePatient.vaccination_status}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-8 border-t pt-6 space-x-3 w-full">
                    
                    <button
                      type="button"
                      onClick={() => {
                        closeQuickView();
                        navigate(`/children/edit/${activePatient.id}`);
                      }}
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    >
                      <Edit2 size={16} className="mr-1" />
                      Edit
                    </button>
                                        <button
                        onClick={() => bookAppointment(activePatient.id)}
                        className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Schedule Appointment
                      </button>
                      <button
                        onClick={() => addDiagnosis(activePatient.id)}
                        className="inline-flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Diagnose
                      </button>
                      <button
                        onClick={() => addAdmission(activePatient.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Admit
                      </button>
                      <button
                        onClick={() => addVaccinationRecord(activePatient.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        Vaccinate
                      </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeQuickView();
                        navigate(`/children/child/${activePatient.id}`);
                      }}
                      className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                    >
                      View Full Profile
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
      <ConfirmationModal
        show={deleteModal.show}
        title="Delete Patient"
        message={`Are you sure you want to delete this patient and all their medical records? This action cannot be undone.`}
        onConfirm={handleDelete}
        onClose={cancelDelete}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}