import React, { useState } from 'react';
import {
  FilePlus,
  Package,
  AlertTriangle,
  Calendar,
  FileText,
  Search,
  Pill,
  History,
} from 'lucide-react';
import { DashboardButton } from './components/DashboardButton';
import { SectionHeader } from './components/SectionHeader';

export default function PharmacyDashboard() {
  const [expandedSections, setExpandedSections] = useState({
    drugManagement: true,
    dispensing: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
          💊 Pharmacy Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Manage medications, prescriptions & dispensing workflows
        </p>
      </div>

      {/* Drug Management Section */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <SectionHeader
          title="Drug Management"
          color="bg-gradient-to-r from-blue-500 to-blue-400"
          isExpanded={expandedSections.drugManagement}
          onToggle={() => toggleSection('drugManagement')}
        />
        {expandedSections.drugManagement && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <DashboardButton
              icon={<FilePlus size={26} className="text-blue-600" />}
              label="Add New Drug"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-blue-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs/add"
            />
            <DashboardButton
              icon={<Package size={26} className="text-blue-600" />}
              label="View All Drugs"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-blue-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs"
            />
            <DashboardButton
              icon={<AlertTriangle size={26} className="text-blue-600" />}
              label="Low Stock"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-blue-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs?lowStock=true"
            />
            <DashboardButton
              icon={<Calendar size={26} className="text-blue-600" />}
              label="Expiring Soon"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-blue-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs?expiring=true"
            />
          </div>
        )}
      </div>

      {/* Dispensing & Prescription Section */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <SectionHeader
          title="Dispensing & Prescription"
          color="bg-gradient-to-r from-green-500 to-green-400"
          isExpanded={expandedSections.dispensing}
          onToggle={() => toggleSection('dispensing')}
        />
        {expandedSections.dispensing && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <DashboardButton
              icon={<FileText size={26} className="text-green-600" />}
              label="View Prescriptions"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-green-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/prescriptions/items"
            />
            <DashboardButton
              icon={<Search size={26} className="text-green-600" />}
              label="Active Prescriptions"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-green-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/prescriptions/active"
            />
            <DashboardButton
              icon={<Pill size={26} className="text-green-600" />}
              label="Dispense Medication"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-green-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs/drug-dispenses/add"
            />
            <DashboardButton
              icon={<History size={26} className="text-green-600" />}
              label="Dispense History"
              color="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-green-500 hover:shadow-lg hover:scale-105 transition-transform"
              navigateTo="/drugs/drug-dispenses"
            />
          </div>
        )}
      </div>
    </div>
  );
}
