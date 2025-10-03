// src/home/Home.jsx

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../store/auth/authSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded shadow-md">
        {!isAuthenticated ? (
          <>
            <h1 className="text-3xl font-bold mb-6">Welcome to Pediatric HMS</h1>
            <div className="space-x-4">
              <Link to="/auth/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Login
                </button>
              </Link>
              <Link to="/auth/register">
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Register
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Hello, {user?.username || user?.email}!
            </h1>
            <p className="text-gray-600 mb-4">Welcome back to your dashboard.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
