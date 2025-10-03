import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clipboard, FilePlus, FileText, Printer } from 'lucide-react';

export default function ActionButtons({ childId }) {
  const actions = [
    { 
      icon: <Calendar size={18} />, 
      text: "Book Appointment", 
      link: `/appointments/add/${childId}`,
      color: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
    },
    { 
      icon: <Clipboard size={18} />, 
      text: "Create Diagnosis", 
      link: `/diagnosis/add/${childId}`,
      color: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
    },
    { 
      icon: <FilePlus size={18} />, 
      text: "Add Prescription", 
      link: `/prescriptions/add/${childId}`,
      color: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
    },
  
   
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Actions</h2>
      </div>
      
      <div className="p-4 flex flex-col space-y-2">
        {actions.map((action, index) => {
          const ButtonContent = () => (
            <>
              <span className="mr-2">{action.icon}</span>
              {action.text}
            </>
          );
          
          return action.link ? (
            <Link
              key={index}
              to={action.link}
              className={`inline-flex items-center justify-center px-4 py-2 ${action.color} text-white rounded-md transition-colors text-sm font-medium`}
            >
              <ButtonContent />
            </Link>
          ) : (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center justify-center px-4 py-2 ${action.color} text-white rounded-md transition-colors text-sm font-medium`}
            >
              <ButtonContent />
            </button>
          );
        })}
      </div>
    </div>
  );
}