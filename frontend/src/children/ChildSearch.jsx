import React from 'react';
import GenericSearch from '../utils/GenericSearch';
import { searchChildren } from '../store/children/childManagementSlice';


export default function ChildSearch({ onSearchResults, placeholder = "Search children..." }) {
  return (
    <GenericSearch
      action={searchChildren}
      selector={(state) => state.childManagement}
      onSearchResults={onSearchResults}
      placeholder={placeholder}
      onDebug={(searchTerm, results) => {
        console.log('Child Search Debug:', {
          searchTerm,
          resultsCount: results?.length || 0,
          results
        });
      }}
    />
  );
}

