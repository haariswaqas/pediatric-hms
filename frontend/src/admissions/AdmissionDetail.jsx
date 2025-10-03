// src/components/AdmissionDetail.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  fetchAdmissionById,
  deleteAdmission,
  clearSelectedAdmission,
} from '../store/admissions/admissionSlice';
import { isDoctor } from '../utils/roles';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AdmissionDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admissionId } = useParams();
  const { selectedAdmission: admission, loading, error } = useSelector(
    (state) => state.admission
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAdmissionById(admissionId));
    return () => {
      dispatch(clearSelectedAdmission());
    };
  }, [dispatch, admissionId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy, hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this admission?')) {
      dispatch(deleteAdmission(admissionId)).then(() => navigate('/admissions'));
    }
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

  if (!admission) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Admission not found</div>
      </div>
    );
  }

  const {
    child_details,
    bed_details,
    attending_doctor_details,
    diagnosis_details,
    admission_reason,
    initial_diagnosis,
    admission_date,
    discharge_date,
  } = admission;

  const status = discharge_date ? "Discharged" : "Admitted";

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-900 shadow-lg rounded-2xl mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admission Record #{admission.id}
        </h1>
        <div className="flex space-x-3">
          {isDoctor(user) && (
            <Link
              to={`/admissions/edit/${admissionId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Link>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
            status === "Discharged"
              ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Child & Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            👶 Child Information
          </h2>
          {child_details ? (
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Name:</span> {child_details.first_name}{' '}
                {child_details.last_name}
              </p>
              <p>
                <span className="font-medium">Date of Birth:</span>{' '}
                {formatDateTime(child_details.date_of_birth)}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No child information available
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            🩺 Doctor Information
          </h2>
          {attending_doctor_details ? (
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Doctor:</span> Dr. {attending_doctor_details.first_name}{' '}
                {attending_doctor_details.last_name}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {attending_doctor_details.email}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No doctor information available
            </p>
          )}
        </div>
      </div>

      {/* Admission Details */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📋 Admission Details
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <dt className="font-medium">Reason:</dt>
            <dd>{admission_reason}</dd>
          </div>
          <div>
            <dt className="font-medium">Initial Diagnosis:</dt>
            <dd>{initial_diagnosis}</dd>
          </div>
          <div>
            <dt className="font-medium">Bed:</dt>
            <dd>
              {bed_details?.ward} / Bed {bed_details?.bed_number}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Diagnosis:</dt>
            <dd>
              {diagnosis_details?.title} - {diagnosis_details?.category}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Date Diagnosed:</dt>
            <dd>{formatDateTime(diagnosis_details?.date_diagnosed)}</dd>
          </div>
          <div>
            <dt className="font-medium">Severity:</dt>
            <dd>{diagnosis_details?.severity}</dd>
          </div>
          <div>
            <dt className="font-medium">Admission Date:</dt>
            <dd>{formatDateTime(admission_date)}</dd>
          </div>
          <div>
            <dt className="font-medium">Discharge Date:</dt>
            <dd>
              {discharge_date ? formatDateTime(discharge_date) : 'Still admitted'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
