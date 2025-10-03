import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '../store/admin/userManagementSlice';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.userManagement);

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
    password: '',
    password2: ''
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // You might want to validate that password === password2 here
    if (userData.password !== userData.password2) {
      alert("Passwords do not match!");
      return;
    }

    // Debugging: Log what's being sent
    console.log('Creating user with data:', userData);

    dispatch(createUser(userData))
      .then((res) => {
        if (!res.error) {
          alert('User created successfully!');
          navigate('/admin/view-all');  // Adjust to your users list route
        }
      });
  };

  return (
    <div>
      <h1>Add New User</h1>
      {loading && <p>Creating user...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Role:</label>
            <input
              type="text"
              name="role"
              value={userData.role}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Status:</label>
            <input
              type="text"
              name="status"
              value={userData.status}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="password2"
              value={userData.password2}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Create User</button>
        </form>
      )}
    </div>
  );
};

export default AddUser;
