// src/prescriptions/prescription-items/components/PrescriptionHeader.jsx

import React from "react";
import { PlusCircle } from "lucide-react";
import {isDoctor} from '../../../utils/roles'
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { autoExpireAll, autoCompleteAll } from "../../../store/prescriptions/prescriptionSlice";
//import { fetchPrescriptions } from "../../../store/prescriptions/prescriptionSlice";
import { RefreshCw } from "lucide-react";

export default function PrescriptionHeader({ title, icon, onAdd }) {
  const {user} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();
  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAutoExpire = () => {
    dispatch(autoExpireAll())
      .unwrap()
      .then(() => {
        showToast('All prescriptions auto‑expired!', 'success');
        
        // After expiring, you might want to dispatch an action to reload the prescriptions data
      
      })
      .catch((err) => {
        showToast(`Error: ${err.message}`, 'error');
      });
  };

  const handleAutoComplete = () => {
    dispatch(autoCompleteAll())
      .unwrap()
      .then(() => {
        showToast('All prescriptions auto‑completed!', 'success');
        
        // After completing, you might want to dispatch an action to reload the prescriptions data
      })
      .catch((err) => {
        showToast(`Error: ${err.message}`, 'error');
      });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
        {React.cloneElement(icon, {
          className: "w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400"
        })}
        {title}
      </h1>
      {isDoctor(user) && <button
        onClick={onAdd}
        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-sm transition-colors"
      >
        <PlusCircle className="w-5 h-5" /> Add Prescription Item
      </button>}
      {/* <button
              // onClick={handleAutoExpire}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Auto‑Expire All
            </button>
            <button
              onClick={handleAutoComplete}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Auto‑Complete Active Prescriptions
            </button> */}
    </div>
  );
}