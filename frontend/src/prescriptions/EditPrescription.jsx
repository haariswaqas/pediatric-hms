// src/components/EditPrescription.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPrescriptionById, updatePrescription } from "../store/prescriptions/prescriptionSlice";
import { fetchChildren } from "../store/children/childManagementSlice";
import { fetchDiagnoses } from "../store/diagnosis/diagnosisSlice";
import {
  ClipboardEdit,
  User,
  FileText,
  Scale,
  Calendar,
  CheckCircle2
} from "lucide-react";

export default function EditPrescription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptionId } = useParams();

  const { selectedPrescription } = useSelector((s) => s.prescription);
  const { diagnoses } = useSelector((s) => s.diagnosis);
  const { children } = useSelector((s) => s.childManagement);

  const [formData, setFormData] = useState({
    child: "",
    diagnosis: "",
    
    valid_until: "",
    notes: "",
    status: "",
  });

  // Fetch dropdown data and the prescription to edit
  useEffect(() => {
    dispatch(fetchDiagnoses());
    dispatch(fetchChildren());
    if (prescriptionId) dispatch(fetchPrescriptionById(prescriptionId));
  }, [dispatch, prescriptionId]);

  // Populate form once data is loaded
  useEffect(() => {
    if (selectedPrescription) {
      setFormData({
        child: selectedPrescription.child || "",
        diagnosis: selectedPrescription.diagnosis || "",
       
        valid_until: selectedPrescription.valid_until || "",
        notes: selectedPrescription.notes || "",
        status: selectedPrescription.status || "",
      });
    }
  }, [selectedPrescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePrescription({ prescriptionId, updatedData: formData }))
      .then((res) => {
        if (!res.error) navigate("/prescriptions");
      });
  };



  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
        <ClipboardEdit className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
        Edit Prescription
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient Select */}
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

     

        {/* Valid Until */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <Calendar className="w-5 h-5 mr-2" /> Valid Until
          </label>
          <input
            type="date"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-5 h-5 mr-2" /> Notes
          </label>
          <textarea
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Status Select */}
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
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition"
        >
          Update Prescription
        </button>
      </form>
    </div>
  );
}
