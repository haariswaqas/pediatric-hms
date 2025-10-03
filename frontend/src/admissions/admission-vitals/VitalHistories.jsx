import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVitalHistories } from "../../store/admissions/admissionVitalSlice";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Search,
  Filter,
  X,
  Edit3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import PatientHeader from "./components/vitals/PatientHeader";
import VitalSummaryCards from "./components/vitals/VitalSummaryCards";
import VitalHistoryTable from "./components/vitals/VitalHistoryTable";
import VitalStats from "./components/vitals/VitalStats";

// Virtual list item component for better performance
const VirtualPatientItem = React.memo(({ 
  admissionId, 
  histories, 
  isOpen, 
  onToggle, 
  onEdit, 
  viewMode 
}) => {
  const sorted = useMemo(() => 
    [...histories].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [histories]
  );
  
  const latest = sorted[0];
  const { child: childName, admission_date, age, birth_date } = latest.child_details || {};
  
  const patientAge = useMemo(() => {
    if (age != null) return age;
    if (!birth_date) return null;
    return Math.floor((new Date() - new Date(birth_date)) / (365.25 * 24 * 60 * 60 * 1000));
  }, [age, birth_date]);

  const handleToggle = useCallback(() => onToggle(admissionId), [admissionId, onToggle]);
  const handleEdit = useCallback(() => onEdit(admissionId), [admissionId, onEdit]);

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* Clickable header */}
      <button
        onClick={handleToggle}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="text-left">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {childName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Age: {patientAge ?? "—"}, Admitted{" "}
            {new Date(admission_date).toLocaleDateString()}
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-6 pb-6">
          {viewMode === "summary" && (
            <VitalSummaryCards
              latestVitals={latest}
              patientAge={patientAge}
            />
          )}
          {viewMode === "stats" && <VitalStats histories={sorted} />}
          {viewMode === "history" && (
            <VitalHistoryTable
              histories={sorted}
              patientAge={patientAge}
            />
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Vitals</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default function VitalHistories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vitalHistories, loading, error } = useSelector(state => state.admissionVital);

  // State management
  const [openAdmissions, setOpenAdmissions] = useState(new Set());
  const [viewMode, setViewMode] = useState("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    ageRange: "",
    dateRange: "",
    urgentOnly: false
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Increased default page size

  useEffect(() => {
    dispatch(fetchVitalHistories());
  }, [dispatch]);

  // Memoized data processing
  const processedData = useMemo(() => {
    // Group by admission
    const grouped = vitalHistories.reduce((acc, vh) => {
      const key = vh.admission_vital_record_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(vh);
      return acc;
    }, {});

    let admissions = Object.entries(grouped);

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      admissions = admissions.filter(([_, histories]) => {
        const latest = histories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        const childName = latest.child_details?.child?.toLowerCase() || "";
        return childName.includes(term);
      });
    }

    // Apply filters
    if (filterCriteria.ageRange || filterCriteria.dateRange || filterCriteria.urgentOnly) {
      admissions = admissions.filter(([_, histories]) => {
        const latest = histories[0];
        const { age, birth_date, admission_date } = latest.child_details || {};
        
        // Age filter
        if (filterCriteria.ageRange) {
          const patientAge = age ?? (birth_date ? 
            Math.floor((new Date() - new Date(birth_date)) / (365.25 * 24 * 60 * 60 * 1000)) : 
            null
          );
          
          const [minAge, maxAge] = filterCriteria.ageRange.split('-').map(Number);
          if (patientAge < minAge || patientAge > maxAge) return false;
        }

        // Date filter
        if (filterCriteria.dateRange) {
          const admDate = new Date(admission_date);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - parseInt(filterCriteria.dateRange));
          if (admDate < cutoffDate) return false;
        }

        // Urgent cases filter (example: high heart rate, fever, etc.)
        if (filterCriteria.urgentOnly) {
          const hasUrgentVitals = histories.some(h => 
            h.heart_rate > 120 || h.temperature > 38.5 || h.respiratory_rate > 30
          );
          if (!hasUrgentVitals) return false;
        }

        return true;
      });
    }

    return admissions;
  }, [vitalHistories, searchTerm, filterCriteria]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => 
    processedData.slice((page - 1) * pageSize, page * pageSize),
    [processedData, page, pageSize]
  );

  // Event handlers
  const handleToggle = useCallback((id) => {
    setOpenAdmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleEdit = useCallback((id) => {
    navigate(`/admissions/edit-vitals/${id}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterCriteria({
      ageRange: "",
      dateRange: "",
      urgentOnly: false
    });
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilterCriteria(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  // Bulk operations
  const expandAll = useCallback(() => {
    setOpenAdmissions(new Set(paginatedData.map(([id]) => id)));
  }, [paginatedData]);

  const collapseAll = useCallback(() => {
    setOpenAdmissions(new Set());
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-300" />
          <span className="text-lg text-gray-600 dark:text-gray-400">
            Loading pediatric vital histories...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-300 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg">Error loading data</p>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="max-w-9xl mx-auto">
        {/* Header with search and filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Age filter */}
            <select
              value={filterCriteria.ageRange}
              onChange={(e) => handleFilterChange("ageRange", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Ages</option>
              <option value="0-1">0-1 years</option>
              <option value="1-5">1-5 years</option>
              <option value="5-12">5-12 years</option>
              <option value="12-18">12-18 years</option>
            </select>

            {/* Date filter */}
            <select
              value={filterCriteria.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>

            {/* Urgent cases filter */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterCriteria.urgentOnly}
                onChange={(e) => handleFilterChange("urgentOnly", e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Urgent cases only</span>
            </label>

            {/* Clear filters */}
            {(searchTerm || Object.values(filterCriteria).some(v => v)) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* View mode and bulk actions */}
          <div className="flex justify-between items-center">
            {/* View mode tabs */}
            <div className="flex space-x-2">
              {["summary", "history", "stats"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300 text-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600"}
                  `}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            <div className="flex space-x-2">
              <button
                onClick={expandAll}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedData.length} of {processedData.length} patients
            {pageSize < processedData.length && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="ml-4 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}
          </div>
        </div>

        {/* Patient list */}
        <div className="space-y-2">
          {paginatedData.map(([admissionId, histories]) => (
            <VirtualPatientItem
              key={admissionId}
              admissionId={admissionId}
              histories={histories}
              isOpen={openAdmissions.has(admissionId)}
              onToggle={handleToggle}
              onEdit={handleEdit}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Enhanced pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="flex space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded border ${
                      page === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
            
            <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
          </div>
        )}

        {/* Empty state */}
        {processedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No patients found matching your criteria
            </p>
            {(searchTerm || Object.values(filterCriteria).some(v => v)) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters to see all patients
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}