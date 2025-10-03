// src/admissions/AdmissionSearch.jsx
import React from 'react';
import GenericSearch from '../utils/GenericSearch';
import { searchAdmissions } from '../store/admissions/admissionSlice';

export default function AdmissionSearch({ onSearchResults }) {
  return (
    <GenericSearch
      action={searchAdmissions}
      selector={(state) => state.admission}
      onSearchResults={onSearchResults}
      placeholder="Search admissions..."
    />
  );
}
