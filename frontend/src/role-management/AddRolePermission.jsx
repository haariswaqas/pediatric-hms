import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRolePermission, fetchModels } from '../store/admin/roleManagementSlice';
import { useNavigate } from 'react-router-dom';
import { Switch } from './components/Switch';
import { Button } from './components/Button';
import { Card } from './components/Card';
// Component for a styled button


const AddRolePermission = () => {
    const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { models, loading, error } = useSelector((state) => state.roleManagement);
  
  const [rolePermissionData, setRolePermissionData] = useState({
    role: '',
    content_type: '',
    can_read: false,
    can_create: false,
    can_update: false,
    can_delete: false,
  });

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRolePermissionData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleChange = (permission) => {
    setRolePermissionData((prevData) => ({
      ...prevData,
      [permission]: !prevData[permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createRolePermission(rolePermissionData)).then(() => {
      navigate('/role-management');
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add Role Permission</h1>
        <Button 
          onClick={() => navigate('/role-management')}
          variant="outline"
          size="sm"
        >
          Back to Permissions
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <select
  id="role"
  name="role"
  value={rolePermissionData.role}
  onChange={handleChange}
  required
  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
             dark:text-white dark:focus:ring-blue-400"
>
  <option value="">Select Role</option>
  <option value="admin">Administrator</option>
  <option value="doctor">Doctor</option>
  <option value="nurse">Nurse</option>
  <option value="pharmacist">Pharmacist</option>
  <option value="lab_tech">Lab Technician</option>
  <option value="parent">Parent</option>
</select>

            </div>

            <div>
              <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                id="content_type"
                name="content_type"
                value={rolePermissionData.content_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 
                           dark:text-white dark:focus:ring-blue-400"
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} 
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Permission Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Read Access</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to view this content</p>
                </div>
                <Switch 
                  checked={rolePermissionData.can_read}
                  onChange={() => handleToggleChange('can_read')}
                  name="can_read"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Create Access</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to create new content</p>
                </div>
                <Switch 
                  checked={rolePermissionData.can_create}
                  onChange={() => handleToggleChange('can_create')}
                  name="can_create"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Update Access</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to modify content</p>
                </div>
                <Switch 
                  checked={rolePermissionData.can_update}
                  onChange={() => handleToggleChange('can_update')}
                  name="can_update"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Delete Access</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to remove content</p>
                </div>
                <Switch 
                  checked={rolePermissionData.can_delete}
                  onChange={() => handleToggleChange('can_delete')}
                  name="can_delete"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => navigate('/role-management')}
            >
              Cancel
            </Button>
            <Button
              type="submit" 
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
            >
              Add Role Permission
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AddRolePermission;