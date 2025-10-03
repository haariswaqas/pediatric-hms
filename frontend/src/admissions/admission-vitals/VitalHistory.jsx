// src/components/VitalHistory.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchVitalHistoryById } from "../../store/admissions/admissionVitalSlice";
import {
  Heart,
  Thermometer,
  Activity,
  Droplets,
  User,
  Clock
} from "lucide-react";

export default function VitalHistory() {
  const dispatch = useDispatch();
  const { admissionVitalId } = useParams();
  const {
    selectedVitalHistory,
    loading,
    error
  } = useSelector((s) => s.admissionVital);

  // Fetch on mount or when ID changes
  useEffect(() => {
    if (admissionVitalId) {
      dispatch(fetchVitalHistoryById(admissionVitalId));
    }
  }, [dispatch, admissionVitalId]);

  // Ensure histories is always an array and sort newest first
  const histories = Array.isArray(selectedVitalHistory) ? selectedVitalHistory : [];
  const sorted = [...histories].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  // Grab child + admission date from first record
  const childInfo = sorted[0]?.child_details;
  const childName = childInfo?.child ?? "Unknown child";
  const admissionDate = childInfo?.admission_date
    ? new Date(childInfo.admission_date).toLocaleDateString()
    : "";

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-700">
          Loading history for admission #{admissionVitalId}…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Vital History</h2>
          <p className="text-gray-600">
            <span className="font-medium">Patient:</span> {childName}{" "}
            <span className="ml-2 text-sm">
              (Admitted: {admissionDate})
            </span>
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Admission Vital #{admissionVitalId}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-600">
          No history records found.
        </p>
      ) : (
        <table className="w-full text-sm table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-2 text-left">
                <Clock className="inline w-4 h-4 mr-1" />
                When
              </th>
              <th className="px-3 py-2 text-left">
                <Thermometer className="inline w-4 h-4 mr-1" />
                Temp
              </th>
              <th className="px-3 py-2 text-left">
                <Heart className="inline w-4 h-4 mr-1" />
                HR
              </th>
              <th className="px-3 py-2 text-left">BP</th>
              <th className="px-3 py-2 text-left">
                <Activity className="inline w-4 h-4 mr-1" />
                RR
              </th>
              <th className="px-3 py-2 text-left">
                <Droplets className="inline w-4 h-4 mr-1" />
                O₂ Sat
              </th>
              <th className="px-3 py-2 text-left">Pain</th>
              <th className="px-3 py-2 text-left">
                <User className="inline w-4 h-4 mr-1" />
                By
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((vh) => (
              <tr
                key={vh.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-3 py-2">
                  {new Date(vh.updated_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">{vh.temperature}°C</td>
                <td className="px-3 py-2">{vh.heart_rate} bpm</td>
                <td className="px-3 py-2">{vh.blood_pressure}</td>
                <td className="px-3 py-2">{vh.respiratory_rate} /min</td>
                <td className="px-3 py-2">
                  {vh.oxygen_saturation != null
                    ? `${vh.oxygen_saturation}%`
                    : "--"}
                </td>
                <td className="px-3 py-2">
                  {vh.pain_score != null ? vh.pain_score : "--"}
                </td>
                <td className="px-3 py-2">
                  {vh.updated_by_details
                    ? `${vh.updated_by_details.first_name} ${vh.updated_by_details.last_name}`
                    : "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}