import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateDrug, fetchDrugById } from '../store/drugs/drugSlice';

const ROUTE_CHOICES = [
    'PO', 'IV', 'IM', 'SC', 'TOP', 'INH', 'REC', 'OPH', 'OT', 'NAS', 'SL'
];

const EditDrug = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { drugId } = useParams();

    const { selectedDrug: drug, loading, error } = useSelector((state) => state.drug);

    const [formData, setFormData] = useState({
        name: '',
        generic_name: '',
        brand_name: '',
        description: '',
        ndc_code: '',
        category: '',
        dosage_form: '',
        route: '',
        strength: '',
        concentration: '',
        manufacturer: '',
        price_per_unit: '',
        quantity_in_stock: '',
        reorder_level: 10,
        is_available: true,
        batch_number: '',
        expiration_date: new Date().toISOString().split('T')[0],
        requires_weight_based_dosing: false,
        minimum_age_months: '',
        maximum_age_months: '',
        minimum_weight_kg: '',
        pediatric_notes: '',
        special_storage: '',
        controlled_substance: false,
        controlled_substance_class: ''
    });

    useEffect(() => {
        dispatch(fetchDrugById(drugId));
    }, [dispatch, drugId]);

    useEffect(() => {
        if (drug) {
            setFormData({
                ...drug,
                expiration_date: new Date(drug.expiration_date).toISOString().split('T')[0]
            });
        }
    }, [drug]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Create a copy of the data to be sent to the API
        const payload = {
            ...formData,
            // Ensure required fields are included
            name: formData.name || '',
            expiration_date: new Date(formData.expiration_date).toISOString()
        };
        
        // Log the payload to verify it contains required fields
        console.log("Submitting drug update with payload:", payload);
        
        dispatch(updateDrug({ id: drugId, drugData: payload })).then((res) => {
            if (!res.error) {
                navigate('/drugs');
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-10">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                Edit Drug
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-600 dark:text-white">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-200">Drug Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="generic_name" className="block mb-1 text-gray-700 dark:text-gray-200">Generic Name</label>
                        <input
                            type="text"
                            id="generic_name"
                            name="generic_name"
                            value={formData.generic_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="brand_name" className="block mb-1 text-gray-700 dark:text-gray-200">Brand Name</label>
                        <input
                            type="text"
                            id="brand_name"
                            name="brand_name"
                            value={formData.brand_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="ndc_code" className="block mb-1 text-gray-700 dark:text-gray-200">NDC Code</label>
                        <input
                            type="text"
                            id="ndc_code"
                            name="ndc_code"
                            value={formData.ndc_code}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Dosage Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block mb-1 text-gray-700 dark:text-gray-200">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="dosage_form" className="block mb-1 text-gray-700 dark:text-gray-200">Dosage Form</label>
                        <input
                            type="text"
                            id="dosage_form"
                            name="dosage_form"
                            value={formData.dosage_form}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="route" className="block mb-1 text-gray-700 dark:text-gray-200">Route *</label>
                        <select
                            id="route"
                            name="route"
                            value={formData.route}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="">Select Route</option>
                            {ROUTE_CHOICES.map(route => (
                                <option key={route} value={route}>{route}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="strength" className="block mb-1 text-gray-700 dark:text-gray-200">Strength</label>
                        <input
                            type="text"
                            id="strength"
                            name="strength"
                            value={formData.strength}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Stock Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price_per_unit" className="block mb-1 text-gray-700 dark:text-gray-200">Price per Unit</label>
                        <input
                            type="number"
                            step="0.01"
                            id="price_per_unit"
                            name="price_per_unit"
                            value={formData.price_per_unit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity_in_stock" className="block mb-1 text-gray-700 dark:text-gray-200">Quantity in Stock</label>
                        <input
                            type="number"
                            id="quantity_in_stock"
                            name="quantity_in_stock"
                            value={formData.quantity_in_stock}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="reorder_level" className="block mb-1 text-gray-700 dark:text-gray-200">Reorder Level</label>
                        <input
                            type="number"
                            id="reorder_level"
                            name="reorder_level"
                            value={formData.reorder_level}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="is_available" className="block mb-1 text-gray-700 dark:text-gray-200">Is Available</label>
                        <input
                            type="checkbox"
                            id="is_available"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Pediatric Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="requires_weight_based_dosing" className="block mb-1 text-gray-700 dark:text-gray-200">Requires Weight-Based Dosing</label>
                        <input
                            type="checkbox"
                            id="requires_weight_based_dosing"
                            name="requires_weight_based_dosing"
                            checked={formData.requires_weight_based_dosing}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="minimum_age_months" className="block mb-1 text-gray-700 dark:text-gray-200">Minimum Age (months)</label>
                        <input
                            type="number"
                            id="minimum_age_months"
                            name="minimum_age_months"
                            value={formData.minimum_age_months}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="maximum_age_months" className="block mb-1 text-gray-700 dark:text-gray-200">Maximum Age (months)</label>
                        <input
                            type="number"
                            id="maximum_age_months"
                            name="maximum_age_months"
                            value={formData.maximum_age_months}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="minimum_weight_kg" className="block mb-1 text-gray-700 dark:text-gray-200">Minimum Weight (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            id="minimum_weight_kg"
                            name="minimum_weight_kg"
                            value={formData.minimum_weight_kg}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="pediatric_notes" className="block mb-1 text-gray-700 dark:text-gray-200">Pediatric Notes</label>
                        <textarea
                            id="pediatric_notes"
                            name="pediatric_notes"
                            value={formData.pediatric_notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="special_storage" className="block mb-1 text-gray-700 dark:text-gray-200">Special Storage</label>
                        <input
                            type="text"
                            id="special_storage"
                            name="special_storage"
                            value={formData.special_storage}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="controlled_substance" className="block mb-1 text-gray-700 dark:text-gray-200">Controlled Substance</label>
                        <input
                            type="checkbox"
                            id="controlled_substance"
                            name="controlled_substance"
                            checked={formData.controlled_substance}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="controlled_substance_class" className="block mb-1 text-gray-700 dark:text-gray-200">Controlled Substance Class</label>
                        <input
                            type="text"
                            id="controlled_substance_class"
                            name="controlled_substance_class"
                            value={formData.controlled_substance_class}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block mb-1 text-gray-700 dark:text-gray-200">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    ></textarea>
                </div>

                {/* Concentration */}
                <div>
                    <label htmlFor="concentration" className="block mb-1 text-gray-700 dark:text-gray-200">Concentration</label>
                    <input
                        type="text"
                        id="concentration"
                        name="concentration"
                        value={formData.concentration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>

                {/* Manufacturer */}
                <div>
                    <label htmlFor="manufacturer" className="block mb-1 text-gray-700 dark:text-gray-200">Manufacturer</label>
                    <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                </div>

                {/* Batch and Expiration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="batch_number" className="block mb-1 text-gray-700 dark:text-gray-200">Batch Number</label>
                        <input
                            type="text"
                            id="batch_number"
                            name="batch_number"
                            value={formData.batch_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="expiration_date" className="block mb-1 text-gray-700 dark:text-gray-200">Expiration Date</label>
                        <input
                            type="date"
                            id="expiration_date"
                            name="expiration_date"
                            value={formData.expiration_date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                {/* Pediatric Notes and Storage */}
                <div>
                    <label htmlFor="pediatric_notes" className="block mb-1 text-gray-700 dark:text-gray-200">Pediatric Notes</label>
                    <textarea
                        id="pediatric_notes"
                        name="pediatric_notes"
                        value={formData.pediatric_notes}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
                >
                    {loading ? 'Submitting...' : 'Add Drug'}
                </button>
            </form>
            )}
        </div>
    );
};

export default EditDrug;
