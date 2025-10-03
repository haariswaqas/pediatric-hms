// src/lab/EditLabResultParameter.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FileText,
  Hash,
  Thermometer,
  List,
  AlertCircle,
  FlaskConical,
  User,
  Calendar,
  Stethoscope,
  ArrowLeft
} from "lucide-react";
import {
  fetchLabResultParameterById,
  updateLabResultParameter,
  clearParameterError,
  clearSelectedParameter
} from "../../store/lab/labResultParameterSlice";
import { fetchLabResults } from "../../store/lab/labResultSlice";
import { fetchReferenceRanges } from "../../store/lab/referenceRangeSlice";

export default function EditLabResultParameter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labResultId, parameterId } = useParams();

  const { labResults } = useSelector((s) => s.labResult);
  const { referenceRanges } = useSelector((s) => s.referenceRange);
  const { loading, error, selectedParameter } = useSelector((s) => s.labResultParameter);

  const [formData, setFormData] = useState({
    lab_result: labResultId || "",
    parameter_name: "",
    value: "",
    reference_range: "",
    units: "",
    status: "NORMAL",
    notes: ""
  });
  const [formError, setFormError] = useState({});

  // Load lists
  useEffect(() => {
    dispatch(fetchLabResults());
    dispatch(fetchReferenceRanges());
  }, [dispatch]);

  // Fetch the parameter details
  useEffect(() => {
    if (parameterId) {
      dispatch(fetchLabResultParameterById(parameterId));
    }
  }, [dispatch, parameterId]);

  // Populate form when data loads
  useEffect(() => {
    if (selectedParameter) {
      setFormData({
        lab_result: selectedParameter.lab_result || labResultId || "",
        parameter_name: selectedParameter.parameter_name || "",
        value: selectedParameter.value || "",
        reference_range: selectedParameter.reference_range || "",
        units: selectedParameter.units || "",
        status: selectedParameter.status || "NORMAL",
        notes: selectedParameter.notes || ""
      });
    }
  }, [selectedParameter, labResultId]);

  // Clear selected parameter on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSelectedParameter());
    };
  }, [dispatch]);

  // Auto-fill units when reference range changes
  useEffect(() => {
    const sel = referenceRanges.find((r) => r.id === parseInt(formData.reference_range));
    setFormData((fd) => ({
      ...fd,
      units: sel?.unit || ""
    }));
  }, [formData.reference_range, referenceRanges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
    setFormError((fe) => ({ ...fe, [name]: null }));
    if (error) dispatch(clearParameterError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!formData.lab_result) errs.lab_result = "Required";
    if (!formData.parameter_name) errs.parameter_name = "Required";
    if (!formData.value) errs.value = "Required";

    setFormError(errs);
    if (Object.keys(errs).length) return;

    try {
      await dispatch(updateLabResultParameter({ 
        labResultParameterId: parameterId, 
        updatedData: formData 
      })).unwrap();
      toast.success("Lab result parameter updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      navigate(-1);
    } catch {
      // Handled by slice
    }
  };

  const labResultOptions = useMemo(
    () => labResults.map((lr) => ({
      id: lr.id,
      label: `${lr.lab_request_item_details?.lab_test || 'Unknown Test'} — ${lr.lab_request_item_details?.child || 'Unknown Patient'}`,
      result: lr
    })),
    [labResults]
  );

  const selectedLabResult = useMemo(() => {
    if (!formData.lab_result || !labResults.length) return null;
    return labResults.find(lr => lr.id.toString() === formData.lab_result.toString());
  }, [formData.lab_result, labResults]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Debug log to see what data we're getting
  console.log('Debug - selectedParameter:', selectedParameter);
  console.log('Debug - formData:', formData);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Hash className="mr-2" /> Edit Lab Result Parameter
        </h1>
        {labResultId && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
        )}
      </div>

      {selectedLabResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Lab Result Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-blue-600" />
              <span className="font-medium dark:text-white">Patient:</span>
              <span className="dark:text-white">{selectedLabResult.lab_request_item_details?.child || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3 h-3 text-blue-600" />
              <span className="font-medium dark:text-white">Doctor:</span>
              <span className="dark:text-white">{selectedLabResult.lab_request_item_details?.doctor || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span className="font-medium dark:text-white">Date:</span>
              <span className="dark:text-white">{formatDate(selectedLabResult.lab_request_item_details?.date_requested)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3 h-3 text-blue-600" />
              <span className="font-medium dark:text-white">Test:</span>
              <span className="dark:text-white">{selectedLabResult.lab_request_item_details?.lab_test || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lab Result Select */}
        <div>
          <label htmlFor="lab_result" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <List className="mr-2 w-4 h-4" /> Lab Result
          </label>
          <select
            id="lab_result"
            name="lab_result"
            value={formData.lab_result}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              formError.lab_result ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 ${
              labResultId ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!!labResultId}
          >
            <option value="">-- select lab result --</option>
            {labResultOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {formError.lab_result && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {formError.lab_result}
            </p>
          )}
        </div>

        {/* Reference Range */}
        <div>
          <label htmlFor="reference_range" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <List className="mr-2 w-4 h-4" /> Reference Range
          </label>
          <select
            id="reference_range"
            name="reference_range"
            value={formData.reference_range}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- select reference range --</option>
            {referenceRanges.map((rr) => (
              <option key={rr.id} value={rr.id}>
                {rr.parameter_name} ({rr.min_value} - {rr.max_value} {rr.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Parameter Name */}
        <div>
          <label htmlFor="parameter_name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <Thermometer className="mr-2 w-4 h-4" /> Parameter Name
          </label>
          <input
            type="text"
            id="parameter_name"
            name="parameter_name"
            value={formData.parameter_name}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              formError.parameter_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500`}
          />
          {formError.parameter_name && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {formError.parameter_name}
            </p>
          )}
        </div>

        {/* Value */}
        <div>
          <label htmlFor="value" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <Hash className="mr-2 w-4 h-4" /> Value
          </label>
          <input
            type="text"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              formError.value ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500`}
          />
          {formError.value && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {formError.value}
            </p>
          )}
        </div>

        {/* Units */}
        <div>
          <label htmlFor="units" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <Hash className="mr-2 w-4 h-4" /> Units
          </label>
          <input
            type="text"
            id="units"
            name="units"
            value={formData.units}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <AlertCircle className="mr-2 w-4 h-4" /> Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="LOW">Low</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <FileText className="mr-2 w-4 h-4" /> Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Server Error */}
        {error && (
          <p className="text-red-600 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}