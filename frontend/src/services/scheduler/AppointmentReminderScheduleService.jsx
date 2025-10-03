import axios from 'axios';
import API from '../api';
import { handleRequestError } from '../handleRequestError';

const AppointmentReminderScheduleService = {
    
      fetchAppointmentReminderSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/appointment/set-reminder/`, {
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

    fetchDoctorAppointmentReminderSchedule: async(token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.get(`${API}/doctor/set-appointment-reminder/`, {
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
    

    createAppointmentReminderSchedule: async(appointmentReminderScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/appointment/set-reminder/`, appointmentReminderScheduleData, {
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
    createDoctorAppointmentReminderSchedule: async(doctorAppointmentReminderScheduleData, token) => {
        if (!token) throw new Error('Authorization token is missing');
        try {
            const res = await axios.post(`${API}/doctor/set-appointment-reminder/`, doctorAppointmentReminderScheduleData, {
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

export default AppointmentReminderScheduleService;