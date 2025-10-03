// src/children/AddChild.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createChild, fetchParents } from '../store/children/childManagementSlice';
import { useNavigate } from 'react-router-dom';

export default function AddChild() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parents, loading, error } = useSelector(state => state.childManagement);

  // initial form state
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

  useEffect(() => {
    dispatch(fetchParents());
  }, [dispatch]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setChildData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // use FormData to include file upload
    const formData = new FormData();
    Object.entries(childData).forEach(([key, val]) => {
      if (val !== '' && val != null) formData.append(key, val);
    });

    try {
      await dispatch(createChild(formData)).unwrap();
      navigate('/children');
    } catch (err) {
      console.error('Failed to create child:', err);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Child</h2>
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">Error: {JSON.stringify(error)}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Guardians */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Primary Guardian</label>
            <select
        name="primary_guardian"
        value={childData.primary_guardian}
        onChange={handleChange}
        required
      >
        <option value="">Select primary guardian</option>
        {parents.map(p => (
          <option key={p.id} value={p.id}>
            {p.first_name || p.middle_name || p.last_name
              ? `${p.first_name||""} ${p.middle_name||""} ${p.last_name||""}`.trim()
              : `Parent #${p.user}`}
          </option>
        ))}
      </select>

      <label>Secondary Guardian</label>
      <select
        name="secondary_guardian"
        value={childData.secondary_guardian}
        onChange={handleChange}
      >
        <option value="">Select secondary guardian</option>
        {parents.map(p => (
          <option key={p.id} value={p.id}>
            {p.first_name || p.middle_name || p.last_name
              ? `${p.first_name||""} ${p.middle_name||""} ${p.last_name||""}`.trim()
              : `Parent #${p.user}`}
          </option>
        ))}
      </select>
          </div>
          <div>
            <label className="block mb-1">Relationship to Secondary</label>
            <input name="relationship_to_secondary_guardian" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Names & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">First Name</label>
            <input name="first_name" onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Middle Name</label>
            <input name="middle_name" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input name="last_name" onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
        </div>
        <div>
          <label className="block mb-1">Profile Picture</label>
          <input type="file" name="profile_picture" accept="image/*" onChange={handleChange} className="w-full" />
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Date of Birth</label>
            <input type="date" name="date_of_birth" onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Gender</label>
            <select name="gender" onChange={handleChange} className="w-full p-2 border rounded">
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">Blood Group</label>
            <select name="blood_group" onChange={handleChange} className="w-full p-2 border rounded">
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1">Birth Weight (kg)</label>
            <input type="number" step="0.01" name="birth_weight" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Birth Height (cm)</label>
            <input type="number" step="0.01" name="birth_height" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Current Weight (kg)</label>
            <input type="number" step="0.01" name="current_weight" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Current Height (cm)</label>
            <input type="number" step="0.01" name="current_height" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Textareas for medical info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Allergies</label>
            <textarea name="allergies" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Chronic Conditions</label>
            <textarea name="chronic_conditions" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Current Medications</label>
            <textarea name="current_medications" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Vaccination Status</label>
            <textarea name="vaccination_status" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
        </div>

        {/* Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">School</label>
            <input name="school" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Grade</label>
            <input name="grade" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Teacher Name</label>
            <input name="teacher_name" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">School Phone</label>
            <input name="school_phone" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Emergency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Emergency Contact Name</label>
            <input name="emergency_contact_name" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Emergency Contact Phone</label>
            <input name="emergency_contact_phone" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Relationship</label>
            <input name="emergency_contact_relationship" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Insurance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Insurance Provider</label>
            <input name="insurance_provider" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block mb-1">Insurance ID</label>
            <input name="insurance_id" onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        {/* Histories & Notes */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Medical History</label>
            <textarea name="medical_history" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Surgical History</label>
            <textarea name="surgical_history" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Family Medical History</label>
            <textarea name="family_medical_history" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Developmental Notes</label>
            <textarea name="developmental_notes" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
          <div>
            <label className="block mb-1">Special Needs</label>
            <textarea name="special_needs" onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => navigate('/children')} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Saving…' : 'Add Child'}
          </button>
        </div>
      </form>
    </div>
  );
}
