// src/components/AddPrescriptionItem.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPrescriptionItem } from "../../store/prescriptions/prescriptionItemSlice";
import { fetchPrescriptions } from "../../store/prescriptions/prescriptionSlice";
import { fetchDrugs, searchDrugs } from "../../store/drugs/drugSlice";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardList,
  User,
  Scale,
  Calendar as CalIcon,
  FileText,
  CheckCircle2,
  PlusCircle,
  Search,
  X
} from "lucide-react";

export const FREQUENCY_CHOICES = [
  ["QD","Once daily"],["BID","Twice daily"],["TID","Three times daily"],
  ["QID","Four times daily"],["Q4H","Every 4 hours"],["Q6H","Every 6 hours"],
  ["Q8H","Every 8 hours"],["Q12H","Every 12 hours"],["PRN","As needed"],
  ["STAT","Immediately"],["AC","Before meals"],["PC","After meals"],
  ["HS","At bedtime"],
];

export const DURATION_UNIT_CHOICES = [
  ["DAYS","Days"],["WEEKS","Weeks"],["MONTHS","Months"],
];

export default function AddPrescriptionItem() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { prescriptionId } = useParams();

  const { prescriptions }   = useSelector(s => s.prescription);
  const { drugs }           = useSelector(s => s.drug);
  const { loading, error }  = useSelector(s => s.prescriptionItem);

  const [formData, setFormData] = useState({
    prescription: "",
    drug: "",
    dosage: "",
    frequency: "",
    duration_value: "",
    duration_unit: "",
    instructions: "",
    is_weight_based: false,
    dose_per_kg: "",
    min_dose: "",
    max_dose: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  
  // Drug search states
  const [drugSearch, setDrugSearch] = useState("");
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [selectedDrugName, setSelectedDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const drugInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // load lists
  useEffect(() => {
    dispatch(fetchPrescriptions());
    dispatch(fetchDrugs());
  }, [dispatch]);

  // pre-fill prescription if URL has prescriptionId
  useEffect(() => {
    if (prescriptionId && prescriptions.length > 0) {
      const sel = prescriptions.find(p => String(p.id) === String(prescriptionId));
      if (sel) {
        setFormData(fd => ({ ...fd, prescription: prescriptionId }));
      }
    }
  }, [prescriptionId, prescriptions]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDrugDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDrugSearch = (e) => {
    const value = e.target.value;
    setDrugSearch(value);
    setShowDrugDropdown(true);
    
    // Clear selection if user is typing
    if (formData.drug) {
      setFormData(fd => ({ ...fd, drug: "" }));
      setSelectedDrugName("");
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(searchDrugs(value.trim())).then((res) => {
          if (!res.error) {
            setSearchResults(res.payload);
          }
          setIsSearching(false);
        });
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const selectDrug = (drug) => {
    setFormData(fd => ({ ...fd, drug: drug.id }));
    setSelectedDrugName(`${drug.name} (${drug.strength})`);
    setDrugSearch(`${drug.name} (${drug.strength})`);
    setShowDrugDropdown(false);
  };

  const clearDrugSelection = () => {
    setFormData(fd => ({ ...fd, drug: "" }));
    setSelectedDrugName("");
    setDrugSearch("");
    setSearchResults([]);
    drugInputRef.current?.focus();
  };

  const clearFieldsExceptPrescription = () => {
    setFormData(fd => ({
      prescription: fd.prescription,
      drug: "",
      dosage: "",
      frequency: "",
      duration_value: "",
      duration_unit: "",
      instructions: "",
      is_weight_based: false,
      dose_per_kg: "",
      min_dose: "",
      max_dose: "",
    }));
    setDrugSearch("");
    setSelectedDrugName("");
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createPrescriptionItem(formData))
      .then(res => {
        if (!res.error) {
          setSuccessMsg("✓ Item added successfully!");
          clearFieldsExceptPrescription();
          // auto-clear success banner
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      });
  };

  const inputCls = `w-full px-4 py-2 border rounded-md
    bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
    focus:ring-2 focus:ring-indigo-400`;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        <ClipboardList className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
        Add Prescription Item
      </h1>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          {successMsg}
        </div>
      )}

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
            disabled={!!prescriptionId}
          >
            <option value="">Select Prescription</option>
            {prescriptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.child_details?.first_name}{" "}
                {p.child_details?.last_name} —{" "}
                {p.date_prescribed?.split("T")[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Drug - Searchable */}
        <div className="relative" ref={dropdownRef}>
          <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
            <PlusCircle className="w-5 h-5 mr-2" /> Drug *
          </label>
          <div className="relative">
            <div className="relative">
              <input
                ref={drugInputRef}
                type="text"
                value={drugSearch}
                onChange={handleDrugSearch}
                onFocus={() => setShowDrugDropdown(true)}
                placeholder="Search for drug name or strength..."
                className={`${inputCls} pr-12`}
                autoComplete="off"
                required={!formData.drug}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {formData.drug ? (
                  <button
                    type="button"
                    onClick={clearDrugSelection}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                ) : (
                  <Search className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Dropdown */}
            {showDrugDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {isSearching ? (
                  <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                    Searching drugs...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(drug => (
                    <button
                      key={drug.id}
                      type="button"
                      onClick={() => selectDrug(drug)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {drug.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Strength: {drug.strength}
                        {drug.generic_name && (
                          <span className="ml-2">• Generic: {drug.generic_name}</span>
                        )}
                        {drug.category && (
                          <span className="ml-2">• {drug.category}</span>
                        )}
                      </div>
                    </button>
                  ))
                ) : drugSearch.trim() ? (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    No drugs found matching "{drugSearch}"
                  </div>
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    Type to search for drugs...
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected drug indicator */}
          {formData.drug && selectedDrugName && (
            <div className="mt-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Selected: {selectedDrugName}
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}
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
            placeholder="e.g. 10mg/kg"
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
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
              <CalIcon className="w-5 h-5 mr-2" /> Duration Value
            </label>
            <input
              type="number"
              name="duration_value"
              value={formData.duration_value}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="flex items-center mb-1 text-gray-700 dark:text-gray-300">
              <CalIcon className="w-5 h-5 mr-2" /> Duration Unit
            </label>
            <select
              name="duration_unit"
              value={formData.duration_unit}
              onChange={handleChange}
              required
              className={inputCls}
            >
              <option value="">Select Unit</option>
              {DURATION_UNIT_CHOICES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
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

        {/* Weight-based toggle */}
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-md transition"
        >
          <ClipboardList className="w-5 h-5" /> Add Item
        </button>
      </form>
    </div>
  );
}