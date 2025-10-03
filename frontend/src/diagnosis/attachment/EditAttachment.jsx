import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAttachmentById, updateAttachment } from '../../store/diagnosis/attachmentSlice';
import { fetchDiagnoses } from '../../store/diagnosis/diagnosisSlice';

const EditAttachment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { attachmentId } = useParams();
    const { selectedAttachment, diagnoses, loading, error } = useSelector((state) => state.attachment);
    

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null
    });
    
    const [filePreview, setFilePreview] = useState('');
    const [fileChanged, setFileChanged] = useState(false);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (attachmentId) {
            dispatch(fetchAttachmentById(attachmentId));
        }
    }, [dispatch, attachmentId]);

    useEffect(() => {
        if (selectedAttachment) {
            setFormData({
                title: selectedAttachment.title || '',
                description: selectedAttachment.description || '',
                file: null // We don't store the file object in state
            });
            
            // Set preview if it's an image
            if (selectedAttachment.file && selectedAttachment.file.startsWith('http')) {
                setFilePreview(selectedAttachment.file);
            }
        }
    }, [selectedAttachment]);

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
        setFileChanged(true);
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
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        
        // Only append file if it was changed
        if (fileChanged && formData.file) {
            formDataToSend.append('file', formData.file);
        }

        try {
            const result = await dispatch(updateAttachment({
                attachmentId,
                updatedData: formDataToSend
            }));
            
            if (!result.error) {
                navigate('/diagnosis/attachments');
            }
        } catch (err) {
            console.error('Error updating attachment:', err);
        }
    };

    if (loading && !selectedAttachment) {
        return <div className="text-center py-10">Loading...</div>;
    }


    if (!selectedAttachment) {
        return <div className="text-center py-10">Attachment not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                Edit Attachment: {selectedAttachment.title}
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
                    <div>
  
    <select
        id="diagnosis"
        name="diagnosis"
        value={selectedAttachment.diagnosis}
        disabled // Remove this line if you want to allow editing
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
        {diagnoses.map((diagnosis) => (
            <option key={diagnosis.id} value={diagnosis.id}>
                {diagnosis.child_details?.first_name} {diagnosis.child_details?.last_name}, {' '}
                {new Date(diagnosis.date_diagnosed).toLocaleDateString()} - {diagnosis.title}
            </option>
        ))}
    </select>
</div>

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
                        File {!fileChanged && '(Current file)'}
                    </label>
                    <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200">
                            {fileChanged ? 'Change File' : 'Replace File'}
                            <input
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                        </label>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                            {fileChanged 
                                ? formData.file?.name 
                                : selectedAttachment.file_name || 'No file chosen'}
                        </span>
                    </div>
                    {fileError && (
                        <p className="mt-1 text-sm text-red-600">{fileError}</p>
                    )}
                    {(filePreview || (selectedAttachment.file && selectedAttachment.file.startsWith('http'))) && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                {fileChanged ? 'New Preview:' : 'Current File:'}
                            </p>
                            {filePreview || selectedAttachment.file.endsWith(('.jpg', '.jpeg', '.png', '.gif')) ? (
                                <img 
                                    src={filePreview || selectedAttachment.file} 
                                    alt="Preview" 
                                    className="mt-1 h-40 w-auto object-contain border rounded"
                                />
                            ) : (
                                <div className="mt-2 p-4 border rounded bg-gray-50 dark:bg-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        {selectedAttachment.file_name || 'File preview not available'}
                                    </p>
                                </div>
                            )}
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
                        {loading ? 'Updating...' : 'Update Attachment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAttachment;