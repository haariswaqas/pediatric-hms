import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const VaccinationReportScheduleService = {
    
      fetchVaccinationReportSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/schedule-vaccination-report/`, {
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

    createVaccinationReportSchedule: async(vaccinationReportScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/schedule-vaccination-report/`, vaccinationReportScheduleData, {
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

export default VaccinationReportScheduleService;