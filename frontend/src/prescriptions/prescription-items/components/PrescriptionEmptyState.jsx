// src/prescriptions/prescription-items/components/PrescriptionEmptyState.jsx
import React from "react";
import { PlusCircle, ClipboardList } from "lucide-react";
import { isDoctor } from "../../../utils/roles";
import { useSelector } from "react-redux";

export default function PrescriptionEmptyState({ onAdd }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-10 text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20 mb-4">
        <ClipboardList className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No prescriptions available
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isDoctor(user)
          ? "Get started by creating your first prescription."
          : "No prescriptions are currently available for you."}
      </p>

      {/* ✅ Show button only if user is a doctor */}
      {isDoctor(user) && (
        <div className="mt-6">
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 mx-auto shadow-sm transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add New Prescription</span>
          </button>
        </div>
      )}
    </div>
  );
}
