// src/profile/MyProfile.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../store/profile/profileSlice';
import { isRole } from '../utils/roles';

export default function MyProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { profile, loading, error } = useSelector(s => s.profile);

  useEffect(() => {
    if (user?.role) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user?.role]);

  const formatValue = (v) => (v || v === 0 ? v : '—');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
        <p className="mt-4 text-gray-700 dark:text-white">Loading profile…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md text-center bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl p-6">
        <p className="text-red-700 dark:text-red-300 font-semibold">Error loading profile</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-200">{error}</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md text-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <p className="text-gray-700 dark:text-gray-200 font-medium">No profile available</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Please complete your profile setup.</p>
      </div>
    </div>
  );

  const RoleBadge = ({ role }) => {
    const label = role?.replace('_', ' ') || 'user';
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm';
    if (isRole(user, 'doctor')) return <span className={`${base} bg-red-600 text-white`}>Doctor</span>;
    if (isRole(user, 'nurse')) return <span className={`${base} bg-purple-600 text-white`}>Nurse</span>;
    if (isRole(user, 'pharmacist')) return <span className={`${base} bg-orange-500 text-white`}>Pharmacist</span>;
    if (isRole(user, 'lab_tech')) return <span className={`${base} bg-teal-600 text-white`}>Lab Tech</span>;
    if (isRole(user, 'parent')) return <span className={`${base} bg-green-600 text-white`}>Parent</span>;
    return <span className={`${base} bg-slate-600 text-white`}>{label}</span>;
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-200">{label}</span>
      <span className="mt-1 text-base font-semibold text-gray-900 dark:text-white break-words">{formatValue(value)}</span>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex items-center gap-4">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {/* initials */}
              <span className="select-none">{`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-white leading-tight">{profile.first_name} {profile.last_name}</h1>
              <p className="mt-1 text-sm text-indigo-100/90"> @{user?.username || 'user'}</p>

              <div className="mt-3 flex items-center gap-3">
                <RoleBadge role={user?.role} />
                <div className="px-2 py-1 rounded-md bg-white/20 text-white text-sm">
                  <span className="font-medium">{user?.email || ''}</span>
                </div>
              </div>
            </div>

            {/* Edit action -> navigates to /profile/edit */}
            <div className="flex-shrink-0 flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition"
                title="Edit profile"
                aria-label="Edit profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6M9 3v2M5 7l2 2m0 0L7 9m10 10l-2-2" />
                </svg>
                Edit
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Basic info card */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/40 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Full name" value={`${profile.first_name} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name}`} />
                  <InfoRow label="Phone" value={profile.phone_number} />
                  <InfoRow label="Address" value={profile.address} />
                  <InfoRow label="Date of birth" value={profile.date_of_birth} />
                  <InfoRow label="Age" value={profile.age} />
                  <InfoRow label="Gender" value={profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : profile.gender || '—'} />
                  <InfoRow label="Blood group" value={profile.blood_group || '—'} />
                </div>
              </div>

              {/* Role-specific card */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Role Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isRole(user, 'doctor') && (
                    <>
                      <InfoRow label="Specialization" value={formatValue(profile.specialization)} />
                      <InfoRow label="Experience (yrs)" value={profile.years_of_experience ? `${profile.years_of_experience} yrs` : '—'} />
                      <InfoRow label="Medical license #" value={formatValue(profile.medical_license_number)} />
                    </>
                  )}

                  {isRole(user, 'nurse') && (
                    <>
                      <InfoRow label="Nursing license #" value={formatValue(profile.nursing_license_number)} />
                      <InfoRow label="Assigned ward" value={formatValue(profile.assigned_ward)} />
                    </>
                  )}

                  {isRole(user, 'pharmacist') && (
                    <>
                      <InfoRow label="Pharmacy license #" value={formatValue(profile.pharmacy_license_number)} />
                      <InfoRow label="Pharmacy assigned" value={formatValue(profile.pharmacy_assigned)} />
                    </>
                  )}

                  {isRole(user, 'lab_tech') && (
                    <InfoRow label="Lab tech license #" value={formatValue(profile.lab_tech_license_number)} />
                  )}

                  {isRole(user, 'parent') && (
                    <>
                      <InfoRow label="Profession" value={formatValue(profile.profession)} />
                      <InfoRow label="# of children" value={formatValue(profile.number_of_children)} />
                    </>
                  )}

                  {/* fallback when role has no extra fields */}
                  {!isRole(user, 'doctor') && !isRole(user, 'nurse') && !isRole(user, 'pharmacist') && !isRole(user, 'lab_tech') && !isRole(user, 'parent') && (
                    <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-200">No additional role information available.</div>
                  )}
                </div>
              </div>

              {/* Quick actions card */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/40 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quick actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/profile/edit')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                    aria-label="Edit profile"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6M9 3v2M3 7l2 2" /></svg>
                    Edit profile
                  </button>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
