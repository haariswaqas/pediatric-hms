import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  updatePrescriptionItem,
  fetchPrescriptionItemById,
} from "../../store/prescriptions/prescriptionItemSlice";
import { fetchPrescriptions } from "../../store/prescriptions/prescriptionSlice";
import { fetchDrugs } from "../../store/drugs/drugSlice";
import { FREQUENCY_CHOICES, DURATION_UNIT_CHOICES } from "./AddPrescriptionItem";
import {
  ClipboardList,
  User,
  Scale,
  Calendar as CalIcon,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function EditPrescriptionItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptionItemId } = useParams();

  const { prescriptions } = useSelector((s) => s.prescription);
  const { drugs } = useSelector((s) => s.drug);
  const { selectedPrescriptionItem, loading, error } = useSelector(
    (s) => s.prescriptionItem
  );

  const [formData, setFormData] = useState({
    prescription: "",
    drug: "",
    dosage: "",
    frequency: "",
    duration_value: "",
    duration_unit: "",
    max_refills: "",
    refills_used: "",
    instructions: "",
    is_weight_based: false,
    dose_per_kg: "",
    min_dose: "",
    max_dose: "",
  });

  useEffect(() => {
    dispatch(fetchPrescriptions());
    dispatch(fetchDrugs());
  }, [dispatch]);

  useEffect(() => {
    if (prescriptionItemId) {
      dispatch(fetchPrescriptionItemById(prescriptionItemId)).then((res) => {
        if (!res.error) {
          setFormData(res.payload);
        }
      });
    }
  }, [dispatch, prescriptionItemId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((fd) => ({
      ...fd,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePrescriptionItem({ prescriptionItemId, updatedData: formData })).then(
      (res) => {
        if (!res.error) {
          navigate('/prescriptions/items');
        }
      }
    );
  };

  const inputCls = `w-full px-4 py-2 border rounded-md
    bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
    focus:ring-2 focus:ring-indigo-400`;

  if (loading) return <div className="text-center py-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <ClipboardList className="w-6 h-6 mr-2 text-yellow-600 dark:text-yellow-400" />
        Edit Prescription Item
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Prescription */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5 mr-2" /> Prescription
          </label>
          <select
            name="prescription"
            value={formData.prescription}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Prescription</option>
            {prescriptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.child_details?.first_name} {p.child_details?.last_name} —{' '}
                {p.date_prescribed?.split('T')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Drug */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 mr-2" /> Drug
          </label>
          <select
            name="drug"
            value={formData.drug}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Drug</option>
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.strength})
              </option>
            ))}
          </select>
        </div>

        {/* Dosage */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <Scale className="w-5 h-5 mr-2" /> Dosage
          </label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <CalIcon className="w-5 h-5 mr-2" /> Frequency
          </label>
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Frequency</option>
            {FREQUENCY_CHOICES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Duration & unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 text-gray-700 dark:text-gray-300">Duration</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="duration_value"
                value={formData.duration_value}
                onChange={handleChange}
                required
                className={inputCls}
              />
              <select
                name="duration_unit"
                value={formData.duration_unit}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Unit</option>
                {DURATION_UNIT_CHOICES.map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Refills */}
          <div>
            <label className="mb-1 text-gray-700 dark:text-gray-300">Max/Used</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="max_refills"
                value={formData.max_refills}
                onChange={handleChange}
                className={inputCls}
              />
              <input
                type="number"
                name="refills_used"
                value={formData.refills_used}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <FileText className="w-5 h-5 mr-2" /> Instructions
          </label>
          <textarea
            name="instructions"
            rows={3}
            value={formData.instructions}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* Weight-based */}
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          <label className="text-gray-700 dark:text-gray-300">Weight-based dosing</label>
          <input
            type="checkbox"
            name="is_weight_based"
            checked={formData.is_weight_based}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>

        {/* Weight-based fields */}
        {formData.is_weight_based && (
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              name="dose_per_kg"
              value={formData.dose_per_kg}
              onChange={handleChange}
              placeholder="Dose per kg"
              className={inputCls}
            />
            <input
              type="number"
              name="min_dose"
              value={formData.min_dose}
              onChange={handleChange}
              placeholder="Min dose"
              className={inputCls}
            />
            <input
              type="number"
              name="max_dose"
              value={formData.max_dose}
              onChange={handleChange}
              placeholder="Max dose"
              className={inputCls}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white font-semibold rounded-md transition"
        >
          <ClipboardList className="w-5 h-5" /> Update Item
        </button>
      </form>
    </div>
  );
}
