import React, { useState } from "react";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  TestTube, 
  Plus, 
  Hash, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Beaker,
  FileText
} from "lucide-react";
import { useSelector } from "react-redux";
import { isLabTech } from "../../../utils/roles";
export default function Table({ items, onView, onEdit, onAddLabResult, onDelete }) {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const { user } = useSelector((state) => state.auth)
  const getStatusBadge = (status) => {
    const statusConfig = {
      ORDERED: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "Ordered" },
      PROCESSING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Processing" },
      COMPLETED: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Completed" },
      COLLECTED: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", label: "Collected" },
      CANCELLED: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Cancelled" },
      REJECTED: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Rejected" },
      VERIFIED: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Verified" },
    };
    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      URGENT: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Urgent" },
      STAT: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Stat" },
      ROUTINE: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Routine" },
    };
    const config = priorityConfig[priority?.toUpperCase()] || priorityConfig["ROUTINE"];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Group items by request_id, patient, and doctor, then sort by newest first
  const grouped = items.reduce((acc, item) => {
    const requestId = item.lab_request_details?.id || 'Unknown';
    const patient = item.lab_request_details?.child || 'Unknown Patient';
    const doctor = item.lab_request_details?.doctor || 'Unknown Doctor';
    const dateRequested = item.lab_request_details?.date_requested;
    
    const key = `${requestId}_${patient}_${doctor}`;
    
    if (!acc[key]) {
      acc[key] = {
        requestId,
        patient,
        doctor,
        dateRequested,
        status: item.lab_request_details?.status || item.status,
        priority: item.lab_request_details?.priority,
        tests: []
      };
    }
    acc[key].tests.push(item);
    return acc;
  }, {});

  // Sort groups by date requested (newest first)
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    const dateA = new Date(a.dateRequested || 0);
    const dateB = new Date(b.dateRequested || 0);
    return dateB - dateA;
  });

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  if (sortedGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <TestTube className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No lab requests found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">No lab request items match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
  {sortedGroups.map((group) => {
    const groupKey = `${group.requestId}_${group.patient}_${group.doctor}`;
    const isExpanded = expandedGroups.has(groupKey);
    const testCount = group.tests.length;

    return (
      <div
        key={groupKey}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Group Header */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
          onClick={() => toggleGroup(groupKey)}
        >
          <div className="flex items-center justify-between">
            {/* Header Content */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>

              <div className="flex items-center space-x-6">
                {/* Request ID */}
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Request #{group.requestId}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {testCount} test{testCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Patient */}
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.patient}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Patient
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.doctor}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Attending Doctor
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(group.dateRequested)}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(group.status)}
                {getPriorityBadge(group.priority)}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-700/30">
            <div className="p-6 space-y-4">
              {group.tests.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    {/* Test Details */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <TestTube className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.lab_test_details?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Code: {item.lab_test_details?.code || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Sample Info */}
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Beaker className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.lab_test_details?.sample_type || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.lab_test_details?.sample_volume_required
                              ? `${item.lab_test_details.sample_volume_required}ml required`
                              : "Volume not specified"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(item.id);
                        }}
                        title="View Details"
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Add Lab Result (Visible only to Lab Tech) */}
                      {isLabTech(user) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddLabResult(item.id);
                          }}
                          title="Add Lab Result"
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item.id);
                        }}
                        title="Edit"
                        className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        title="Delete"
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })}
</div>

  );
}