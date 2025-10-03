import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createAttachment } from '../../store/diagnosis/attachmentSlice';
import { fetchDiagnoses } from '../../store/diagnosis/diagnosisSlice';

const AddAttachment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { diagnosisId } = useParams();
    const { diagnoses, loading: diagnosesLoading } = useSelector((state) => state.diagnosis);
    const { loading, error } = useSelector((state) => state.attachment);

    const [formData, setFormData] = useState({
        diagnosis: '',
        title: '',
        description: '',
        file: null
    });

    const [filePreview, setFilePreview] = useState('');
    const [fileError, setFileError] = useState('');

    const selectedDiagnosis = diagnosisId 
        ? diagnoses.find((diag) => String(diag.id) === String(diagnosisId))
        : null;

    useEffect(() => {
        if (diagnosisId) {
            setFormData(prev => ({
                ...prev,
                diagnosis: diagnosisId
            }));
        }
    }, [diagnosisId]);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (e.g., 5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setFileError('File size should be less than 5MB');
            return;
        }


        setFileError('');
        setFormData(prev => ({
            ...prev,
            file: file
        }));
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.file) {
            setFileError('Please select a file to upload');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('diagnosis', formData.diagnosis);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('file', formData.file);

        try {
            const result = await dispatch(createAttachment(formDataToSend));
            if (!result.error) {
                navigate('/diagnosis/attachments');
            }
        } catch (err) {
            console.error('Error creating attachment:', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                {selectedDiagnosis
                    ? `Add Attachment for ${selectedDiagnosis.title}`
                    : 'Add New Attachment'}
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
                        disabled={!!diagnosisId}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Select a diagnosis</option>
                        {diagnoses.map((diag) => (
                            <option key={diag.id} value={diag.id}>
                                {diag.child_details?.first_name} {diag.child_details?.last_name}, {new Date(diag.date_diagnosed).toLocaleDateString()} - {diag.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Attachment Title
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
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File
                    </label>
                    <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200">
                            Choose File
                            <input
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                        </label>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                            {formData.file ? formData.file.name : 'No file chosen'}
                        </span>
                    </div>
                    {fileError && (
                        <p className="mt-1 text-sm text-red-600">{fileError}</p>
                    )}
                    {filePreview && formData.file?.type.startsWith('image/') && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-300">Preview:</p>
                            <img 
                                src={filePreview} 
                                alt="Preview" 
                                className="mt-1 h-40 w-auto object-contain border rounded"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Uploading...' : 'Upload Attachment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddAttachment;