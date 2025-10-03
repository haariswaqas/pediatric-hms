// src/store/scheduler/appointmentReminderScheduleSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AppointmentReminderScheduleService from "../../services/scheduler/AppointmentReminderScheduleService";

export const fetchAppointmentReminderSchedule = createAsyncThunk(
  "appointmentReminderSchedule/fetchAppointmentReminderSchedule",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await AppointmentReminderScheduleService.fetchAppointmentReminderSchedule(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDoctorAppointmentReminderSchedule = createAsyncThunk(
  "appointmentReminderSchedule/fetchDoctorAppointmentReminderSchedule",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await AppointmentReminderScheduleService.fetchDoctorAppointmentReminderSchedule(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAppointmentReminderSchedule = createAsyncThunk(
  "appointmentReminderSchedule/createAppointmentReminderSchedule",
  async (appointmentReminderScheduleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await AppointmentReminderScheduleService.createAppointmentReminderSchedule(appointmentReminderScheduleData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDoctorAppointmentReminderSchedule = createAsyncThunk(
  "appointmentReminderSchedule/createDoctorAppointmentReminderSchedule",
  async (doctorAppointmentReminderScheduleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await AppointmentReminderScheduleService.createDoctorAppointmentReminderSchedule(doctorAppointmentReminderScheduleData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  appointmentReminderSchedule: null,
  doctorAppointmentReminderSchedule: null,
  loading: false,
  error: null,
};

const appointmentReminderScheduleSlice = createSlice({
  name: "appointmentReminderSchedule",
  initialState,
  reducers: {
    clearAppointmentReminderScheduleError: (state) => {
      state.error = null;
    },
    clearAppointmentReminderScheduleLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Appointment Reminder
      .addCase(fetchAppointmentReminderSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentReminderSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.appointmentReminderSchedule = action.payload;
      })
      .addCase(fetchAppointmentReminderSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Doctor Appointment Reminder
      .addCase(fetchDoctorAppointmentReminderSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointmentReminderSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorAppointmentReminderSchedule = action.payload;
      })
      .addCase(fetchDoctorAppointmentReminderSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Appointment Reminder
      .addCase(createAppointmentReminderSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointmentReminderSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.appointmentReminderSchedule = action.payload;
      })
      .addCase(createAppointmentReminderSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Doctor Appointment Reminder
      .addCase(createDoctorAppointmentReminderSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctorAppointmentReminderSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorAppointmentReminderSchedule = action.payload;
      })
      .addCase(createDoctorAppointmentReminderSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearAppointmentReminderScheduleError,
  clearAppointmentReminderScheduleLoading,
} = appointmentReminderScheduleSlice.actions;

export default appointmentReminderScheduleSlice.reducer;
