// src/admissions/AdmissionSearch.jsx
import React from 'react';
import GenericSearch from '../../utils/GenericSearch';
import { searchAppointments } from '../../store/appointments/appointmentSlice';

export default function AppointmentSearch({ onSearchResults }) {
  return (
    <GenericSearch
      action={searchAppointments}
      selector={(state) => state.appointment}
      onSearchResults={onSearchResults}
      placeholder="Search appointments..."
    />
  );
}
