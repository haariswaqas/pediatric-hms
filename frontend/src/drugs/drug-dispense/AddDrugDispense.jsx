import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { createDrugDispense } from "../../store/drugs/drugDispenseSlice";
import { fetchPrescriptionItems } from "../../store/prescriptions/prescriptionItemSlice";
import { FileText, MessageSquare } from "lucide-react";
import Field from '../components/utils'
import { inputCls } from '../components/utils'

export default function AddDrugDispense() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptionItemId } = useParams();
  const { prescriptionItems, loading, error } = useSelector((s) => s.prescriptionItem);

  const [formData, setFormData] = useState({
    prescription_item: "",
    quantity_dispensed: "",
    batch_number: "",
    dispensing_notes: "",
    is_refill: false,
  });

  // this holds any submission error (e.g. payment not paid)
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (prescriptionItemId) {
      setFormData((p) => ({ ...p, prescription_item: prescriptionItemId }));
    }
    dispatch(fetchPrescriptionItems());
  }, [dispatch, prescriptionItemId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const action = await dispatch(createDrugDispense(formData));
      const result = unwrapResult(action);
      // success!
      navigate("/drugs/drug-dispenses");
    } catch (err) {
      // err.message will contain the API error message
      setSubmitError(
        err.message ||
        "Unable to dispense — please ensure the bill is at least half paid."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        Dispense Drug 
      </h1>

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
          Loading prescription items...
        </p>
      )}
      {error && (
        <div className="flex items-center mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          <MessageSquare className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {submitError && (
        <div className="flex items-center mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
          <MessageSquare className="w-5 h-5 mr-2" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field icon={<FileText />} label="Prescription Item">
          <select
            name="prescription_item"
            value={formData.prescription_item}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Prescription Item</option>
            {prescriptionItems.map((d) => (
              <option key={d.id} value={d.id}>
                {d.drug_details.name} ({d.drug_details.strength}) — Dr.{" "}
                {d.prescription_details.doctor_first_name}{" "}
                {d.prescription_details.doctor_last_name} for{" "}
                {d.prescription_details.child_first_name}{" "}
                {d.prescription_details.child_last_name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<MessageSquare />} label="Quantity Dispensed">
          <input
            type="number"
            name="quantity_dispensed"
            value={formData.quantity_dispensed}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </Field>

        <Field icon={<MessageSquare />} label="Batch Number">
          <input
            type="text"
            name="batch_number"
            value={formData.batch_number}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </Field>

        <Field icon={<MessageSquare />} label="Dispensing Notes">
          <textarea
            name="dispensing_notes"
            value={formData.dispensing_notes}
            onChange={handleChange}
            className={inputCls}
            rows="4"
          />
        </Field>

        <Field icon={<MessageSquare />} label="Is Refill">
          <input
            type="checkbox"
            name="is_refill"
            checked={formData.is_refill}
            onChange={handleChange}
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
        >
          Add Drug Dispense
        </button>
      </form>
    </div>
  );
}
