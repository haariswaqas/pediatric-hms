import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLabRequestItems, deleteLabRequestItem } from "../../store/lab/labRequestItemSlice";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Users, TestTube, Clock } from "lucide-react";
import StatCard from "./components/StatCard";
import Charts from "./charts/Charts";
import Table from "./components/Table";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorAlert from "./components/ErrorAlert";
import { isDoctor, isLabTech } from "../../utils/roles";

export default function LabRequestItemsList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user} = useSelector((state) => state.auth)
    const { labRequestItems, loading, error } = useSelector((state) => state.labRequestItem);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchLabRequestItems());
    }, [dispatch]);
const addLabResult = (labRequestItemId) => {
    navigate(`/labs/add-lab-result/${labRequestItemId}`)
}
    const filteredItems = labRequestItems.filter(item => {
        // Search filter - check test name, patient name, and doctor name
        const testName = item.lab_test_details?.name?.toLowerCase() || "";
        const patientName = item.lab_request_details?.child?.toLowerCase() || "";
        const doctorName = item.lab_request_details?.doctor?.toLowerCase() || "";
        
        const matchesSearch = searchTerm === "" || 
            testName.includes(searchTerm.toLowerCase()) ||
            patientName.includes(searchTerm.toLowerCase()) ||
            doctorName.includes(searchTerm.toLowerCase());
        
        // Status filter - check the status from lab_request_details
        const itemStatus = item.lab_request_details?.status || item.status;
        const matchesStatus = statusFilter === "all" || itemStatus === statusFilter;
        
        // Date filter - check date_requested
        let matchesDate = true;
        if (dateFilter !== "all") {
            const dateRequested = item.lab_request_details?.date_requested;
            if (dateRequested) {
                const itemDate = new Date(dateRequested);
                const now = new Date();
                const days = parseInt(dateFilter);
                const filterDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                matchesDate = itemDate >= filterDate;
            } else {
                // If no date, exclude from date-filtered results
                matchesDate = false;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this lab request item?")) {
            try {
                await dispatch(deleteLabRequestItem(id)).unwrap();
                // Optionally show success message
            } catch (error) {
                console.error("Failed to delete lab request item:", error);
                // Optionally show error message
            }
        }
    };

    // Loading and error states
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert error={error} />;

    // Handle empty state
    if (!labRequestItems || labRequestItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <TestTube className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Lab Requests
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Manage and track all laboratory test requests
                                </p>
                            </div>
                            {isDoctor(user.role) && (
                            <button
                                onClick={() => navigate("/labs/add-lab-request")}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                            >
                                <Plus className="h-5 w-5" />
                                Make Lab Request
                            </button>
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
                        <div className="text-center">
                            <TestTube className="mx-auto h-16 w-16 text-gray-400" />
                            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No lab requests found</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Get started by creating your first lab request.
                            </p>
                            <button
                                onClick={() => navigate("/labs/add-lab-request")}
                                className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Create Lab Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <TestTube className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                Lab Requests
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage and track all laboratory test requests
                            </p>
                        </div>
                        {isDoctor(user) && (
                        <button
                            onClick={() => navigate("/labs/add-lab-request")}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            Make Lab Request
                        </button>
                        )}
                    </div>
                </div>
                {isLabTech(user) && (
  <>
    {/* Statistics Cards */}
    <StatCard labRequestItems={labRequestItems} />

    {/* Charts */}
    <Charts labRequestItems={labRequestItems} />
  </>
)}

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by test name, patient, or doctor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="all">All Status</option>
                                <option value="ORDERED">Ordered</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="COLLECTED">Collected</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="VERIFIED">Verified</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="all">All Time</option>
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Results Summary */}
                    {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {filteredItems.length} of {labRequestItems.length} lab request items
                                {searchTerm && ` matching "${searchTerm}"`}
                                {statusFilter !== "all" && ` with status "${statusFilter}"`}
                                {dateFilter !== "all" && ` from last ${dateFilter} days`}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("all");
                                    setDateFilter("all");
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Enhanced Table */}
                <Table 
                    items={filteredItems}
                    onView={(id) => navigate(`/lab-request-item/${id}`)}
                    onEdit={(id) => navigate(`/edit-lab-request-item/${id}`)}
                    onDelete={handleDelete}
                    onAddLabResult={addLabResult}
                />
            </div>
        </div>
    );
}