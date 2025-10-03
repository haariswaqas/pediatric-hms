import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfiles, deleteProfile } from '../store/admin/profileManagementSlice';

const ProfilesList = ({ role }) => {
  const dispatch = useDispatch();
  
  // Updated selector to use profilesByRole
  const { loading, error } = useSelector(state => state.profileManagement);
  const profiles = useSelector(state => state.profileManagement.profilesByRole[role] || []);

  useEffect(() => {
    if (role) {
      dispatch(fetchProfiles({ role }));
    }
  }, [dispatch, role]);

  // Add debug logging to monitor profiles
  useEffect(() => {
    console.log(`Current profiles for ${role}:`, profiles);
  }, [profiles, role]);

  const handleDelete = (profileId) => {
    dispatch(deleteProfile({ role, profileId }));
  };

  const handleEdit = (profileId) => {
    console.log('Edit profile with id:', profileId);
  };

  const renderProfileField = (value) => {
    return value !== undefined && value !== null ? value : 'Unknown';
  };

  if (loading) {
    return <div>Loading {role} profiles...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile-list-container">
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Profile List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.length > 0 ? (
            profiles.map(profile => (
              <tr key={profile.id}>
                <td>{renderProfileField(profile.id)}</td>
                <td>
                  {renderProfileField(profile.first_name)} {renderProfileField(profile.last_name)}
                </td>
                <td>
                  <button className="btn btn-primary" onClick={() => handleEdit(profile.id)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(profile.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No profiles found for {role}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProfilesList;