// src/services/children/ChildManagementService.jsx
import axios from 'axios';
import API from '../api/';
import { handleRequestError } from '../handleRequestError';

const ChildManagementService = {
  // Fetch all children
  fetchChildren: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${API}/children/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Fetch one child by ID
  fetchChildById: async (childId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!childId) throw new Error('Child ID is required');
    try {
      const res = await axios.get(
        `${API}/children/${childId}/`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Fetch all parent profiles for guardian dropdowns
  fetchParents: async (token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      const res = await axios.get(`${API}/admin/parent-profiles/`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Create a new child
  createChild: async (childData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    try {
      // If there is a file field, childData should be FormData
      const isFormData = childData instanceof FormData;
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await axios.post(
        `${API}/children/`,
        childData,
        {
          headers,
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Update an existing child
  updateChild: async (childId, updatedData, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!childId) throw new Error('Child ID is required');
    try {
      const isFormData = updatedData instanceof FormData;
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      const res = await axios.patch(
        `${API}/children/${childId}/`,
        updatedData,
        {
          headers,
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Delete a child
  deleteChild: async (childId, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!childId) throw new Error('Child ID is required');
    try {
      const res = await axios.delete(
        `${API}/children/${childId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // Search children by query
  searchChildren: async (query, token) => {
    if (!token) throw new Error('Authorization token is missing');
    if (!query) throw new Error("Search query 'q' is required");
    try {
      const res = await axios.get(
        `${API}/children/search/`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          params: { q: query },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // 📄 Fetch Medical History PDF
  fetchMedicalHistoryPdf: async (childId, token) => {
    if (!token) throw new Error("Authorization token is missing");
    if (!childId) throw new Error("Child ID is required");

    try {
      const res = await axios.get(`${API}/children/${childId}/medical-history-pdf/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // ✅ important for PDF
        withCredentials: true,
      });

      // ✅ Explicitly set Blob type to application/pdf
      const fileUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      return fileUrl;
    } catch (err) {
      handleRequestError(err);
    }
  },

  // 📄 Open PDF in new tab
  openMedicalHistoryPdf: async (childId, token) => {
    const fileUrl = await ChildManagementService.fetchMedicalHistoryPdf(childId, token);
    if (fileUrl) {
      window.open(fileUrl, "_blank"); // ✅ opens in new tab
    }
  },

  // 📄 Download PDF
  downloadMedicalHistoryPdf: async (childId, token) => {
    const fileUrl = await ChildManagementService.fetchMedicalHistoryPdf(childId, token);
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", `medical_history_${childId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },


  bulkUploadChildren: async (file, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/children/bulk-upload/`, file, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            handleRequestError(err);
        }
    },

};



export default ChildManagementService;
