// src/prescriptions/prescription-items/PrescriptionItemSearch.jsx
import React from 'react';
import GenericSearch from '../../utils/GenericSearch';
import { searchPrescriptionItems } from '../../store/prescriptions/prescriptionItemSlice';

export default function PrescriptionItemSearch({ onSearchResults, placeholder = "Search prescription items..." }) {
  return (
    <GenericSearch
      action={searchPrescriptionItems}
      selector={(state) => state.prescriptionItem}
      onSearchResults={onSearchResults}
      placeholder={placeholder}
      // Add debug logging to see what's happening
      onDebug={(searchTerm, results) => {
        console.log('PrescriptionItemSearch Debug:', {
          searchTerm,
          resultsCount: results?.length || 0,
          results
        });
      }}
    />
  );
}