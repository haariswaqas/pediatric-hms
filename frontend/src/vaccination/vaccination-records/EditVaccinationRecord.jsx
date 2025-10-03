import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateVaccinationRecord,
  fetchVaccines,
  fetchChildren,
  fetchVaccinationRecordById,
  clearSelectedVaccinationRecord,
} from "../../store/vaccination/vaccinationRecordSlice";
import { useParams, useNavigate } from "react-router-dom";

export default function EditVaccinationRecord() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vaccinationRecordId } = useParams();

  const {
    selectedVaccinationRecord: vaccinationRecord,
    vaccines,
    children,
    loading,
    error,
  } = useSelector((state) => state.vaccinationRecord);

  const [vaccinationRecordData, setVaccinationRecordData] = useState({
    child: '',
    vaccine: '',
    dose_number: '',
    scheduled_date: '',
    is_administered: false,
    status: 'SCHEDULED',
    batch_number: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchVaccines());
    dispatch(fetchChildren());
    dispatch(fetchVaccinationRecordById(vaccinationRecordId));

    return () => {
      dispatch(clearSelectedVaccinationRecord());
    };
  }, [dispatch, vaccinationRecordId]);

  useEffect(() => {
    if (vaccinationRecord) {
      setVaccinationRecordData({
        child: vaccinationRecord.child || '',
        vaccine: vaccinationRecord.vaccine || '',
        dose_number: vaccinationRecord.dose_number || '',
        scheduled_date: vaccinationRecord.scheduled_date || '',
        is_administered: vaccinationRecord.is_administered || false,
        status: vaccinationRecord.status || 'SCHEDULED',
        batch_number: vaccinationRecord.batch_number || '',
        notes: vaccinationRecord.notes || '',
      });
    }
  }, [vaccinationRecord]);

  const handleChange = (e) => {
    setVaccinationRecordData({
      ...vaccinationRecordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...vaccinationRecordData,
    };

    dispatch(updateVaccinationRecord({ vaccinationRecordId, updatedData: payload }))
      .then((res) => {
        if (!res.error) {
          navigate('/vaccines/vaccination-records');
        }
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Edit Vaccination Record
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child Select */}
        <div>
          <label htmlFor="child" className="block mb-1 text-gray-700 dark:text-gray-200">Patient</label>
          <select
            id="child"
            name="child"
            value={vaccinationRecordData.child}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select child</option>
            {children?.map(({ id, first_name, last_name }) => (
              <option key={id} value={id}>{first_name} {last_name}</option>
            ))}
          </select>
        </div>

        {/* Vaccine Select */}
        <div>
          <label htmlFor="vaccine" className="block mb-1 text-gray-700 dark:text-gray-200">Vaccine</label>
          <select
            id="vaccine"
            name="vaccine"
            value={vaccinationRecordData.vaccine}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="">Select vaccine</option>
            {vaccines?.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Dose Number */}
        <div>
          <label htmlFor="dose_number" className="block mb-1 text-gray-700 dark:text-gray-200">Dose Number</label>
          <input
            id="dose_number"
            type="number"
            name="dose_number"
            value={vaccinationRecordData.dose_number}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Scheduled Date */}
        <div>
          <label htmlFor="scheduled_date" className="block mb-1 text-gray-700 dark:text-gray-200">Scheduled Date</label>
          <input
            id="scheduled_date"
            type="date"
            name="scheduled_date"
            value={vaccinationRecordData.scheduled_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Is Administered */}
        <div>
          <label htmlFor="is_administered" className="block mb-1 text-gray-700 dark:text-gray-200">Is Administered?</label>
          <div className="flex items-center">
            <input
              id="is_administered"
              type="checkbox"
              name="is_administered"
              checked={vaccinationRecordData.is_administered}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-600 dark:text-gray-300">Check if the vaccine has been administered</span>
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block mb-1 text-gray-700 dark:text-gray-200">Status</label>
          <select
            id="status"
            name="status"
            value={vaccinationRecordData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="MISSED">Missed</option>
            <option value="EXEMPTED">Exempted</option>
          </select>
        </div>

        {/* Batch Number */}
        <div>
          <label htmlFor="batch_number" className="block mb-1 text-gray-700 dark:text-gray-200">Batch Number (optional)</label>
          <input
            id="batch_number"
            type="text"
            name="batch_number"
            value={vaccinationRecordData.batch_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block mb-1 text-gray-700 dark:text-gray-200">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={vaccinationRecordData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
