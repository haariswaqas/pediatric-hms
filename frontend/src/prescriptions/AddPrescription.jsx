// src/components/AddPrescription.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createPrescription } from "../store/prescriptions/prescriptionSlice";
import { fetchChildren } from "../store/children/childManagementSlice";
import { fetchDiagnoses } from "../store/diagnosis/diagnosisSlice";
import {
  User, ClipboardList, Scale, Calendar, FileText, CheckCircle2
} from "lucide-react";

export default function AddPrescription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { diagnosisId, childId } = useParams();
  const { diagnoses, loading, error } = useSelector((state) => state.diagnosis);
  const { children } = useSelector((state) => state.childManagement);

  const [formData, setFormData] = useState({
    child: "",
    diagnosis: "",
    valid_until: "",
    notes: "",
    status: "",
  });

  // Find the selected diagnosis when diagnosisId is provided
  const selectedDiagnosis = diagnosisId 
    ? diagnoses.find((diag) => String(diag.id) === String(diagnosisId))
    : null;

  // Find the selected child when childId is provided
  const selectedChild = childId 
    ? children.find((child) => String(child.id) === String(childId))
    : null;

  // Set the diagnosis and child when diagnosisId is provided
  useEffect(() => {
    if (diagnosisId) {
      setFormData(prev => ({
        ...prev,
        diagnosis: diagnosisId
      }));
    }
  }, [diagnosisId]);

  // Set the child when diagnosisId is provided and selectedDiagnosis is available
  useEffect(() => {
    if (selectedDiagnosis && selectedDiagnosis.child_details?.id) {
      setFormData(prev => ({
        ...prev,
        child: selectedDiagnosis.child_details.id
      }));
    }
  }, [selectedDiagnosis]);

  // Set the child when childId is provided directly
  useEffect(() => {
    if (childId) {
      setFormData(prev => ({
        ...prev,
        child: childId
      }));
    }
  }, [childId]);

  // Fetch data on component mount (exactly like AddTreatment)
  useEffect(() => {
    dispatch(fetchDiagnoses());
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createPrescription(formData)).then((res) => {
      if (!res.error) {
        // navigate directly to adding items for that new prescription
        navigate(`/prescriptions/add-item/${res.payload.id}`);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
        {selectedDiagnosis
          ? `Add Prescription for ${selectedDiagnosis.child_details.first_name} ${selectedDiagnosis.child_details.last_name} - ${selectedDiagnosis.title}`
          : selectedChild
          ? `Add Prescription for ${selectedChild.first_name} ${selectedChild.last_name}`
          : 'Add New Prescription'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient */}
        <div>
          <label htmlFor="child" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Patient
          </label>
          <select
            id="child"
            name="child"
            value={formData.child}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a patient</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis */}
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Diagnosis
          </label>
          <select
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a diagnosis</option>
            {diagnoses.map((diag) => (
              <option key={diag.id} value={diag.id}>
                {diag.child_details.first_name} {diag.child_details.last_name}, {new Date(diag.date_diagnosed).toLocaleDateString()} - {diag.title} - {diag.description}
              </option>
            ))}
          </select>
        </div>

        {/* Valid Until */}
        <div>
          <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Valid Until
          </label>
          <input
            type="date"
            id="valid_until"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
}