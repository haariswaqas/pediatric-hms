import React from 'react';
import { Edit2 } from 'lucide-react';

export default function ProfileHeader({ child, onEdit }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="relative h-20 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      </div>
      
      <div className="px-6 py-9 flex justify-between items-center">
        <div className="flex items-center space-x-4 space-y-8">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 mt-[-2rem] overflow-hidden flex items-center justify-center">
  {child.profile_picture ? (
    <img
      src={child.profile_picture}
      alt={`${child.first_name} ${child.last_name}`}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
      {child.first_name?.charAt(0)}{child.last_name?.charAt(0)}
    </span>
  )}
</div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              {child.first_name} {child.last_name}
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Patient ID: {child.id}
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={onEdit}
          className="inline-flex items-center px-3 py-2 bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white rounded-md transition-all text-sm font-medium"
        >
          <Edit2 size={16} className="mr-1" /> Edit Profile
        </button>
      </div>
    </div>
  );
}