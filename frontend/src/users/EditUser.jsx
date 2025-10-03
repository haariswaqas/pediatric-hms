import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, fetchUserById } from '../store/admin/userManagementSlice';
import { useParams } from 'react-router-dom';

const EditUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedUser, loading, error } = useSelector((state) => state.userManagement);

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
    password: '', // Admin can modify the password
    password2: '' // Admin can confirm the password
  });

  // Fetch user data by ID when the component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id)); // Fetch user by ID
    }
  }, [id, dispatch]);

  // Pre-fill the form with the user data when selectedUser is updated
  useEffect(() => {
    if (selectedUser) {
      setUserData({
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        role: selectedUser.role || '',
        status: selectedUser.status || '',
        password: '', // Don't pre-fill the password (admin may change it)
        password2: '' // Same for confirm password
      });
    }
  }, [selectedUser]);

  // Handle input changes for the form
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { ...userData };

    // Only include password and password2 if they are not empty
    if (!updatedData.password || !updatedData.password2) {
      delete updatedData.password;
      delete updatedData.password2;
    }

    // Debugging: Log the data being sent to verify
    console.log('Updated data being sent in the request:', updatedData);

    if (id) {
      dispatch(updateUser({ userId: id, updatedData }));
    }
  };

  return (
    <div>
      <h1>Edit User</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Role:</label>
            <input
              type="text"
              name="role"
              value={userData.role}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Status:</label>
            <input
              type="text"
              name="status"
              value={userData.status}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Leave empty if not changing password"
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="password2"
              value={userData.password2}
              onChange={handleChange}
              placeholder="Leave empty if not changing password"
            />
          </div>
          <button type="submit">Update</button>
        </form>
      )}
    </div>
  );
};

export default EditUser;
