import React from 'react';
import GenericSearch from '../utils/GenericSearch';
import { searchDrugs } from '../store/drugs/drugSlice';


export default function DrugSearch({ onSearchResults, placeholder = "Search for drugs..." }) {
  return (
    <GenericSearch
      action={searchDrugs}
      selector={(state) => state.drug}
      onSearchResults={onSearchResults}
      placeholder={placeholder}
      onDebug={(searchTerm, results) => {
        console.log('Drug Search Debug:', {
          searchTerm,
          resultsCount: results?.length || 0,
          results
        });
      }}
    />
  );
}

