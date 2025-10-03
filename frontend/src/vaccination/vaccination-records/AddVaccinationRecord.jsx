import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchVaccines,
  fetchChildren,
  createVaccinationRecord,
} from '../../store/vaccination/vaccinationRecordSlice';


const AddVaccinationRecord = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const {childId} = useParams();
  const { children, vaccines, loading, error } = useSelector((state) => state.vaccinationRecord);

  const [formData, setFormData] = useState({
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
          if (childId) {
            setFormData(prev => ({
              ...prev,
              child: childId
            }));
          }
        }, [childId]);

       
  useEffect(() => {
    dispatch(fetchVaccines());
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

    const payload = {
      ...formData,
    };

    dispatch(createVaccinationRecord(payload)).then((res) => {
      if (!res.error) {
        navigate('/vaccines/vaccination-records');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Add New Vaccination Record
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
            value={formData.child}
            onChange={handleChange}
            disabled={!!childId}
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
            value={formData.vaccine}
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
            value={formData.dose_number}
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
            value={formData.scheduled_date}
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
              checked={formData.is_administered}
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
            value={formData.status}
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
            value={formData.batch_number}
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
            value={formData.notes}
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
            {loading ? 'Saving...' : 'Add Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVaccinationRecord;
