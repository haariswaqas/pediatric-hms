import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, deleteChild } from '../store/children/childManagementSlice';
import { Link, useNavigate } from 'react-router-dom';
import { User, Edit2, Plus, Calendar, Heart } from 'lucide-react';

export default function ChildList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { children, loading, error } = useSelector(state => state.childManagement);
  const [delConfirm, setDelConfirm] = useState({ show: false, id: null });
  const [view, setView] = useState('grid');

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const bookAppointment = (childId) => {
    navigate(`/appointments/add/${childId}`);
  };
  
  const confirmDelete = id => setDelConfirm({ show: true, id });
  const cancelDelete = () => setDelConfirm({ show: false, id: null });
  const handleDelete = () => {
    dispatch(deleteChild(delConfirm.id)).unwrap()
      .finally(() => setDelConfirm({ show: false, id: null }));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">My Children</h2>
        <Link
          to="/children/add"
          className="flex items-center bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-md dark:shadow-lg transition-all"
        >
          <Plus size={18} className="mr-1" /> Add Child
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-200 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-900 p-4 rounded-lg mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error.message || "Something went wrong. Please try again."}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children && children.length > 0 ? (
            children.map(child => (
              <div
                key={child.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-all duration-200"
              >
                <div className="bg-blue-50 dark:bg-gray-700 h-32 flex justify-center items-center">
                  {child.profile_picture ? (
                    <img 
                      src={child.profile_picture} 
                      alt={`${child.first_name}`} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-gray-600 flex items-center justify-center">
                      <User size={40} className="text-blue-500 dark:text-blue-300" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <Link to={`/children/child/${child.id}`} className="block">
                    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 hover:underline transition-colors">
                      {child.first_name} {child.last_name}
                    </h3>
                  </Link>
                  
                  <div className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                    <p><span className="font-medium">Age:</span> {child.age} years</p>
                    <p><span className="font-medium">Birthday:</span> {child.date_of_birth}</p>
                    <p><span className="font-medium">Blood Type:</span> {child.blood_group}</p>
                    {child.school && <p><span className="font-medium">School:</span> {child.school}</p>}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => bookAppointment(child.id)}
                      className="flex-1 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                    >
                      <Calendar size={16} className="mr-2" />
                      Book
                    </button>
                    
                    <Link
                      to={`/children/child/${child.id}`}
                      className="flex-1 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                    >
                      <Heart size={16} className="mr-2" />
                      Records
                    </Link>
                    
                    <Link
                      to={`/children/edit/${child.id}`}
                      className="flex-1 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => confirmDelete(child.id)}
                      className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 text-white py-2 px-4 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md text-center">
              <div className="mb-4">
                <User size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-200 mb-2">No Children Added Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Add your child's information to track their health records and appointments.</p>
              <Link
                to="/children/add"
                className="inline-block bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow transition-all"
              >
                <Plus size={18} className="inline mr-1" /> Add Your First Child
              </Link>
            </div>
          )}
        </div>
      )}

      {delConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-sm w-full transition-colors">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Remove Child
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to remove this child from your account? All health records and appointment history will be deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
