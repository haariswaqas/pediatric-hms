// src/components/EditLabRequest.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLabRequestById, updateLabRequest } from "../../store/lab/labRequestSlice";
import { fetchChildren } from "../../store/children/childManagementSlice";
import { fetchDiagnoses } from "../../store/diagnosis/diagnosisSlice";
import {
  FlaskConical,
  User,
  FileText,
  ClipboardList,
  CheckCircle2,
  CalendarDays,
  AlertCircle
} from "lucide-react";

export default function EditLabRequest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { labRequestId } = useParams();

  const { selectedLabRequest } = useSelector((s) => s.labRequest);
  const { diagnoses } = useSelector((s) => s.diagnosis);
  const { children } = useSelector((s) => s.childManagement);

  const [formData, setFormData] = useState({
    child: '',
    diagnosis: '',
    status: 'ORDERED',
    priority: 'ROUTINE',
    scheduled_date: '',
    clinical_notes: '',
    special_instructions: '',
    is_fasting: false,
    is_billable: false,
  });

  useEffect(() => {
    dispatch(fetchDiagnoses());
    dispatch(fetchChildren());
    if (labRequestId) dispatch(fetchLabRequestById(labRequestId));
  }, [dispatch, labRequestId]);

  useEffect(() => {
    if (selectedLabRequest) {
      // Helper function to format datetime for datetime-local input
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format to YYYY-MM-DDTHH:MM (datetime-local format)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        child: selectedLabRequest.child || '',
        diagnosis: selectedLabRequest.diagnosis || '',
        status: selectedLabRequest.status || 'ORDERED',
        priority: selectedLabRequest.priority || 'ROUTINE',
        scheduled_date: formatDateTimeLocal(selectedLabRequest.scheduled_date),
        clinical_notes: selectedLabRequest.clinical_notes || '',
        special_instructions: selectedLabRequest.special_instructions || '',
        is_fasting: selectedLabRequest.is_fasting || false,
        is_billable: selectedLabRequest.is_billable || false,
      });
    }
  }, [selectedLabRequest]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const submitData = { ...formData };
    
    // Convert datetime-local string to ISO format for backend
    if (submitData.scheduled_date) {
      submitData.scheduled_date = new Date(submitData.scheduled_date).toISOString();
    }
    
    dispatch(updateLabRequest({ labRequestId, updatedData: submitData }))
      .then((res) => {
        if (!res.error) navigate("/labs/lab-requests");
      });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
        <FlaskConical className="w-6 h-6 mr-2 text-teal-600 dark:text-teal-400" />
        Edit Lab Request
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Child Select */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <User className="w-5 h-5 mr-2" /> Patient
          </label>
          <select
            name="child"
            value={formData.child}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Select child</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis Select */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-5 h-5 mr-2" /> Diagnosis
          </label>
          <select
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Select diagnosis</option>
            {diagnoses.map((d) => (
              <option key={d.id} value={d.id}>
                {d.child_details?.first_name} {d.child_details?.last_name} — {d.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="ORDERED">Ordered</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <AlertCircle className="w-5 h-5 mr-2" /> Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="STAT">Stat</option>
          </select>
        </div>

        {/* Scheduled Date */}
        <div>
          <label htmlFor="scheduled_date" className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <CalendarDays className="w-5 h-5 mr-2" /> Scheduled Date & Time
          </label>
          <input
            type="datetime-local"
            id="scheduled_date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
          />
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-5 h-5 mr-2" /> Clinical Notes
          </label>
          <textarea
            name="clinical_notes"
            rows="3"
            value={formData.clinical_notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <ClipboardList className="w-5 h-5 mr-2" /> Special Instructions
          </label>
          <textarea
            name="special_instructions"
            rows="3"
            value={formData.special_instructions}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex space-x-6">
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="is_fasting"
              checked={formData.is_fasting}
              onChange={handleChange}
              className="mr-2"
            />
            Fasting Required
          </label>
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="is_billable"
              checked={formData.is_billable}
              onChange={handleChange}
              className="mr-2"
            />
            Billable
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition"
        >
          Update Lab Request
        </button>
      </form>
    </div>
  );
}