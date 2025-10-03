import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const VaccinationReminderScheduleService = {
    
      fetchParentVaccinationReminderSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/parent/set-vaccination-reminder/`, {
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

    fetchMedicalVaccinationReminderSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/medical/set-vaccination-reminder/`, {
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
    

    createParentVaccinationReminderSchedule: async(parentVaccinationReminderScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/parent/set-vaccination-reminder/`, parentVaccinationReminderScheduleData, {
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
    createMedicalVaccinationReminderSchedule: async(medicalVaccinationReminderScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/medical/set-vaccination-reminder/`, medicalVaccinationReminderScheduleData, {
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

export default VaccinationReminderScheduleService;