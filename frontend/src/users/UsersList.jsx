// src/users/UsersList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  deleteUser,
  activateUser,
  deactivateUser,
  manuallyVerifyMedicalProfessional
} from '../store/admin/userManagementSlice';

import { useNavigate } from 'react-router-dom';
import UserSearch from './UserSearch';
// Fix autoTable import issue
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import ConfirmationModal from '../utils/ConfirmationModal';
import {toast} from 'react-toastify';

import { Trash2, Edit2, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function UsersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((s) => s.userManagement);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToVerify, setUserToVerify] = useState(null);
  const [userToActivate, setUserToActivate] = useState(null);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [modalAction, setModalAction] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (!searchActive) {
      setFilteredUsers(users);
    }
  }, [users, searchActive]);

  const onSearchResults = (results) => {
    if (results === null) {
      setSearchActive(false);
      setFilteredUsers(users);
    } else {
      setSearchActive(true);
      setFilteredUsers(results);
    }
    setCurrentPage(1);
  };

  const exportToPDF = () => {
    try {
      setExporting(true);
      console.log("Starting PDF export...");
      
      // Step 1: Create basic PDF document - minimal configuration
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      console.log("PDF document created");
      
      // Step 2: Prepare simplified data
      const tableColumn = ["ID", "Username", "Email", "Status"];
      const tableRows = [];
      
      console.log("Preparing data rows, count:", filteredUsers.length);
      
      // Simplify data extraction to minimize potential errors
      for (let i = 0; i < filteredUsers.length; i++) {
        const user = filteredUsers[i];
        try {
          tableRows.push([
            String(user.id || ''),
            String(user.username || ''),
            String(user.email || ''),
            String(user.status || '')
          ]);
        } catch (rowError) {
          console.error("Error processing user row:", rowError, user);
        }
      }
      
      console.log("Data preparation complete, rows:", tableRows.length);
      
      // Step 3: Generate basic table
      try {
        doc.text("Users Report", 20, 10);
        
        // Use the imported autoTable directly
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20,
          theme: 'grid'
        });
        
        console.log("Table generated successfully");
        
        // Step 4: Save document with basic name
        doc.save("users.pdf");
        console.log("PDF saved successfully");
        toast.success('PDF exported successfully!');
      } catch (tableError) {
        console.error("Error in table generation:", tableError);
        toast.error('Failed to generate PDF table');
        throw new Error("Failed during table generation: " + tableError.message);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error('Failed to generate PDF: ' + (error.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };
  const addUser = () => {
    navigate('/users/add');
  };
  // Modal handlers
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setModalAction('delete');
    setShowModal(true);
  };

  const openActivateModal = (user) => {
    setUserToActivate(user);
    setModalAction('activate');
    setShowModal(true);
  };

  const openDeactivateModal = (user) => {
    setUserToDeactivate(user);
    setModalAction('deactivate');
    setShowModal(true);
  };

  const openVerifyModal = (user) => {
    setUserToVerify(user);
    setModalAction('verify');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
    setUserToActivate(null);
    setUserToDeactivate(null);
    setUserToVerify(null);
    setModalAction('');
  };

  const handleConfirmAction = async () => {
    try {
      switch (modalAction) {
        case 'delete':
          await dispatch(deleteUser(userToDelete.id)).unwrap();
          toast.success(`User "${userToDelete.username}" deleted successfully!`);
          break;
        case 'activate':
          await dispatch(activateUser(userToActivate.id)).unwrap();
          toast.success(`User "${userToActivate.username}" activated successfully!`);
          break;
        case 'deactivate':
          await dispatch(deactivateUser(userToDeactivate.id)).unwrap();
          toast.success(`User "${userToDeactivate.username}" deactivated successfully!`);
          break;
        case 'verify':
          await dispatch(manuallyVerifyMedicalProfessional(userToVerify.id)).unwrap();
          toast.success(`Medical professional "${userToVerify.username}" verified successfully!`);
          break;
        default:
          break;
      }
      dispatch(fetchUsers());
      closeModal();
    } catch (error) {
      console.error('Action failed:', error);
      switch (modalAction) {
        case 'delete':
          toast.error('Failed to delete user. Please try again.');
          break;
        case 'activate':
          toast.error('Failed to activate user. Please try again.');
          break;
        case 'deactivate':
          toast.error('Failed to deactivate user. Please try again.');
          break;
        case 'verify':
          toast.error('Failed to verify medical professional. Please try again.');
          break;
        default:
          toast.error('Action failed. Please try again.');
          break;
      }
    }
  };

  const handleToggle = (user) => {
    if (user.status === 'active') {
      openDeactivateModal(user);
    } else {
      openActivateModal(user);
    }
  };

  // Generate modal content based on action
  const getModalContent = () => {
    switch (modalAction) {
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete user "${userToDelete?.username}"? This action cannot be undone.`,
          confirmText: 'Delete',
          variant: 'danger'
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate user "${userToActivate?.username}"?`,
          confirmText: 'Activate',
          variant: 'success'
        };
      case 'deactivate':
        return {
          title: 'Deactivate User',
          message: `Are you sure you want to deactivate user "${userToDeactivate?.username}"?`,
          confirmText: 'Deactivate',
          variant: 'primary'
        };
      case 'verify':
        return {
          title: 'Verify Medical Professional',
          message: `Are you sure you want to manually verify "${userToVerify?.username}" as a medical professional?`,
          confirmText: 'Verify',
          variant: 'primary'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          variant: 'primary'
        };
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginated = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <AlertTriangle className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg shadow">
        <p>Error loading users: {error}</p>
      </div>
    );
  }

  const modalContent = getModalContent();

  return (
    <div className="space-y-6">
      
      <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-100">
            User Management
          </h2>
          <button
            onClick={addUser}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Add User
          </button>
  
        </div>

        <div className="flex items-center w-full dark:text-white">
                  <UserSearch
                    onSearchResults={onSearchResults}
                    placeholder="Search Users..."
                    className="flex-3 lg:flex-none"
                  />
                  </div>

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow mt-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['ID','Username','Email','Role','Status','Verified','License','Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:text-white">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm">{u.id}</td>
                  <td className="px-4 py-2 text-sm">{u.username}</td>
                  <td className="px-4 py-2 text-sm">{u.email}</td>
                  <td className="px-4 py-2 text-sm capitalize">{u.role.replace('_',' ')}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      u.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {u.created_by_admin
                      ? <CheckCircle className="inline text-green-500" />
                      : <AlertTriangle className="inline text-yellow-500" />}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {u.license_document
                      ? <a
                          href={u.license_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >View</a>
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button
                      onClick={() => navigate(`/users/edit/${u.id}`)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Edit"
                    ><Edit2 size={16} /></button>
                    <button
                      onClick={() => handleToggle(u)}
                      className={`p-1 hover:bg-gray-200 rounded ${
                        u.status === 'active' ? 'text-red-500' : 'text-green-500'
                      }`}
                      title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                    >{u.status==='active'?'❌':'✅'}</button>
                    <button
                      onClick={() => openDeleteModal(u)}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                      title="Delete"
                    ><Trash2 size={16} /></button>
                    {!u.created_by_admin && u.role !== 'parent' && (
                      <button
                        onClick={() => openVerifyModal(u)}
                        className="p-1 hover:bg-gray-200 rounded text-green-500"
                        title="Verify"
                      ><CheckCircle size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span>
                Showing {(currentPage-1)*itemsPerPage+1}–{Math.min(currentPage*itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
              >
                {[10,25,50,100].map(n => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p-1,1))}
                disabled={currentPage===1}
                className={`px-3 py-1 rounded ${currentPage===1
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i+1;
                if (totalPages>5 && page!==1 && page!==totalPages && Math.abs(page-currentPage)>2) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-2">…</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${page===currentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
                disabled={currentPage===totalPages}
                className={`px-3 py-1 rounded ${currentPage===totalPages
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
          show={showModal}
          onClose={closeModal}
          onConfirm={handleConfirmAction}
          title={modalContent.title}
          message={modalContent.message}
          confirmText={modalContent.confirmText}
          variant={modalContent.variant}
        />
      )}
    </div>
  );
}