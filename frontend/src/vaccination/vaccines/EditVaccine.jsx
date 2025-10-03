// src/components/vaccines/EditVaccine.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVaccineById, updateVaccine } from "../../store/vaccination/vaccineSlice";

export default function EditVaccine() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vaccineId } = useParams();

  const { selectedVaccine, loading, error } = useSelector((state) => state.vaccine);

  const [vaccineData, setVaccineData] = useState({
    name: '',
    description: '',
    recommended_age_start: '',
    recommended_age_end: '',
    doses_required: '',
    booster_required: false,
    booster_interval_months: '',
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchVaccineById(vaccineId));
  }, [dispatch, vaccineId]);

  useEffect(() => {
    if (selectedVaccine && selectedVaccine.id === parseInt(vaccineId)) {
      setVaccineData(selectedVaccine);
    }
  }, [selectedVaccine, vaccineId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVaccineData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!vaccineData.name) errors.name = "Please enter a vaccine name";
    if (!vaccineData.doses_required) errors.doses_required = "Doses required is needed";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateVaccine({ vaccineId, updatedData: vaccineData })).unwrap();
      navigate("/vaccines");
    } catch (err) {
      console.error("Error updating vaccine:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Edit Vaccine</h2>
      {error && (
        <div className="mb-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Name</label>
          <input
            type="text"
            name="name"
            value={vaccineData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Description</label>
          <textarea
            name="description"
            value={vaccineData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Recommended Age Start</label>
            <input
              type="number"
              name="recommended_age_start"
              value={vaccineData.recommended_age_start}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">Recommended Age End</label>
            <input
              type="number"
              name="recommended_age_end"
              value={vaccineData.recommended_age_end}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-200">Doses Required</label>
          <input
            type="number"
            name="doses_required"
            value={vaccineData.doses_required}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          {formErrors.doses_required && <p className="text-red-500 text-sm">{formErrors.doses_required}</p>}
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              name="booster_required"
              checked={vaccineData.booster_required}
              onChange={handleChange}
              className="mr-2"
            />
            Booster Required
          </label>

          {vaccineData.booster_required && (
            <input
              type="number"
              name="booster_interval_months"
              placeholder="Interval in months"
              value={vaccineData.booster_interval_months}
              onChange={handleChange}
              className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          )}
        </div>
        <div>
  <label className="flex items-center text-gray-700 dark:text-gray-200">
    <input
      type="checkbox"
      name="is_active"
      checked={vaccineData.is_active}
      onChange={handleChange}
      className="mr-2"
    />
    Active
  </label>
</div>


        <div className="flex justify-between">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting || loading ? "Updating..." : "Update"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/vaccines")}
            className="text-gray-600 dark:text-gray-300 underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}