// essentials/components/UserDashboard.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../../store/auth/authSlice';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Dashboard content */}
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 bg-white rounded-xl shadow-lg p-6"
      >
        {/* Quick Access content */}
      </motion.div>
    </div>
  );
};

export default UserDashboard;