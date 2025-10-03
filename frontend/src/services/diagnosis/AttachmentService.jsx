import axios from "axios";
import API from "../api";
import { handleRequestError } from "../handleRequestError";

const AttachmentService = {
    // fetch all attachments
    fetchAttachments: async (token) => {
        if (!token) throw new Error('Auth token missing');
        try {
            const res = await axios.get(`${API}/attachments/`, {
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

    // fetch one attachment by id
    fetchAttachmentById: async (attachmentId, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!attachmentId) throw new Error('Attachment ID is required');
        try {
            const res = await axios.get(`${API}/attachments/${attachmentId}/`, {
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

    // create a new attachment
    createAttachment: async (attachmentData, token) => {
        if (!token) throw new Error('Auth token missing');
        try {
            const res = await axios.post(`${API}/attachments/`, attachmentData, {
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

    // update an attachment
    updateAttachment: async (attachmentId, attachmentData, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!attachmentId) throw new Error('Attachment ID is required');
        try {
            const res = await axios.patch(`${API}/attachments/${attachmentId}/`, attachmentData, {
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

    // delete an attachment
    deleteAttachment: async (attachmentId, token) => {
        if (!token) throw new Error('Auth token missing');
        if (!attachmentId) throw new Error('Attachment ID is required');
        try {
            const res = await axios.delete(`${API}/attachments/${attachmentId}/`, {
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
}
export default AttachmentService;
