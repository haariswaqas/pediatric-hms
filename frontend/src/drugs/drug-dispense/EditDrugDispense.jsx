import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDrugDispenseById, updateDrugDispense } from "../../store/drugs/drugDispenseSlice";
import { fetchPrescriptionItems } from "../../store/prescriptions/prescriptionItemSlice";
import { FileText, MessageSquare } from "lucide-react";
import Field from '../components/utils'
import { inputCls } from '../components/utils'

export default function EditDrugDispense() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drugDispenseId } = useParams();
  const { selectedDrugDispense, loading, error } = useSelector((s) => s.drugDispense);
  const { prescriptionItems } = useSelector((s) => s.prescriptionItem);

  const [formData, setFormData] = useState({
    prescription_item: "",
    quantity_dispensed: "",
    batch_number: "",
    dispensing_notes: "",
    is_refill: false,
  });

  useEffect(() => {
    if (drugDispenseId) {
      dispatch(fetchDrugDispenseById(drugDispenseId));
    }
    dispatch(fetchPrescriptionItems());
  }, [dispatch, drugDispenseId]);

  useEffect(() => {
    if (selectedDrugDispense) {
      setFormData({
        prescription_item: selectedDrugDispense.prescription_item,
        quantity_dispensed: selectedDrugDispense.quantity_dispensed,
        batch_number: selectedDrugDispense.batch_number,
        dispensing_notes: selectedDrugDispense.dispensing_notes,
        is_refill: selectedDrugDispense.is_refill,
      });
    }
  }, [selectedDrugDispense]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
    };
    dispatch(
      updateDrugDispense({
        drugDispenseId,
        updatedData: payload,
      })
    ).then((res) => {
      if (!res.error) navigate("/drugs/drug-dispenses");
    });
  };


  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        Loading…
      </div>
    );
  }

  if (!selectedDrugDispense) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        Drug Dispense not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
        Edit Drug Dispense
      </h1>

      {error && (
        <div className="flex items-center mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          <MessageSquare className="w-5 h-5 mr-2" />
          {error}
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
            disabled
          >
            <option value="">Select Prescription Item</option>
            {prescriptionItems.map((d) => (
              <option key={d.id} value={d.id}>
                {d.drug_details.name} ({d.drug_details.strength}) prescribed by Dr. {d.prescription_details.doctor_first_name} {d.prescription_details.doctor_last_name} for {d.prescription_details.child_first_name} {d.prescription_details.child_last_name}
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
          ></textarea>
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
          Update Drug Dispense
        </button>
      </form>
    </div>
  );
}

