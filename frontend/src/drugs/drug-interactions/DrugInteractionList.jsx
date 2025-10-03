import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchDrugInteractions,
  deleteDrugInteraction,
} from "../../store/drugs/drugInteractionSlice";
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

export default function DrugInteractionList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { drugInteractions, loading, error } = useSelector(
    (s) => s.drugInteraction
  );
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    dispatch(fetchDrugInteractions());
  }, [dispatch]);

  const handleAdd = () => navigate("/drugs/drug-interactions/add");
  const handleEdit = (id) => navigate(`/drugs/drug-interactions/edit/${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Delete this interaction?")) {
      dispatch(deleteDrugInteraction(id));
    }
  };
  const toggle = (id) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-300">
        <AlertCircle className="inline w-5 h-5 mr-2" />
        {error}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <GitMerge className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
          Drug Interactions
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
        >
          <PlusCircle className="w-5 h-5" /> Add Interaction
        </button>
      </div>

      {drugInteractions.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No interactions found.
        </div>
      ) : (
        <div className="space-y-4">
          {drugInteractions.map((i) => {
            const id = i.drugInteractionId ?? i.id;
            return (
              <div
                key={id}
                className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Drug One:</span>{" "}
                      <Link to={`/drugs/${i.drug_one_id}`}> {i.drug_one_name}</Link>
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Drug Two:</span>{" "}
                       <Link to={`/drugs/${i.drug_two_id}`}> {i.drug_two_name}</Link>
                    </p>
                    <p className="inline-flex items-center text-gray-800 dark:text-gray-200">
                      <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
                      <span className="font-semibold">Severity:</span>{" "}
                      {i.severity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggle(id)}
                      className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                      title="Toggle Details"
                    >
                      {expanded[id] ? (
                        <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(id)}
                      className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(id)}
                      className="p-2 bg-red-100 dark:bg-red-900 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                {expanded[id] && (
                  <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-2">
                    <p>
                      <span className="font-semibold">Description:</span>{" "}
                      {i.description || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Alternative Suggestion:
                      </span>{" "}
                      {i.alternative_suggestion || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
