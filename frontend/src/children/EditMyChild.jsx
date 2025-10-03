// src/children/EditMyChild.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateChild,
  fetchChildById,
  clearSelectedChild
} from '../store/children/childManagementSlice';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditMyChild() {
  const { childId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, selectedChild } = useSelector(
    (state) => state.childManagement
  );

  const [childData, setChildData] = useState({
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

  // Fetch child on mount
  useEffect(() => {
    dispatch(fetchChildById(childId));
    return () => {
      dispatch(clearSelectedChild());
    };
  }, [dispatch, childId]);

  // Populate form when child is loaded
  useEffect(() => {
    if (selectedChild && selectedChild.id === Number(childId)) {
      const {
        relationship_to_primary_guardian,
        relationship_to_secondary_guardian,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        email,
        blood_group,
        birth_weight,
        birth_height,
        current_weight,
        current_height,
        allergies,
        chronic_conditions,
        current_medications,
        vaccination_status,
        school,
        grade,
        teacher_name,
        school_phone,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        insurance_provider,
        insurance_id,
        medical_history,
        surgical_history,
        family_medical_history,
        developmental_notes,
        special_needs,
      } = selectedChild;

      setChildData({
        relationship_to_primary_guardian: relationship_to_primary_guardian || '',
        relationship_to_secondary_guardian: relationship_to_secondary_guardian || '',
        first_name: first_name || '',
        middle_name: middle_name || '',
        last_name: last_name || '',
        profile_picture: null,
        date_of_birth: date_of_birth || '',
        gender: gender || 'M',
        email: email || '',
        blood_group: blood_group || 'A+',
        birth_weight: birth_weight || '',
        birth_height: birth_height || '',
        current_weight: current_weight || '',
        current_height: current_height || '',
        allergies: allergies || '',
        chronic_conditions: chronic_conditions || '',
        current_medications: current_medications || '',
        vaccination_status: vaccination_status || '',
        school: school || '',
        grade: grade || '',
        teacher_name: teacher_name || '',
        school_phone: school_phone || '',
        emergency_contact_name: emergency_contact_name || '',
        emergency_contact_phone: emergency_contact_phone || '',
        emergency_contact_relationship: emergency_contact_relationship || '',
        insurance_provider: insurance_provider || '',
        insurance_id: insurance_id || '',
        medical_history: medical_history || '',
        surgical_history: surgical_history || '',
        family_medical_history: family_medical_history || '',
        developmental_notes: developmental_notes || '',
        special_needs: special_needs || '',
      });
    }
  }, [selectedChild, childId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setChildData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  if (loading && !selectedChild) {
    return <p className="p-4">Loading…</p>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit My Child</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          Error: {JSON.stringify(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['first_name', 'middle_name', 'last_name'].map((field) => (
            <div key={field}>
              <label className="block mb-1 capitalize">
                {field.replace('_', ' ')}
              </label>
              <input
                name={field}
                value={childData[field]}
                onChange={handleChange}
                required={field === 'first_name' || field === 'last_name'}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>

        {/* DOB / Gender / Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={childData.date_of_birth}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Gender</label>
            <select
              name="gender"
              value={childData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={childData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block mb-1">Profile Picture</label>
          <input
            type="file"
            name="profile_picture"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={() => navigate('/my-children')}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
