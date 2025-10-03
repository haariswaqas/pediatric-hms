// src/prescriptions/prescription-items/PrescriptionItemList.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptionItems,
  deletePrescriptionItem,
} from "../../store/prescriptions/prescriptionItemSlice";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FREQUENCY_CHOICES } from "./AddPrescriptionItem";
import {
  Edit3,
  Trash2,
  Pill,
  Clock,
  Calendar,
  ListCheck,
  ListChecks,
  ListOrdered,
  CheckCircle2,
  Search,
  ChevronDown,
  BarChart2
} from "lucide-react";
import { isDoctor, isPharmacist } from "../../utils/roles";

import PrescriptionHeader from "./components/PrescriptionHeader";
import PrescriptionAnalyticsCard from "./components/PrescriptionAnalyticsCard";
import PrescriptionStatusChart from "./components/PrescriptionStatusChart";
import PrescriptionRefillsChart from "./components/PrescriptionRefillsChart";
import PrescriptionTable from "./components/PrescriptionTable";
import PrescriptionFilterBar from "./components/PrescriptionFilterBar";
import PrescriptionStatusBadge  from "./components/PrescriptionStatusBadge";
import PrescriptionEmptyState from "./components/PrescriptionEmptyState";
import PrescriptionItemSearch from "./PrescriptionItemSearch";

export default function PrescriptionItemList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptionId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { prescriptionItems, loading, error } = useSelector(
    (s) => s.prescriptionItem
  );

  // State for filtering and sorting
  const [filteredPrescriptionItems, setFilteredPrescriptionItems] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    dispatch(fetchPrescriptionItems(prescriptionId));
  }, [dispatch, prescriptionId]);

  // Simplified filtering logic - now only handles status filter
  // Search filtering is handled by PrescriptionItemSearch component
  const getFilteredItems = () => {
    // Start with either search results or full list
    const baseList = filteredPrescriptionItems ?? prescriptionItems;
    
    // Apply status filter only
    if (filterStatus === "all") {
      return baseList;
    }
    
    return baseList.filter(item => 
      item.prescription_details?.prescription_status === filterStatus
    );
  };

  const filteredItems = getFilteredItems();

  const handleAdd = () => navigate(`/prescriptions/add-item`);
  const handleEdit = (id) => navigate(`/prescriptions/edit-item/${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Delete this item?")) {
      dispatch(deletePrescriptionItem(id));
    }
  };

  // Helper to get full label or fall back to code
  const getFrequencyLabel = (code) => {
    const pair = FREQUENCY_CHOICES.find(([c]) => c === code);
    return pair ? pair[1] : code;
  };

  // Calculate analytics data
  const getAnalyticsData = () => {
    if (!filteredItems.length) return null;
    
    const totalPrescriptions = filteredItems.length;
    const activeCount = filteredItems.filter(item => 
      item.prescription_details?.prescription_status === 'ACTIVE').length;
    const expiringSoon = filteredItems.filter(item => {
      if (!item.prescription_details?.prescription_valid_until) return false;
      const validUntil = new Date(item.prescription_details.prescription_valid_until);
      const now = new Date();
      const daysLeft = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    }).length;
    const needRefill = filteredItems.filter(item => 
      item.refills_remaining <= 1 && item.is_refillable).length;
      
    return { totalPrescriptions, activeCount, expiringSoon, needRefill };
  };

  // Data for charts
  const getStatusChartData = () => {
    if (!filteredItems.length) return [];
    
    const statusCounts = {};
    filteredItems.forEach(item => {
      const status = item.prescription_details?.prescription_status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };
  
  const getRefillsChartData = () => {
    if (!filteredItems.length) return [];
    
    // Group by refills remaining
    return [0, 1, 2, 3, 4, 5].map(refills => ({
      name: refills === 0 ? 'None' : refills === 5 ? '5+' : refills.toString(),
      value: filteredItems.filter(item => 
        refills === 5 ? item.refills_remaining >= 5 : item.refills_remaining === refills
      ).length
    })).filter(item => item.value > 0);
  };

  // Define columns for prescription table
  const getColumns = () => {
    const baseColumns = [
      { 
        key: "drug", 
        label: "Medication", 
        icon: <Pill />,
        render: (item) => (
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <Link to={`/drugs/${item.drug_details?.id}`}>{item.drug_details?.name} {item.drug_details?.strength}</Link>
            </div>
          </div>
        )
      },
      { 
        key: "dosage", 
        label: "Dosage", 
        icon: null,
        render: (item) => item.dosage
      },
      { 
        key: "frequency", 
        label: "Frequency", 
        icon: <Clock />,
        render: (item) => (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{getFrequencyLabel(item.frequency)}</span>
          </div>
        )
      },
      { 
        key: "duration", 
        label: "Duration", 
        icon: <Calendar />,
        render: (item) => item.full_duration
      },
      { 
        key: "refills", 
        label: "Refills", 
        icon: <ListOrdered />,
        render: (item) => (
          <div className="flex flex-col">
            <span className="font-medium">{item.refills_used}/{item.max_refills}</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ 
                  width: `${(item.refills_used / item.max_refills) * 100}%` 
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {item.refills_remaining} remaining
            </span>
          </div>
        )
      },
      { 
        key: "status", 
        label: "Status", 
        icon: <CheckCircle2 />,
        render: (item) => (
          <PrescriptionStatusBadge status={item.prescription_details?.prescription_status || "Unknown"} />
        )
      },
    ];
    
    const patientColumn = { 
      key: "patient", 
      label: "Patient", 
      icon: null,
      render: (item) => (
        <div className="flex flex-col">
          <span>
            {item.prescription_details
              ? `${item.prescription_details.child_first_name} ${item.prescription_details.child_last_name}`
              : "—"}
          </span>
        </div>
      )
    };
    
    const doctorColumn = { 
      key: "doctor", 
      label: "Doctor", 
      icon: null,
      render: (item) => (
        <div className="flex flex-col">
          <span>
            {item.prescription_details
              ? `${item.prescription_details.doctor_first_name} ${item.prescription_details.doctor_last_name}`
              : "—"}
          </span>
        </div>
      )
    };
    
    const validityColumn = { 
      key: "validity", 
      label: "Validity", 
      icon: <Calendar />,
      render: (item) => {
        const validFrom = item.prescription_details?.prescription_valid_from;
        const validUntil = item.prescription_details?.prescription_valid_until;
        
        if (!validUntil) return "—";
        
        const now = new Date();
        const expDate = new Date(validUntil);
        const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">From: {validFrom || "—"}</span>
            <span className="text-xs font-medium">Until: {validUntil}</span>
            {daysLeft > 0 && daysLeft <= 7 && (
              <span className="text-xs text-orange-500 font-medium">
                Expires in {daysLeft} day{daysLeft > 1 ? 's' : ''}
              </span>
            )}
            {daysLeft <= 0 && (
              <span className="text-xs text-red-500 font-medium">
                Expired
              </span>
            )}
          </div>
        );
      }
    };
    
    const actionsColumn = { 
      key: "actions", 
      label: "Actions", 
      icon: null,
      render: (item) => (
        <div className="flex space-x-2">
          {/* Edit button (optional based on role) */}
          {isDoctor(user) && (
            <button
              onClick={() => handleEdit(item.id)}
              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
            >
              Edit
            </button>
          )}
    
          {/* Delete button (optional based on role) */}
          {isDoctor(user) && (
            <button
              onClick={() => handleDelete(item.id)}
              className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          )}
    
          {/* Dispense Drug button for pharmacists */}
          {isPharmacist(user) && (
            <Link
              to={`/drugs/drug-dispenses/add/${item.id}`}
              className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Dispense Drug
            </Link>
          )}
        </div>
      )
    };
    

    // Build the columns based on user role
    let columns = [...baseColumns];
    
    // Only doctors see patient info
    if (isDoctor(user)) {
      columns.splice(3, 0, patientColumn);
    } else {
      // Non-doctors see doctor info
      columns.splice(3, 0, doctorColumn);
      columns.splice(3, 0, patientColumn);
    }
    
    // Add validity and actions columns at the end
    columns = [...columns, validityColumn, actionsColumn];
    
    return columns;
  };

  if (loading) return (
    <div className="max-w-10xl mx-auto p-8">
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-200 mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-10xl mx-auto p-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error: {error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const analytics = getAnalyticsData();
  const statusChartData = getStatusChartData();
  const refillsChartData = getRefillsChartData();

  return (
    <div className="max-w-10xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PrescriptionHeader 
        title={isDoctor(user) ? "Your Prescriptions" : "Prescription Items"}
        icon={isDoctor(user) ? <ListChecks /> : <ListCheck />}
        onAdd={handleAdd}
      />
      
      {/* Analytics Section */}
      {analytics && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Prescription Analytics
            </h2>
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
              <ChevronDown className={`w-4 h-4 ml-1 transform ${showAnalytics ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <PrescriptionAnalyticsCard 
                  title="Total Prescriptions"
                  value={analytics.totalPrescriptions}
                  icon={<Pill />}
                  color="indigo"
                />
                <PrescriptionAnalyticsCard 
                  title="Active Prescriptions"
                  value={analytics.activeCount}
                  icon={<CheckCircle2 />}
                  color="green"
                />
                <PrescriptionAnalyticsCard 
                  title="Expiring Soon"
                  value={analytics.expiringSoon}
                  icon={<Calendar />}
                  color="amber"
                />
              
              </div>
              
              {prescriptionItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <PrescriptionStatusChart data={statusChartData} />
                
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 dark:text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search section */}
          <div className="flex-1">
            <PrescriptionItemSearch
              onSearchResults={setFilteredPrescriptionItems}
              placeholder="Search prescription items..."
              
            />
          </div>
          
          {/* Filter Bar */}
          <PrescriptionFilterBar 
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            totalCount={prescriptionItems.length}
            filteredCount={filteredItems.length}
          />
        </div>
      </div>
      
      {/* Prescription Table */}
      {prescriptionItems.length === 0 ? (
        <PrescriptionEmptyState onAdd={handleAdd} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">No matching prescriptions</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setFilteredPrescriptionItems(null); // Clear search results
              setFilterStatus("all");
            }}
            className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <PrescriptionTable 
          items={filteredItems} 
          columns={getColumns()} 
        />
      )}
    </div>
  );
}