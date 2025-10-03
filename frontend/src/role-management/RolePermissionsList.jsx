// src/role-management/RolePermissionsList.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRolePermissions,
  fetchModels,
  deleteRolePermission,
} from "../store/admin/roleManagementSlice";
import { useNavigate } from "react-router-dom";

const RolePermissionsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { rolePermissions, loading, error } = useSelector(
    (state) => state.roleManagement
  );

  const [filterRole, setFilterRole] = useState("");
  const [filterModel, setFilterModel] = useState("");

  useEffect(() => {
    dispatch(fetchRolePermissions());
    dispatch(fetchModels());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role permission?")) {
      dispatch(deleteRolePermission(id));
    }
  };

  const handleEdit = (id) => {
    navigate(`/role-management/edit/${id}`);
  };

  const filteredPermissions = rolePermissions.filter((perm) => {
    return (
      (!filterRole || perm.role.toLowerCase().includes(filterRole.toLowerCase())) &&
      (!filterModel || perm.content_type_model.toLowerCase().includes(filterModel.toLowerCase()))
    );
  });

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Role Permissions</h2>
        <button
          onClick={() => navigate("/role-management/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Add New Permission
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by Role"
          className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Model"
          className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
        />
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-300">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filteredPermissions.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">No role permissions found.</p>
      )}

      {!loading && filteredPermissions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                
                <th className="p-2">Role</th>
                <th className="p-2">Content Type</th>
                <th className="p-2">Read</th>
                <th className="p-2">Create</th>
                <th className="p-2">Update</th>
                <th className="p-2">Delete</th>
          
                
                
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {filteredPermissions.map((perm) => (
                <tr
                  key={perm.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  
                  <td className="p-2">{perm.role}</td>
                  <td className="p-2">{perm.content_type_name}</td>
                  <td className="p-2">{perm.can_read ? "✅" : "❌"}</td>
                  <td className="p-2">{perm.can_create ? "✅" : "❌"}</td>
                  <td className="p-2">{perm.can_update ? "✅" : "❌"}</td>
                  <td className="p-2">{perm.can_delete ? "✅" : "❌"}</td>
                
                 

                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(perm.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(perm.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsList;
