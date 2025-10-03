import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTreatmentById, updateTreatment } from '../../store/diagnosis/treatmentSlice';
import { fetchDiagnoses } from '../../store/diagnosis/diagnosisSlice';

const EditTreatment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { treatmentId } = useParams();
    const { selectedTreatment, loading, error } = useSelector((state) => state.treatment);
    const {diagnoses} = useSelector((state) => state.diagnosis)

    const [formData, setFormData] = useState({
        diagnosis: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        if (treatmentId) {
            dispatch(fetchTreatmentById(treatmentId));
        }
    }, [dispatch, treatmentId]);

    useEffect(() => {
        if (selectedTreatment) {
            setFormData({
                diagnosis: selectedTreatment.diagnosis,
                title: selectedTreatment.title,
                description: selectedTreatment.description
            });
        }
    }, [selectedTreatment]);

    useEffect(() => {
        dispatch(fetchDiagnoses());
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
        dispatch(updateTreatment({
            treatmentId,
            updatedData: formData
        })).then((res) => {
            if (!res.error) {
                navigate('/diagnosis/treatments');
            }
        });
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!selectedTreatment) {
        return <div className="text-center py-10">Treatment not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                Edit Treatment: {selectedTreatment.title}
            </h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Diagnosis
                    </label>
                    <select
                        id="diagnosis"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        required
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Select a diagnosis</option>
                        {diagnoses.map((diag) => (
                            <option key={diag.id} value={diag.id}>
                                {diag.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Treatment Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Update Treatment'}
                </button>
            </form>
        </div>
    );
};

export default EditTreatment;