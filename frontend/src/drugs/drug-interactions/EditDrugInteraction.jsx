import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchDrugInteractionById,
  updateDrugInteraction,
} from "../../store/drugs/drugInteractionSlice";
import { fetchDrugs } from "../../store/drugs/drugSlice";
import {
  Edit3,
  GitMerge,
  Link2,
  AlertTriangle,
  FileText,
  MessageSquare,
} from "lucide-react";
import Field from '../components/utils'
import { inputCls } from '../components/utils'

export default function EditDrugInteraction() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drugInteractionId } = useParams();
  const { selectedDrugInteraction, drugs, loading, error } = useSelector(
    (s) => s.drugInteraction
  );
  const [formData, setFormData] = useState({
    drug_one: "",
    drug_two: "",
    severity: "",
    description: "",
    alternative_suggestion: "",
  });

  useEffect(() => {
    if (drugInteractionId) {
      dispatch(fetchDrugInteractionById(drugInteractionId));
    }
    dispatch(fetchDrugs());
  }, [dispatch, drugInteractionId]);

  useEffect(() => {
    if (selectedDrugInteraction) {
      setFormData({
        drug_one: selectedDrugInteraction.drug_one,
        drug_two: selectedDrugInteraction.drug_two,
        severity: selectedDrugInteraction.severity,
        description: selectedDrugInteraction.description,
        alternative_suggestion:
          selectedDrugInteraction.alternative_suggestion,
      });
    }
  }, [selectedDrugInteraction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateDrugInteraction({
        drugInteractionId,
        updatedData: formData,
      })
    ).then((res) => {
      if (!res.error) navigate("/drugs/drug-interactions");
    });
  };

  const inputCls = `w-full px-4 py-2 border rounded-md
    bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
    focus:ring-2 focus:ring-indigo-400`;

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-400">
        Loading…
      </div>
    );
  if (!selectedDrugInteraction)
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Interaction not found
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
      <h1 className="flex items-center text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        <Edit3 className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
        Edit Drug Interaction
      </h1>

      {error && (
        <div className="flex items-center mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field icon={<Link2 />} label="Drug One">
          <select
            name="drug_one"
            value={formData.drug_one}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Drug</option>
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<Link2 />} label="Drug Two">
          <select
            name="drug_two"
            value={formData.drug_two}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Drug</option>
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<AlertTriangle />} label="Severity">
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className={inputCls}
            required
          >
            <option value="">Select Severity</option>
            <option value="MINOR">Minor</option>
            <option value="MODERATE">Moderate</option>
            <option value="MAJOR">Major</option>
            <option value="CONTRAINDICATED">Contraindicated</option>
          </select>
        </Field>

        <Field icon={<FileText />} label="Description">
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={inputCls}
            required
          />
        </Field>

        <Field icon={<MessageSquare />} label="Alternative Suggestion">
          <textarea
            name="alternative_suggestion"
            rows={2}
            value={formData.alternative_suggestion}
            onChange={handleChange}
            className={inputCls}
          />
        </Field>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/drugs/drug-interactions")}
            className="px-5 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md transition"
          >
            Update Interaction
          </button>
        </div>
      </form>
    </div>
  );
}

