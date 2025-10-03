import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchLabResults, deleteLabResult } from "../../store/lab/labResultSlice";
import ConfirmationModal from "../../utils/ConfirmationModal";
import { Eye, Trash2, ClipboardList, Users, Activity, FileText } from "lucide-react";

export default function LabResultsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { labResults, loading, error } = useSelector((state) => state.labResult);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    dispatch(fetchLabResults());
  }, [dispatch]);

  const confirmDelete = (id) => {
    setActionId(id);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    dispatch(deleteLabResult(actionId))
      .unwrap()
      .then(() => toast.success("Lab result deleted successfully!"))
      .catch(() => toast.error("Failed to delete lab result."));
    setShowDeleteConfirm(false);
    setActionId(null);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setActionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <ClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Lab Results</h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Overview of performed lab tests
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-600 dark:text-slate-400">
                  Total: <span className="font-semibold text-slate-900 dark:text-white">{labResults.length}</span>
                </span>
              </div>
              {/* Could add filters or downloads here */}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  {[
                    { key: "Test", icon: ClipboardList },
                    { key: "Child", icon: Users },
                    { key: "Doctor", icon: Activity },
                    { key: "Date Requested", icon: FileText },
                    { key: "Performed By", icon: Activity },
                    { key: "Actions", icon: null }
                  ].map(({ key, icon: Icon }) => (
                    <th key={key} className="px-6 py-4 text-left">
                      <div className="flex items-center space-x-2">
                        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {key}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {labResults.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-800/50"
                    }`}
                  >
                    <td className="px-6 py-5 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {r.lab_request_item_details?.lab_test}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-900 dark:text-slate-100">
                      {r.lab_request_item_details?.child}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-900 dark:text-slate-100">
                      {r.lab_request_item_details?.doctor}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(r.lab_request_item_details?.date_requested).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-900 dark:text-slate-100">
                      {r.performed_by_details?.name}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/lab-results/${r.id}`)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-lg transition-all hover:scale-105"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(r.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-all hover:scale-105"
                          title="Delete Lab Result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading lab results...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {!loading && labResults.length === 0 && (
            <div className="py-16 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <ClipboardList className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No lab results found</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    It looks like there are no records yet. Create one to get started.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <ConfirmationModal
          show={showDeleteConfirm}
          title="Delete Lab Result"
          message="Are you sure you want to delete this lab result? This cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          confirmText="Delete"
          variant="danger"
        />

      </div>
    </div>
  );
}
