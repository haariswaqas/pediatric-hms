import React, { useEffect, useState, useRef } from "react";
import { fetchDrugs, deleteDrug, bulkUploadDrugs } from "../store/drugs/drugSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { isPharmacist } from "../utils/roles";
import {
  Eye,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  Pill,
  UploadCloud,
  FileText,
  XCircle,
} from "lucide-react";
import DrugSearch from "./DrugSearch";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DrugList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { drugs, loading, error } = useSelector((state) => state.drug);

  const [filteredDrugs, setFilteredDrugs] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchDrugs());
  }, [dispatch]);

  const handleView = (id) => navigate(`/drugs/${id}`);
  const handleEdit = (id) => navigate(`/drugs/edit/${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this drug?")) {
      dispatch(deleteDrug(id));
    }
  };
  const handleAdd = () => navigate("/drugs/add");

  const onSelectFile = (e) => {
    const selected = e.target.files[0];
    if (selected && /\.(xls|xlsx)$/i.test(selected.name)) {
      setFile(selected);
    } else {
      toast.error("Please select a valid Excel file (.xls or .xlsx)");
      e.target.value = null;
      setFile(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      return toast.error("No file selected. Please choose an Excel file.");
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const action = await dispatch(bulkUploadDrugs(formData));
    setUploading(false);
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success("Drugs uploaded successfully!");
      dispatch(fetchDrugs());
      setFile(null);
      fileInputRef.current.value = null;
    } else {
      toast.error(action.payload || "Upload failed. Please try again.");
    }
  };

  const displayList = filteredDrugs ?? drugs;
  const tableColumns = [
    "Name","Generic Name","Brand Name","Description",
    "Quantity","Category","Availability","Actions"
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">Drug Inventory</h2>
        <div className="flex items-center space-x-2 flex-wrap">
  {isPharmacist(user) && (
    <>
      {/* Add Drug button */}
      <button
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add New Drug
      </button>

      {/* Excel file input */}
      <label className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer transition">
        <FileText className="h-5 w-5 mr-2" />
        <span>{file?.name || "Select Excel"}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={onSelectFile}
          className="hidden"
        />
      </label>

      {/* Upload Excel button */}
      <button
        onClick={handleBulkUpload}
        disabled={!file || uploading}
        className={`px-4 py-2 rounded-md flex items-center transition ${
          file && !uploading
            ? "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        {uploading ? (
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        ) : (
          <UploadCloud className="h-5 w-5 mr-2" />
        )}
        <span>{uploading ? "Uploading..." : "Upload Excel"}</span>
      </button>

      {file && (
        <button
          onClick={() => {
            setFile(null);
            fileInputRef.current.value = null;
          }}
          className="text-red-600 dark:text-red-400 ml-2"
        >
          <XCircle className="h-5 w-5" title="Clear file selection" />
        </button>
      )}
    </>
  )}
</div>

      </div>

      <div className="mb-4">
        <DrugSearch onSearchResults={setFilteredDrugs} placeholder="Search drugs..."/>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading drug inventory...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4 mt-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2"/>
            <span className="font-medium text-red-800 dark:text-red-200">Error loading drugs</span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No drugs available</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add a new drug to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>{tableColumns.map(col=>(<th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{col}</th>))}</tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayList.map(drug=>(
                <tr key={drug.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td onClick={()=>handleView(drug.id)} className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{drug.name||"N/A"}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{drug.generic_name||"N/A"}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{drug.brand_name||"N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={drug.description}>{drug.description||"No description"}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{drug.quantity_in_stock??"N/A"}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{drug.category||"Uncategorized"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${drug.is_available?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400"}`}>{drug.is_available?"Available":"Not Available"}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={()=>handleView(drug.id)}><Eye className="h-5 w-5 text-blue-600 dark:text-blue-400"/></button>
                      <button onClick={()=>handleEdit(drug.id)}><Edit3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/></button>
                      <button onClick={()=>handleDelete(drug.id)}><Trash2 className="h-5 w-5 text-red-600 dark:text-red-400"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DrugList;
