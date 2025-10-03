// src/children/EditChild.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateChild,
  fetchChildById,
  fetchParents,
  clearSelectedChild
} from '../store/children/childManagementSlice';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditChild() {
  const { childId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { parents, loading, error, selectedChild } = useSelector(
    state => state.childManagement
  );

  const [childData, setChildData] = useState({
    primary_guardian: '',
    secondary_guardian: '',
    relationship_to_primary_guardian: '',
    relationship_to_secondary_guardian: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    profile_picture: null,
    date_of_birth: '',
    gender: 'M',
    email: '',
    blood_group: 'A+',
    birth_weight: '',
    birth_height: '',
    current_weight: '',
    current_height: '',
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    vaccination_status: '',
    school: '',
    grade: '',
    teacher_name: '',
    school_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    insurance_provider: '',
    insurance_id: '',
    medical_history: '',
    surgical_history: '',
    family_medical_history: '',
    developmental_notes: '',
    special_needs: '',
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch child & parents on mount
  useEffect(() => {
    dispatch(fetchParents());
    dispatch(fetchChildById(childId));
    return () => {
      dispatch(clearSelectedChild());
    };
  }, [dispatch, childId]);

  // When selectedChild arrives, populate form
  useEffect(() => {
    if (selectedChild && selectedChild.id === Number(childId)) {
      setChildData({
        primary_guardian: selectedChild.primary_guardian || '',
        secondary_guardian: selectedChild.secondary_guardian || '',
        relationship_to_primary_guardian: selectedChild.relationship_to_primary_guardian || '',
        relationship_to_secondary_guardian: selectedChild.relationship_to_secondary_guardian || '',
        first_name: selectedChild.first_name || '',
        middle_name: selectedChild.middle_name || '',
        last_name: selectedChild.last_name || '',
        profile_picture: null,
        date_of_birth: selectedChild.date_of_birth || '',
        gender: selectedChild.gender || 'M',
        email: selectedChild.email || '',
        blood_group: selectedChild.blood_group || 'A+',
        birth_weight: selectedChild.birth_weight || '',
        birth_height: selectedChild.birth_height || '',
        current_weight: selectedChild.current_weight || '',
        current_height: selectedChild.current_height || '',
        allergies: selectedChild.allergies || '',
        chronic_conditions: selectedChild.chronic_conditions || '',
        current_medications: selectedChild.current_medications || '',
        vaccination_status: selectedChild.vaccination_status || '',
        school: selectedChild.school || '',
        grade: selectedChild.grade || '',
        teacher_name: selectedChild.teacher_name || '',
        school_phone: selectedChild.school_phone || '',
        emergency_contact_name: selectedChild.emergency_contact_name || '',
        emergency_contact_phone: selectedChild.emergency_contact_phone || '',
        emergency_contact_relationship: selectedChild.emergency_contact_relationship || '',
        insurance_provider: selectedChild.insurance_provider || '',
        insurance_id: selectedChild.insurance_id || '',
        medical_history: selectedChild.medical_history || '',
        surgical_history: selectedChild.surgical_history || '',
        family_medical_history: selectedChild.family_medical_history || '',
        developmental_notes: selectedChild.developmental_notes || '',
        special_needs: selectedChild.special_needs || '',
      });
      
      // Set existing profile picture if available
      if (selectedChild.profile_picture) {
        setImagePreview(selectedChild.profile_picture);
      }
    }
  }, [selectedChild, childId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!childData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!childData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!childData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!childData.primary_guardian) newErrors.primary_guardian = 'Primary guardian is required';
    
    if (childData.email && !/\S+@\S+\.\S+/.test(childData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      setChildData(prev => ({ ...prev, [name]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = e => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setChildData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData();
    Object.entries(childData).forEach(([k, v]) => {
      if (v !== '' && v != null) formData.append(k, v);
    });
    
    try {
      await dispatch(updateChild({ childId, updatedData: formData })).unwrap();
      navigate('/children');
    } catch (err) {
      console.error('Failed to update child:', err);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'guardians', label: 'Guardians', icon: '👨‍👩‍👧‍👦' },
    { id: 'health', label: 'Health Info', icon: '🏥' },
    { id: 'school', label: 'School Info', icon: '🎓' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'additional', label: 'Additional', icon: '📋' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const relationships = ['Parent', 'Guardian', 'Grandparent', 'Aunt/Uncle', 'Sibling', 'Other'];

  if (loading && !selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading child information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Child Profile</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Update {selectedChild?.first_name || 'child'}'s information
                </p>
              </div>
              <button
                onClick={() => navigate('/children')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="px-6 py-4">
            <nav className="flex space-x-1 overflow-x-auto">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300">
                Error: {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            
            {/* Basic Information */}
            {activeSection === 'basic' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  Basic Information
                </h3>
                
                {/* Profile Picture */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          dark:file:bg-blue-900/50 dark:file:text-blue-300
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-900/70
                          file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    { field: 'first_name', label: 'First Name', required: true },
                    { field: 'middle_name', label: 'Middle Name', required: false },
                    { field: 'last_name', label: 'Last Name', required: true }
                  ].map(({ field, label, required }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={childData[field]}
                        onChange={handleChange}
                        required={required}
                        className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                          bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                          ${errors[field] ? 'border-red-500 focus:ring-red-500' : ''}
                        `}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                      {errors[field] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* DOB, Gender, Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={childData.date_of_birth}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white
                        ${errors.date_of_birth ? 'border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date_of_birth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={childData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={childData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                      `}
                      placeholder="child@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guardian Information */}
            {activeSection === 'guardians' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">👨‍👩‍👧‍👦</span>
                  Guardian Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Guardian <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="primary_guardian"
                      value={childData.primary_guardian}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white
                        ${errors.primary_guardian ? 'border-red-500 focus:ring-red-500' : ''}
                      `}
                    >
                      <option value="">Select primary guardian</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.first_name || p.last_name
                            ? `${p.first_name || ''} ${p.last_name || ''}`.trim()
                            : `User #${p.user}`}
                        </option>
                      ))}
                    </select>
                    {errors.primary_guardian && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.primary_guardian}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secondary Guardian
                    </label>
                    <select
                      name="secondary_guardian"
                      value={childData.secondary_guardian}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      <option value="">Select secondary guardian</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.first_name || p.last_name
                            ? `${p.first_name || ''} ${p.last_name || ''}`.trim()
                            : `User #${p.user}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship to Primary Guardian
                    </label>
                    <select
                      name="relationship_to_primary_guardian"
                      value={childData.relationship_to_primary_guardian}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      <option value="">Select relationship</option>
                      {relationships.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship to Secondary Guardian
                    </label>
                    <select
                      name="relationship_to_secondary_guardian"
                      value={childData.relationship_to_secondary_guardian}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      <option value="">Select relationship</option>
                      {relationships.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Health Information */}
            {activeSection === 'health' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">🏥</span>
                  Health Information
                </h3>
                
                {/* Blood Group and Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Blood Group
                    </label>
                    <select
                      name="blood_group"
                      value={childData.blood_group}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="current_weight"
                      value={childData.current_weight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 25.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="current_height"
                      value={childData.current_height}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 120.5"
                    />
                  </div>
                </div>

                {/* Birth Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Birth Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="birth_weight"
                      value={childData.birth_weight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 3.2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Birth Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="birth_height"
                      value={childData.birth_height}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 50.0"
                    />
                  </div>
                </div>

                {/* Health Text Areas */}
                <div className="space-y-6">
                  {[
                    { field: 'allergies', label: 'Allergies', placeholder: 'List any known allergies...' },
                    { field: 'chronic_conditions', label: 'Chronic Conditions', placeholder: 'List any chronic conditions...' },
                    { field: 'current_medications', label: 'Current Medications', placeholder: 'List current medications and dosages...' },
                    { field: 'vaccination_status', label: 'Vaccination Status', placeholder: 'Vaccination records and status...' },
                    { field: 'medical_history', label: 'Medical History', placeholder: 'Previous medical conditions, treatments...' },
                    { field: 'surgical_history', label: 'Surgical History', placeholder: 'Any surgeries or procedures...' },
                    { field: 'family_medical_history', label: 'Family Medical History', placeholder: 'Relevant family medical history...' }
                  ].map(({ field, label, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {label}
                      </label>
                      <textarea
                        name={field}
                        value={childData[field]}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                          bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                          resize-vertical"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* School Information */}
            {activeSection === 'school' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  School Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={childData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter school name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade/Class
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={childData.grade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., Grade 5, Class A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      name="teacher_name"
                      value={childData.teacher_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter teacher's name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      School Phone
                    </label>
                    <input
                      type="tel"
                      name="school_phone"
                      value={childData.school_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {activeSection === 'emergency' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">🚨</span>
                  Emergency Contact & Insurance
                </h3>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                      Emergency contact information is crucial for child safety
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={childData.emergency_contact_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={childData.emergency_contact_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relationship
                    </label>
                    <select
                      name="emergency_contact_relationship"
                      value={childData.emergency_contact_relationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white"
                    >
                      <option value="">Select relationship</option>
                      {relationships.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    Insurance Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Insurance Provider
                      </label>
                      <input
                        type="text"
                        name="insurance_provider"
                        value={childData.insurance_provider}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                          bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Insurance company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Insurance ID
                      </label>
                      <input
                        type="text"
                        name="insurance_id"
                        value={childData.insurance_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                          bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Policy/Member ID"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {activeSection === 'additional' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">📋</span>
                  Additional Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Developmental Notes
                    </label>
                    <textarea
                      name="developmental_notes"
                      value={childData.developmental_notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        resize-vertical"
                      placeholder="Developmental milestones, progress notes, behavioral observations..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Special Needs
                    </label>
                    <textarea
                      name="special_needs"
                      value={childData.special_needs}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all
                        bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        resize-vertical"
                      placeholder="Any special needs, accommodations, or important care instructions..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                All changes will be saved automatically
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/children')}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                    rounded-lg font-medium border border-gray-300 dark:border-gray-600
                    hover:bg-gray-200 dark:hover:bg-gray-600 
                    focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    transition-colors duration-200
                    flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600
                    text-white rounded-lg font-medium
                    hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg hover:shadow-xl
                    flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}