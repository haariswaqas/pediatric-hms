// src/children/AddPatient.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChild, fetchParents } from '../store/children/childManagementSlice';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, Save, X, Camera } from 'lucide-react';
import { FieldWithHelper } from './form-components/FieldWithHelper';
import { FormSection, steps } from './form-components/FormSection';
import { FormStepIndicator } from './form-components/FormStepIndicator';
import { bloodGroups } from './form-components/bloodGroups';
import { useChildData } from './form-components/useChildData';
import { calculateBMI, calculateAge } from './form-components/utils/utils';
import { isParent } from '../utils/roles';
export default function AddPatient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { parents, loading, error } = useSelector(state => state.childManagement);
  const [currentStep, setCurrentStep] = useState(0);
  const [childData, setChildData] = useChildData();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

 useEffect(() => {
  if (isParent(user)) {
    console.log('not fetching parents since a parent is logged in');
  } else {
    dispatch(fetchParents()); }
 }, [dispatch, user]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      setChildData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setChildData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  

  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (currentStep === 0) {
      if (!childData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!childData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!childData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!childData.primary_guardian) newErrors.primary_guardian = 'Primary guardian is required';
    }
    else if (currentStep === 1) { 
      if (!childData.blood_group) newErrors.blood_group = 'Blood group is required';
    }
    else if (currentStep === 2) {
      if (!childData.emergency_contact_name) newErrors.emergency_contact_name = 'Emergency contact name is required';
      if (!childData.emergency_contact_phone) newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;

    // use FormData to include file upload
    const formData = new FormData();
    Object.entries(childData).forEach(([key, val]) => {
      if (val !== '' && val != null) formData.append(key, val);
    });

    try {
      await dispatch(createChild(formData)).unwrap();
      navigate('/children');
    } catch (err) {
      console.error('Failed to create patient record:', err);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to submit form. Please try again.'
      }));
    }
  };

  const patientAge = calculateAge(childData.date_of_birth);
  const bmi = calculateBMI();

  return (
    <div className="max-w-8xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Form header */}
        <div className="bg-blue-600 dark:bg-blue-800 p-6 text-white">
          <div className="flex justify-between items-center">
            {!isParent(user) && (
              <h2 className="text-2xl font-bold">New Patient Registration</h2>
            )}
            {isParent(user) && (
              <h2 className="text-2xl font-bold">Add Child</h2>
            )}
            <button 
              type="button" 
              onClick={() => navigate('/children')}
              className="p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded-full"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>
          {isParent(user) && (
            <p className="mt-1 text-blue-100">Complete the form below to register your child as a patient</p>
          )}
          {!isParent(user) && (
            <p className="mt-1 text-blue-100">Complete the form below to register a new patient</p>
          )}
        </div>
        
        <div className="p-6">
          {/* Global error message */}
          {(error || errors.form) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-start">
              <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium">There was an error with your submission</p>
                <p className="text-sm">{error || errors.form}</p>
              </div>
            </div>
          )}
          
          {/* Progress steps */}
          <FormStepIndicator currentStep={currentStep} steps={steps} />
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <>
                <FormSection 
                  title="Patient Identification" 
                  description="Enter the patient's basic personal information"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldWithHelper 
                      label="First Name" 
                      id="first_name" 
                      required
                    >
                      <input 
                        id="first_name"
                        name="first_name" 
                        value={childData.first_name}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      />
                      {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Middle Name" 
                      id="middle_name"
                    >
                      <input 
                        id="middle_name"
                        name="middle_name" 
                        value={childData.middle_name}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Last Name" 
                      id="last_name"
                      required
                    >
                      <input 
                        id="last_name"
                        name="last_name" 
                        value={childData.last_name}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      />
                      {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                    </FieldWithHelper>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FieldWithHelper 
                      label="Date of Birth" 
                      id="date_of_birth"
                      required
                      helperText="Enter the patient's full date of birth"
                    >
                      <input 
                        type="date" 
                        id="date_of_birth"
                        name="date_of_birth" 
                        value={childData.date_of_birth}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      />
                      {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                      {childData.date_of_birth && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Age: {patientAge} {patientAge === 1 ? 'year' : 'years'}
                        </p>
                      )}
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Gender" 
                      id="gender"
                      required
                    >
                      <select 
                        id="gender"
                        name="gender" 
                        value={childData.gender}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                        <option value="U">Prefer not to say</option>
                      </select>
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Email" 
                      id="email"
                      helperText="Patient's email or parent's email for minors"
                    >
                      <input 
                        type="email" 
                        id="email"
                        name="email" 
                        value={childData.email}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                  </div>
                  
                  <FieldWithHelper 
                    label="Profile Picture" 
                    id="profile_picture"
                    helperText="Upload a recent photo of the patient"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {photoPreview ? (
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <img 
                              src={photoPreview} 
                              alt="Patient preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <Camera size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file"
                          id="profile_picture" 
                          name="profile_picture" 
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden" 
                        />
                        <label 
                          htmlFor="profile_picture"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Choose Photo
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          JPEG, PNG or GIF, max 5MB
                        </p>
                      </div>
                    </div>
                  </FieldWithHelper>
                </FormSection>
                {!isParent(user )}
                <FormSection 
                  title="Guardian Information" 
                  description="Specify the patient's guardian(s) and relationships"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
{!isParent(user) && (
  <FieldWithHelper 
  label="Primary Guardian" 
  id="primary_guardian"
  required
  helperText="The main responsible person for this patient"
>
  <select
    id="primary_guardian"
    name="primary_guardian"
    value={childData.primary_guardian}
    onChange={handleChange}
    className={`w-full p-2 border rounded-md ${
      errors.primary_guardian ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } bg-white dark:bg-gray-700`}
  >
    <option value="">Select primary guardian</option>
    {parents.map(p => (
      <option key={p.id} value={p.id}>
        {p.first_name || p.middle_name || p.last_name
          ? `${p.first_name || ""} ${p.middle_name || ""} ${p.last_name || ""}`.trim()
          : `Guardian #${p.user}`}
      </option>
    ))}
  </select>

  {errors.primary_guardian && <p className="text-red-500 text-sm mt-1">{errors.primary_guardian}</p>}
  </FieldWithHelper>

)}


                    
                {isParent(user) && (
 <FieldWithHelper 
                    
 label="Your relationship with child" 
 id="relationship_to_primary_guardian"
 helperText="E.g., Parent, Grandparent, Legal Guardian"
>
 <input 
   id="relationship_to_primary_guardian"
   name="relationship_to_primary_guardian" 
   value={childData.relationship_to_primary_guardian}
   onChange={handleChange} 
   placeholder="E.g., Parent, Grandparent"
   className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
 />
</FieldWithHelper>
                  
                )}
                     <FieldWithHelper 
                    
                    label="Primary Guardian Relationship" 
                    id="relationship_to_primary_guardian"
                    helperText="E.g., Parent, Grandparent, Legal Guardian"
                   >
                    <input 
                      id="relationship_to_primary_guardian"
                      name="relationship_to_primary_guardian" 
                      value={childData.relationship_to_primary_guardian}
                      onChange={handleChange} 
                      placeholder="E.g., Parent, Grandparent"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                    />
                   </FieldWithHelper>
                   
                    
                    <FieldWithHelper 
                      label="Secondary Guardian" 
                      id="secondary_guardian"
                      helperText="Optional additional contact person"
                    >
                      <select
                        id="secondary_guardian"
                        name="secondary_guardian"
                        value={childData.secondary_guardian}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      >
                        <option value="">Select secondary guardian (optional)</option>
                        {parents.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.first_name || p.middle_name || p.last_name
                              ? `${p.first_name || ""} ${p.middle_name || ""} ${p.last_name || ""}`.trim()
                              : `Guardian #${p.user}`}
                          </option>
                        ))}
                      </select>
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Relationship to Secondary" 
                      id="relationship_to_secondary_guardian"
                      helperText="E.g., Parent, Grandparent, Legal Guardian"
                    >
                      <input 
                        id="relationship_to_secondary_guardian"
                        name="relationship_to_secondary_guardian" 
                        value={childData.relationship_to_secondary_guardian}
                        onChange={handleChange} 
                        placeholder="E.g., Parent, Step-parent"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                  </div>
                </FormSection>
              </>
            )}
            
            {/* Step 2: Medical History */}
            {currentStep === 1 && (
              <>
                <FormSection 
                  title="Vital Information" 
                  description="Record the patient's vital measurements and basic medical information"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldWithHelper 
                      label="Blood Group" 
                      id="blood_group"
                      required
                      helperText="Select the patient's blood type"
                    >
                      <select 
                        id="blood_group"
                        name="blood_group" 
                        value={childData.blood_group}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.blood_group ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      >
                        {bloodGroups.map(group => (
                          <option key={group.value} value={group.value}>{group.label}</option>
                        ))}
                      </select>
                      {errors.blood_group && <p className="text-red-500 text-sm mt-1">{errors.blood_group}</p>}
                    </FieldWithHelper>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FieldWithHelper 
                      label="Birth Weight (kg)" 
                      id="birth_weight"
                      helperText="Weight at birth in kilograms"
                    >
                      <input 
                        type="number" 
                        step="0.01" 
                        id="birth_weight"
                        name="birth_weight" 
                        value={childData.birth_weight}
                        onChange={handleChange} 
                        placeholder="e.g., 3.5"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Birth Height (cm)" 
                      id="birth_height"
                      helperText="Length at birth in centimeters"
                    >
                      <input 
                        type="number" 
                        step="0.1" 
                        id="birth_height"
                        name="birth_height" 
                        value={childData.birth_height}
                        onChange={handleChange} 
                        placeholder="e.g., 50"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Current Weight (kg)" 
                      id="current_weight"
                      helperText="Present weight in kilograms"
                    >
                      <input 
                        type="number" 
                        step="0.01" 
                        id="current_weight"
                        name="current_weight" 
                        value={childData.current_weight}
                        onChange={handleChange} 
                        placeholder="e.g., 25"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Current Height (cm)" 
                      id="current_height"
                      helperText="Present height in centimeters"
                    >
                      <input 
                        type="number" 
                        step="0.1" 
                        id="current_height"
                        name="current_height" 
                        value={childData.current_height}
                        onChange={handleChange} 
                        placeholder="e.g., 120"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                  </div>
                  
                  {bmi && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        <span className="font-semibold">BMI: {bmi}</span> 
                        {patientAge < 18 && " (Note: Pediatric BMI should be assessed using age-specific charts)"}
                      </p>
                    </div>
                  )}
                </FormSection>
                
                <FormSection 
                  title="Basic Medical Information" 
                  description="Document allergies, medications, and vaccination status"
                >
                  <FieldWithHelper 
                    label="Allergies" 
                    id="allergies"
                    helperText="List known allergies (medications, food, environmental)"
                  >
                    <textarea 
                      id="allergies"
                      name="allergies" 
                      value={childData.allergies}
                      onChange={handleChange} 
                      placeholder="e.g., Penicillin, peanuts, pollen"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Current Medications" 
                    id="current_medications"
                    helperText="Include dosage and frequency"
                  >
                    <textarea 
                      id="current_medications"
                      name="current_medications" 
                      value={childData.current_medications}
                      onChange={handleChange} 
                      placeholder="e.g., Albuterol inhaler 90mcg, 2 puffs every 4-6 hours as needed"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Vaccination Status" 
                    id="vaccination_status"
                    helperText="Summary of key vaccinations and dates"
                  >
                    <textarea 
                      id="vaccination_status"
                      name="vaccination_status" 
                      value={childData.vaccination_status}
                      onChange={handleChange} 
                      placeholder="e.g., DTaP (completed 4/5), MMR (complete), COVID-19 (2 doses)"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                </FormSection>
              </>
            )}
            
            {/* Step 3: Education & Emergency */}
            {currentStep === 2 && (
              <>
                <FormSection 
                  title="School Information" 
                  description="Details about the patient's educational institution"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldWithHelper 
                      label="School Name" 
                      id="school"
                    >
                      <input 
                      
                        id="school"
                        name="school" 
                        value={childData.school}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Grade/Year" 
                      id="grade"
                    >
                      <input 
                        id="grade"
                        name="grade" 
                        value={childData.grade}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Teacher Name" 
                      id="teacher_name"
                    >
                      <input 
                        id="teacher_name"
                        name="teacher_name" 
                        value={childData.teacher_name}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="School Phone" 
                      id="school_phone"
                    >
                      <input 
                        id="school_phone"
                        name="school_phone" 
                        value={childData.school_phone}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                  </div>
                </FormSection>
                
                <FormSection 
                  title="Emergency Contact Information" 
                  description="Additional contacts for emergencies"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldWithHelper 
                      label="Emergency Contact Name" 
                      id="emergency_contact_name"
                      required
                      helperText="Someone to contact if guardians cannot be reached"
                    >
                      <input 
                        id="emergency_contact_name"
                        name="emergency_contact_name" 
                        value={childData.emergency_contact_name}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.emergency_contact_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      />
                      {errors.emergency_contact_name && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>}
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Relationship to Patient" 
                      id="emergency_contact_relationship"
                    >
                      <input 
                        id="emergency_contact_relationship"
                        name="emergency_contact_relationship" 
                        value={childData.emergency_contact_relationship}
                        onChange={handleChange} 
                        placeholder="E.g., Aunt, Neighbor, Godparent"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Emergency Contact Phone" 
                      id="emergency_contact_phone"
                      required
                    >
                      <input 
                        id="emergency_contact_phone"
                        name="emergency_contact_phone" 
                        value={childData.emergency_contact_phone}
                        onChange={handleChange} 
                        className={`w-full p-2 border rounded-md ${errors.emergency_contact_phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700`}
                      />
                      {errors.emergency_contact_phone && <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>}
                    </FieldWithHelper>
                  </div>
                </FormSection>
                
                <FormSection 
                  title="Insurance Information" 
                  description="Details about the patient's health insurance"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldWithHelper 
                      label="Insurance Provider" 
                      id="insurance_provider"
                      helperText="Name of health insurance company"
                    >
                      <input 
                        id="insurance_provider"
                        name="insurance_provider" 
                        value={childData.insurance_provider}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                    
                    <FieldWithHelper 
                      label="Insurance ID" 
                      id="insurance_id"
                      helperText="Policy or member ID number"
                    >
                      <input 
                        id="insurance_id"
                        name="insurance_id" 
                        value={childData.insurance_id}
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      />
                    </FieldWithHelper>
                  </div>
                </FormSection>
              </>
            )}
            
            {/* Step 4: Detailed Medical */}
            {currentStep === 3 && (
              <>
                <FormSection 
                  title="Medical History Details" 
                  description="Comprehensive information about past and current medical conditions"
                >
                  <FieldWithHelper 
                    label="Chronic Conditions" 
                    id="chronic_conditions"
                    helperText="Any ongoing medical conditions requiring monitoring"
                  >
                    <textarea 
                      id="chronic_conditions"
                      name="chronic_conditions" 
                      value={childData.chronic_conditions}
                      onChange={handleChange} 
                      placeholder="E.g., Asthma, Diabetes, ADHD"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Medical History" 
                    id="medical_history"
                    helperText="Previous diagnoses, treatments and hospitalizations"
                  >
                    <textarea 
                      id="medical_history"
                      name="medical_history" 
                      value={childData.medical_history}
                      onChange={handleChange} 
                      placeholder="E.g., Pneumonia (2022), Ear infections (recurrent)"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Surgical History" 
                    id="surgical_history"
                    helperText="Any past surgeries with approximate dates"
                  >
                    <textarea 
                      id="surgical_history"
                      name="surgical_history" 
                      value={childData.surgical_history}
                      onChange={handleChange} 
                      placeholder="E.g., Tonsillectomy (March 2023)"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                </FormSection>
                
                <FormSection 
                  title="Family & Developmental Information" 
                  description="Information about hereditary conditions and development"
                >
                  <FieldWithHelper 
                    label="Family Medical History" 
                    id="family_medical_history"
                    helperText="Relevant hereditary conditions or diseases"
                  >
                    <textarea 
                      id="family_medical_history"
                      name="family_medical_history" 
                      value={childData.family_medical_history}
                      onChange={handleChange} 
                      placeholder="E.g., Maternal grandmother - Type 2 diabetes, Paternal uncle - asthma"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Developmental Notes" 
                    id="developmental_notes"
                    helperText="Information about developmental milestones or concerns"
                  >
                    <textarea 
                      id="developmental_notes"
                      name="developmental_notes" 
                      value={childData.developmental_notes}
                      onChange={handleChange} 
                      placeholder="E.g., Walked at 14 months, speech slightly delayed but catching up"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                  
                  <FieldWithHelper 
                    label="Special Needs" 
                    id="special_needs"
                    helperText="Any accommodations or special care requirements"
                  >
                    <textarea 
                      id="special_needs"
                      name="special_needs" 
                      value={childData.special_needs}
                      onChange={handleChange} 
                      placeholder="E.g., Needs glasses, uses inhaler, follows gluten-free diet"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" 
                      rows={3} 
                    />
                  </FieldWithHelper>
                </FormSection>
              </>
            )}

            {/* Form navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md ${
                  currentStep === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    Next Step <ChevronDown className="ml-1 rotate-270" size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Save size={16} className="mr-1" />
                    {loading ? 'Saving...' : 'Save Patient Record'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}