// src/lab/AddLabResultParameter.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FileText,
  Hash,
  Thermometer,
  List,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  User,
  Calendar,
  Stethoscope,
  Plus,
  ArrowLeft
} from "lucide-react";
import {
  createLabResultParameter,
  clearParameterError
} from "../../store/lab/labResultParameterSlice";
import { fetchLabResults } from "../../store/lab/labResultSlice";
import { fetchReferenceRanges } from "../../store/lab/referenceRangeSlice";

export default function AddLabResultParameter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labResultId } = useParams();

  const { labResults } = useSelector((s) => s.labResult);
  const { referenceRanges } = useSelector((s) => s.referenceRange);
  const { loading, error } = useSelector((s) => s.labResultParameter);

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
  const [continueAdding, setContinueAdding] = useState(false);

  // Find the selected lab result for display
  const selectedLabResult = useMemo(() => {
    if (!formData.lab_result || !labResults.length) return null;
    return labResults.find(lr => lr.id.toString() === formData.lab_result.toString());
  }, [formData.lab_result, labResults]);

  // Load lab results and reference ranges
  useEffect(() => {
    dispatch(fetchLabResults());
    dispatch(fetchReferenceRanges());
  }, [dispatch]);

  // When reference_range changes, auto-fill units
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

  const resetParameterForm = () => {
    setFormData((fd) => ({
      ...fd,
      parameter_name: "",
      value: "",
      reference_range: "",
      units: "",
      status: "NORMAL",
      notes: ""
    }));
    setFormError({});
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    setContinueAdding(shouldContinue);
  
    const errs = {};
    if (!formData.lab_result) errs.lab_result = "Required";
    if (!formData.parameter_name) errs.parameter_name = "Required";
    if (!formData.value) errs.value = "Required";
  
    setFormError(errs);
    if (Object.keys(errs).length) return;
  
    try {
      await dispatch(createLabResultParameter(formData)).unwrap();
  
      toast.success("Added to lab result successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      }); // 👈 This shows a success toast
  
      if (shouldContinue) {
        resetParameterForm();
      } else {
        navigate(-1);
      }
    } catch {
      // Error handled by slice
    }
  };
  

  // Memoize dropdown options
  const labResultOptions = useMemo(
    () => labResults.map((lr) => ({ 
      id: lr.id, 
      label: `${lr.lab_request_item_details?.lab_test || 'Unknown Test'} — ${lr.lab_request_item_details?.child || 'Unknown Patient'}`,
      result: lr
    })),
    [labResults]
  );

  
  // Optional: Clear reference range when lab result changes
  useEffect(() => {
    setFormData(fd => ({
      ...fd,
      reference_range: "",
      units: ""
    }));
  }, [formData.lab_result]);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Hash className="mr-2" /> Record Lab Results
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

      {/* Selected Lab Result Details */}
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

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Lab Result Select - disabled if coming from URL param */}
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
            placeholder="e.g., Hemoglobin, WBC, Glucose"
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
            placeholder="Enter result value"
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

      

      

   

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 flex items-center">
            <FileText className="mr-2 w-4 h-4" /> Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Server Error */}
        {error && (
          <p className="text-red-600 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="mr-2 w-4 h-4" /> Save & Add Another
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
