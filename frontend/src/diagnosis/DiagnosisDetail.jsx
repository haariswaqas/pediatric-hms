import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchDiagnosisById, clearSelectedDiagnosis } from "../store/diagnosis/diagnosisSlice";
import { format } from "date-fns";
import { isDoctor } from "../utils/roles";

export default function DiagnosisDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { diagnosisId } = useParams();
  const {user} = useSelector((state) => state.auth)
  const { selectedDiagnosis: diagnosis, loading, error } = useSelector(
    (state) => state.diagnosis
  );

  useEffect(() => {
    dispatch(fetchDiagnosisById(diagnosisId));

    return () => {
      dispatch(clearSelectedDiagnosis());
    };
  }, [dispatch, diagnosisId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: "bg-green-100 text-green-800",
      RESOLVED: "bg-blue-100 text-blue-800",
      CHRONIC: "bg-yellow-100 text-yellow-800",
      RECURRENT: "bg-purple-100 text-purple-800",
      PROVISIONAL: "bg-gray-100 text-gray-800",
      RULE_OUT: "bg-orange-100 text-orange-800",
    };

    const statusLabels = {
      ACTIVE: "Active",
      RESOLVED: "Resolved",
      CHRONIC: "Chronic",
      RECURRENT: "Recurrent",
      PROVISIONAL: "Provisional",
      RULE_OUT: "Rule Out",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityClasses = {
      MILD: "bg-green-100 text-green-800",
      MODERATE: "bg-yellow-100 text-yellow-800",
      SEVERE: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          severityClasses[severity] || "bg-gray-100 text-gray-800"
        }`}
      >
        {severity || "N/A"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Diagnosis not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {diagnosis.title}
        </h1>
        <div className="flex space-x-2">
          {isDoctor(user) && (
 <Link
 to={`/diagnosis/edit/${diagnosisId}`}
 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
>
 Edit
</Link>


          )}
         
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      </div>

      {/* Patient and Doctor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Patient Information
          </h2>
          {diagnosis.child_details ? (
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Name:</span>{" "}
                {diagnosis.child_details.first_name} {diagnosis.child_details.last_name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Date of Birth:</span>{" "}
                {formatDate(diagnosis.child_details.date_of_birth)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Age:</span> {diagnosis.child_details.age} years
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No patient information available</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Doctor Information
          </h2>
          {diagnosis.doctor_details ? (
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Doctor:</span>{" "}
                Dr. {diagnosis.doctor_details.first_name} {diagnosis.doctor_details.last_name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Specialization:</span>{" "}
                {diagnosis.doctor_details.specialization}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Email:</span>{" "}
                {diagnosis.doctor_details.email}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No doctor information available</p>
          )}
        </div>
      </div>

      {/* Diagnosis Details */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Diagnosis Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Category:</span> {diagnosis.category || "N/A"}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">ICD-10 Code:</span> {diagnosis.icd_code || "N/A"}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Status:</span> {getStatusBadge(diagnosis.status)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Severity:</span> {getSeverityBadge(diagnosis.severity)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Onset Date:</span> {formatDate(diagnosis.onset_date)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Date Diagnosed:</span> {formatDate(diagnosis.date_diagnosed)}
          </p>
          {diagnosis.resolution_date && (
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Resolution Date:</span> {formatDate(diagnosis.resolution_date)}
            </p>
          )}
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Chronic:</span> {diagnosis.is_chronic ? "Yes" : "No"}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Congenital:</span> {diagnosis.is_congenital ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Description and Clinical Findings */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {diagnosis.description && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {diagnosis.description}
            </p>
          </div>
        )}
        
        {diagnosis.clinical_findings && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Clinical Findings
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {diagnosis.clinical_findings}
            </p>
          </div>
        )}

        {diagnosis.notes && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Additional Notes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {diagnosis.notes}
            </p>
          </div>
        )}
      </div>

      {/* Treatments */}
      {diagnosis.treatments && diagnosis.treatments.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Treatments
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {diagnosis.treatments.map((treatment) => (
              <div key={treatment.id} className="py-3">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {treatment.treatment_type}: {treatment.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {treatment.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Start: {formatDate(treatment.start_date)}
                  </span>
                  {treatment.end_date && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      End: {formatDate(treatment.end_date)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Status: {treatment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {diagnosis.attachments && diagnosis.attachments.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Attachments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosis.attachments.map((attachment) => (
              <div 
                key={attachment.id} 
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {attachment.title || "Unnamed attachment"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added on: {formatDate(attachment.created_at)}
                  </p>
                </div>
                <a 
                  href={attachment.file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Diagnoses */}
      {diagnosis.related_diagnoses && diagnosis.related_diagnoses.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            Related Diagnoses
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {diagnosis.related_diagnoses.map((relatedId) => (
              <li key={relatedId}>
                <Link 
                  to={`/diagnosis/${relatedId}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Related Diagnosis #{relatedId}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}