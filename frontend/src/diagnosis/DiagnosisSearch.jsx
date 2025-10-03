// src/diagnosis/DiagnosisSearch.jsx
import React from 'react';
import GenericSearch from '../utils/GenericSearch';
import { searchDiagnoses } from '../store/diagnosis/diagnosisSlice';

export default function DiagnosisSearch({ onSearchResults, placeholder = "Search diagnoses..." }) {
  return (
    <GenericSearch
      action={searchDiagnoses}
      selector={(state) => state.diagnosis}
      onSearchResults={onSearchResults}
      placeholder={placeholder}
      onDebug={(searchTerm, results) => {
        console.log('DiagnosisSearch Debug:', {
          searchTerm,
          resultsCount: results?.length || 0,
          results
        });
      }}
    />
  );
}
