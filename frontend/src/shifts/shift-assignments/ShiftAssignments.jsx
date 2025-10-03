// src/shifts/ShiftAssignments.jsx
import React, { useState } from 'react';
import { Users, Stethoscope, Heart, Pill, TestTube } from 'lucide-react';
import DoctorShiftAssignments from './DoctorShiftAssignments';
import NurseShiftAssignments from './NurseShiftAssignments';
import PharmacistShiftAssignments from './PharmacistShiftAssignments';
import LabTechShiftAssignments from './LabTechShiftAssignments';

export default function ShiftAssignments() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { 
      id: 'all', 
      label: 'All Roles', 
      icon: Users,
      description: 'View all shift assignments in one view'
    },
    { 
      id: 'doctors', 
      label: 'Doctors', 
      icon: Stethoscope,
      description: 'Doctor shift assignments and schedules'
    },
    { 
      id: 'nurses', 
      label: 'Nurses', 
      icon: Heart,
      description: 'Nursing staff shift assignments'
    },
    { 
      id: 'pharmacists', 
      label: 'Pharmacists', 
      icon: Pill,
      description: 'Pharmacy staff shift schedules'
    },
    { 
      id: 'labtechs', 
      label: 'Lab Technicians', 
      icon: TestTube,
      description: 'Laboratory staff assignments'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'doctors':
        return <DoctorShiftAssignments />;
      case 'nurses':
        return <NurseShiftAssignments />;
      case 'pharmacists':
        return <PharmacistShiftAssignments />;
      case 'labtechs':
        return <LabTechShiftAssignments />;
      case 'all':
      default:
        return (
          <div className="space-y-12">
            {/* Section Headers with Dividers */}
            <div>
              <div className="flex items-center mb-6">
                <Stethoscope className="mr-3 text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Doctor Assignments
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <DoctorShiftAssignments />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <Heart className="mr-3 text-red-500" size={24} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Nurse Assignments
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <NurseShiftAssignments />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <Pill className="mr-3 text-green-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Pharmacist Assignments
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <PharmacistShiftAssignments />
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <TestTube className="mr-3 text-purple-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Lab Technician Assignments
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <LabTechShiftAssignments />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Shift Assignments</h1>
          <p className="text-blue-100">Manage and view all staff shift assignments across departments</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-4 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Active Tab Info */}
        {activeTab !== 'all' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              {(() => {
                const currentTab = tabs.find(tab => tab.id === activeTab);
                const Icon = currentTab?.icon;
                return Icon ? <Icon className="mr-3 text-blue-600 dark:text-blue-400" size={20} /> : null;
              })()}
              <div>
                <h2 className="font-semibold text-blue-900 dark:text-blue-100">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}