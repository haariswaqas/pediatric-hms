import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createDrugInteraction } from "../../store/drugs/drugInteractionSlice";
import { fetchDrugs } from "../../store/drugs/drugSlice";
import {
  GitMerge,
  AlertTriangle,
  FileText,
  MessageSquare,
  Link2,
} from "lucide-react";
import Field from '../components/utils'
import { inputCls } from '../components/utils'

const SEVERITY_CHOICES = [
  { value: "MINOR", label: "Minor" },
  { value: "MODERATE", label: "Moderate" },
  { value: "MAJOR", label: "Major" },
  { value: "CONTRAINDICATED", label: "Contraindicated" },
];

export default function AddDrugInteraction() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drugId } = useParams();
  const { drugs, loading, error } = useSelector((s) => s.drug);

  const [formData, setFormData] = useState({
    drug_one: "",
    drug_two: "",
    severity: "",
    description: "",
    alternative_suggestion: "",
  });

  useEffect(() => {
    if (drugId) setFormData((p) => ({ ...p, drug_one: drugId }));
    dispatch(fetchDrugs());
  }, [dispatch, drugId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createDrugInteraction(formData)).then((res) => {
      if (!res.error) navigate("/drugs/drug-interactions");
    });
  };

  const inputCls = `w-full px-4 py-2 border rounded-md 
    bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 
    focus:ring-2 focus:ring-indigo-400`;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <GitMerge className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
        Add Drug Interaction
      </h1>

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
          Loading drugs...
        </p>
      )}
      {error && (
        <div className="flex items-center mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drug One */}
        <Field icon={<Link2 />} label="Drug One">
          <select
            name="drug_one"
            value={formData.drug_one}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Drug One</option>
            {drugs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Drug Two */}
        <Field icon={<Link2 />} label="Drug Two">
          <select
            name="drug_two"
            value={formData.drug_two}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Drug Two</option>
            {drugs
              .filter((d) => String(d.id) !== String(formData.drug_one))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </Field>

        {/* Severity as dropdown */}
        <Field icon={<AlertTriangle />} label="Severity">
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className={inputCls}
          >
            <option value="">Select Severity</option>
            {SEVERITY_CHOICES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Description */}
        <Field icon={<FileText />} label="Description">
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            required
            className={inputCls}
            placeholder="Describe the interaction"
          />
        </Field>

        {/* Alternative Suggestion */}
        <Field icon={<MessageSquare />} label="Alternative Suggestion">
          <textarea
            name="alternative_suggestion"
            rows="2"
            value={formData.alternative_suggestion}
            onChange={handleChange}
            className={inputCls}
            placeholder="Suggest an alternative"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-md transition"
        >
          <GitMerge className="w-5 h-5" />
          Create Interaction
        </button>
      </form>
    </div>
  );
}

