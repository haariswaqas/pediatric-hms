// src/lab/AddLabResult.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  FlaskConical,
  ClipboardList,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Stethoscope,
  ChevronDown,
  Plus
} from "lucide-react";
import {
  createLabResult,
  clearLabResultError
} from "../../store/lab/labResultSlice";
import { fetchLabRequestItems } from "../../store/lab/labRequestItemSlice";

export default function AddLabResult() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labRequestItemId } = useParams();

  const { labRequestItems } = useSelector((s) => s.labRequestItem);
  const { loading, error } = useSelector((s) => s.labResult);

  const [formData, setFormData] = useState({
    lab_request_item: labRequestItemId || "",
    report_notes: "",
    internal_notes: ""
  });
  const [formError, setFormError] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Group lab request items by request ID
  const groupedItems = useMemo(() => {
    if (!labRequestItems || labRequestItems.length === 0) return {};
    
    const groups = {};
    labRequestItems.forEach(item => {
      const requestId = item.lab_request_details?.id;
      if (!groups[requestId]) {
        groups[requestId] = {
          request: item.lab_request_details,
          items: []
        };
      }
      groups[requestId].items.push(item);
    });
    
    // Sort groups by request ID (newest first)
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .reduce((sorted, key) => {
        sorted[key] = groups[key];
        // Sort items within each group by test name
        sorted[key].items.sort((a, b) => 
          a.lab_test_details?.name?.localeCompare(b.lab_test_details?.name || '') || 0
        );
        return sorted;
      }, {});
  }, [labRequestItems]);

  // Load the list of possible items
  useEffect(() => {
    dispatch(fetchLabRequestItems());
  }, [dispatch]);

  // Set selected item when form data changes
  useEffect(() => {
    if (formData.lab_request_item && labRequestItems) {
      const item = labRequestItems.find(item => item.id.toString() === formData.lab_request_item.toString());
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [formData.lab_request_item, labRequestItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
    setFormError((fe) => ({ ...fe, [name]: null }));
    if (error) dispatch(clearLabResultError());
  };

  const handleItemSelect = (item) => {
    setFormData(fd => ({ ...fd, lab_request_item: item.id.toString() }));
    setFormError(fe => ({ ...fe, lab_request_item: null }));
    setIsDropdownOpen(false);
    if (error) dispatch(clearLabResultError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple front-end validation
    const errs = {};
    if (!formData.lab_request_item) errs.lab_request_item = "Required";
    if (!formData.report_notes) errs.report_notes = "Required";
    if (!formData.internal_notes) errs.internal_notes = "Required";

    setFormError(errs);
    if (Object.keys(errs).length) return;

    try {
      const resultAction = await dispatch(createLabResult(formData)).unwrap();
      // Navigate to add parameters page with the created lab result ID
      navigate(`/labs/add-lab-result-parameter/${resultAction.id}`);
    } catch {
      // error is already in the slice; will display below
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <FlaskConical className="mr-2" /> Add Lab Result
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enhanced Lab Request Item Select */}
        <div>
          <label
            htmlFor="lab_request_item"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center"
          >
            <ClipboardList className="mr-2 w-4 h-4" /> Lab Request Item
          </label>
          
          {/* Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!labRequestItemId) {
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
              disabled={!!labRequestItemId}
              className={`w-full px-4 py-3 rounded-lg border ${
                formError.lab_request_item
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between ${
                labRequestItemId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="flex-1">
                {selectedItem ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      Request #{selectedItem.lab_request_details?.id}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span>{selectedItem.lab_test_details?.name}</span>
                    <span className="text-sm text-gray-500">
                      ({selectedItem.lab_test_details?.code})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a lab request item...</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {Object.keys(groupedItems).length === 0 ? (
                  <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                    No lab request items available
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([requestId, group]) => (
                    <div key={requestId} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      {/* Group Header */}
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Request #{requestId}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{group.request?.child || 'Unknown Patient'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Stethoscope className="w-3 h-3" />
                              <span>{group.request?.doctor || 'Unknown Doctor'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(group.request?.date_requested)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Group Items */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-600">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleItemSelect(item)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-gray-50 dark:focus:bg-gray-600 focus:outline-none transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.lab_test_details?.name}
                                  </span>
                                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                                    {item.lab_test_details?.code}
                                  </span>
                                </div>
                                {item.lab_test_details?.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {item.lab_test_details.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    item.status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : item.status === 'in_progress'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                  }`}>
                                    {item.status || 'pending'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {formError.lab_request_item && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formError.lab_request_item}
            </p>
          )}
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Selected Test Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-blue-600" />
                <span className="font-medium">Patient:</span>
                <span>{selectedItem.lab_request_details?.child || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-3 h-3 text-blue-600" />
                <span className="font-medium">Doctor:</span>
                <span>{selectedItem.lab_request_details?.doctor || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span className="font-medium">Requested:</span>
                <span>{formatDate(selectedItem.lab_request_details?.date_requested)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3 h-3 text-blue-600" />
                <span className="font-medium">Test Code:</span>
                <span>{selectedItem.lab_test_details?.code}</span>
              </div>
            </div>
          </div>
        )}

        {/* Report Notes */}
        <div>
          <label
            htmlFor="report_notes"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center"
          >
            <FileText className="mr-2 w-4 h-4" /> Report Notes
          </label>
          <textarea
            id="report_notes"
            name="report_notes"
            rows={4}
            value={formData.report_notes}
            onChange={handleChange}
            placeholder="Enter detailed test results, findings, and clinical observations..."
            className={`w-full px-4 py-2 rounded-lg border ${
              formError.report_notes
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500`}
          />
          {formError.report_notes && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formError.report_notes}
            </p>
          )}
        </div>

        {/* Internal Notes */}
        <div>
          <label
            htmlFor="internal_notes"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center"
          >
            <AlertCircle className="mr-2 w-4 h-4" /> Internal Notes
          </label>
          <textarea
            id="internal_notes"
            name="internal_notes"
            rows={3}
            value={formData.internal_notes}
            onChange={handleChange}
            placeholder="Internal notes for lab staff (quality control, special handling, etc.)..."
            className={`w-full px-4 py-2 rounded-lg border ${
              formError.internal_notes
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500`}
          />
          {formError.internal_notes && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formError.internal_notes}
            </p>
          )}
        </div>

        {/* Submission & Feedback */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-6 rounded-lg transition shadow focus:ring-2 focus:ring-blue-500"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating & Adding Parameters...
              </>
            ) : (
              <>
                <Plus className="mr-2 w-4 h-4" /> Proceed
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Something went wrong: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}