import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDrugDispenses, deleteDrugDispense } from "../../store/drugs/drugDispenseSlice";
import {
  GitMerge,
  Eye,
  Trash2,
  Edit3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import { isPharmacist } from "../../utils/roles";
// Import the frequency choices directly
const FREQUENCY_CHOICES = [
  ["OD", "Once daily"],
  ["BID", "Twice daily"],
  ["TID", "Three times daily"],
  ["QID", "Four times daily"],
  ["QHS", "Every bedtime"],
  ["Q4H", "Every 4 hours"],
  ["Q6H", "Every 6 hours"],
  ["Q8H", "Every 8 hours"],
  ["Q12H", "Every 12 hours"],
  ["PRN", "As needed"],
  ["STAT", "Immediately"],
];

export default function DrugDispenseList() {
  const dispatch = useDispatch();
  const drugDispenseId = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { drugDispenses, loading, error } = useSelector((state) => state.drugDispense);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    dispatch(fetchDrugDispenses());
  }, [dispatch]);

  const handleAdd = () => navigate("/drugs/drug-dispenses/add");
  const handleView = (id) => navigate(`/drugs/drug-dispenses/${id}`);
  const handleEdit = (id) => navigate(`/drugs/drug-dispenses/edit/${id}`);
  
  const handleDelete = (id) => {
    if (window.confirm("Delete this dispense?")) {
      dispatch(deleteDrugDispense(id));
    }
  };

  const getFrequencyFullText = useMemo(() => {
    return (frequencyCode) => {
      if (!frequencyCode) return "N/A";
      const frequency = FREQUENCY_CHOICES.find((choice) => choice[0] === frequencyCode);
      return frequency ? `${frequencyCode} (${frequency[1]})` : frequencyCode;
    };
  }, []);

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
          Loading drug dispense records...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4 mt-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="font-medium text-red-800 dark:text-red-200">
            Error loading drug dispenses
          </span>
        </div>
        <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  const tableColumns = ['Drug', 'Pharmacist', 'Quantity', 'Date Dispensed', 'Refill', 'Details', 'Actions'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Drug Dispense Records
          </h1>
          {isPharmacist(user) && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Dispense
          </button>

          )}
        </div>

        {drugDispenses && drugDispenses.length === 0 ? (
          <div className="text-center py-8">
            <GitMerge className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
              No dispense records found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a new drug dispense record to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {tableColumns.map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {drugDispenses && drugDispenses.map((dispense) => (
                  <React.Fragment key={dispense.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {dispense.prescription_item_details?.drug_name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {dispense.pharmacist_details
                            ? `${dispense.pharmacist_details.first_name} ${dispense.pharmacist_details.last_name}`
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {dispense.quantity_dispensed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {dispense.date_dispensed ? new Date(dispense.date_dispensed).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            dispense.is_refill
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {dispense.is_refill ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleRowExpansion(dispense.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center transition"
                        >
                          {expandedRows[dispense.id] ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          Details
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                         
                          <button
                            onClick={() => handleEdit(dispense.id)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 transition"
                            aria-label="Edit record"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(dispense.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 transition"
                            aria-label="Delete record"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[dispense.id] && (
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prescription Details
                              </h4>
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Drug Name:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.prescription_item_details?.drug_name || "N/A"}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Dosage:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.prescription_item_details?.dosage || "N/A"}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Frequency:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {getFrequencyFullText(
                                    dispense.prescription_item_details?.frequency
                                  )}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Duration:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.prescription_item_details?.duration_value 
                                    ? `${dispense.prescription_item_details.duration_value} ${dispense.prescription_item_details.duration_unit || ""}` 
                                    : "N/A"}
                                </dd>
                              </dl>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dispense Details
                              </h4>
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Batch Number:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.batch_number || "N/A"}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Dispensing Notes:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.dispensing_notes || "No notes provided"}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Pharmacist:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.pharmacist_details
                                    ? `${dispense.pharmacist_details.first_name} ${dispense.pharmacist_details.last_name}`
                                    : "Unknown"}
                                </dd>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Prescribed by:
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-gray-100">
                                  {dispense.doctor_details
                                    ? `Dr. ${dispense.doctor_details.first_name} ${dispense.doctor_details.last_name}`
                                    : "Unknown"}
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}