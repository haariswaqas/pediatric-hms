import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const AdmissionReportScheduleService = {
    
      fetchAdmissionReportSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/schedule-admission-report/`, {
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

    createAdmissionReportSchedule: async(admissionReportScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/schedule-admission-report/`, admissionReportScheduleData, {
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

export default AdmissionReportScheduleService;