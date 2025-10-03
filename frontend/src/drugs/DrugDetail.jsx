import { fetchDrugById, deleteDrug } from "../store/drugs/drugSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {isPharmacist} from '../utils/roles';

const DrugDetail = () => {
  const { drugId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { selectedDrug: drug, loading, error } = useSelector((state) => state.drug);

  useEffect(() => {
    dispatch(fetchDrugById(drugId));
  }, [dispatch, drugId]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this drug?")) {
      dispatch(deleteDrug(drugId));
      navigate("/drugs");
    }
  };

  const handleEdit = () => {
    navigate(`/drugs/edit/${drugId}`);
  };

  if (loading) return <p className="p-4">Loading drug details...</p>;
  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!drug) return <p className="p-4">Drug not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Drug Details</h2>

      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail label="Name" value={drug.name} />
        <Detail label="Generic Name" value={drug.generic_name} />
        <Detail label="Brand Name" value={drug.brand_name} />
        <Detail label="NDC Code" value={drug.ndc_code} />
        <Detail label="Category" value={drug.category} />
        <Detail label="Dosage Form" value={drug.dosage_form} />
        <Detail label="Route" value={drug.route} />
        <Detail label="Strength" value={drug.strength} />
        <Detail label="Concentration" value={drug.concentration} />
        <Detail label="Manufacturer" value={drug.manufacturer} />
        <Detail label="Price per Unit" value={`$${drug.price_per_unit}`} />
        <Detail label="Quantity in Stock" value={drug.quantity_in_stock} />
        <Detail label="Reorder Level" value={drug.reorder_level} />
        <Detail
          label="Available"
          value={drug.is_available ? "Yes" : "No"}
          color={drug.is_available ? "text-green-600" : "text-red-600"}
        />
        <Detail label="Batch Number" value={drug.batch_number} />
        <Detail label="Expiration Date" value={drug.expiration_date} />
        <Detail
          label="Requires Weight-Based Dosing"
          value={drug.requires_weight_based_dosing ? "Yes" : "No"}
        />
        <Detail label="Minimum Age (months)" value={drug.minimum_age_months} />
        <Detail label="Maximum Age (months)" value={drug.maximum_age_months} />
        <Detail label="Minimum Weight (kg)" value={drug.minimum_weight_kg} />
        <Detail label="Pediatric Notes" value={drug.pediatric_notes} />
        <Detail label="Special Storage" value={drug.special_storage} />
        <Detail
          label="Controlled Substance"
          value={drug.controlled_substance ? "Yes" : "No"}
        />
        {drug.controlled_substance && (
          <Detail label="Controlled Substance Class" value={drug.controlled_substance_class} />
        )}
        <div className="sm:col-span-2">
          <label className="text-gray-600 font-medium block mb-1">Description</label>
          <p className="text-gray-800">{drug.description}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        {isPharmacist(user) && (
        <button
          onClick={handleEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
        )}
        {isPharmacist(user) && (
           <button
           onClick={handleDelete}
           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
         >
           Delete
         </button>
        )}
       
        
      </div>
    </div>
  );
};

const Detail = ({ label, value, color = "text-gray-800" }) => (
  <div>
    <label className="text-gray-600 font-medium block mb-1">{label}</label>
    <p className={color}>{value !== null && value !== "" ? value : "—"}</p>
  </div>
);

export default DrugDetail;
