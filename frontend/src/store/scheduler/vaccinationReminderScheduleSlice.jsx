// src/store/scheduler/appointmentReminderScheduleSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import VaccinationReminderScheduleService from "../../services/scheduler/VaccinationReminderScheduleService";

export const fetchParentVaccinationReminderSchedule = createAsyncThunk(
  "vaccinationReminderSchedule/fetchParentVaccinationReminderSchedule",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await VaccinationReminderScheduleService.fetchParentVaccinationReminderSchedule(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMedicalVaccinationReminderSchedule = createAsyncThunk(
  "vaccinationReminderSchedule/fetchMedicalVaccinationReminderSchedule",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await VaccinationReminderScheduleService.fetchMedicalVaccinationReminderSchedule(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createParentVaccinationReminderSchedule = createAsyncThunk(
  "vaccinationReminderSchedule/createParentVaccinationReminderSchedule",
  async (parentVaccinationReminderScheduleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await VaccinationReminderScheduleService.createParentVaccinationReminderSchedule(parentVaccinationReminderScheduleData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMedicalVaccinationReminderSchedule = createAsyncThunk(
  "vaccinationReminderSchedule/createMedicalVaccinationReminderSchedule",
  async (medicalVaccinationReminderScheduleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await VaccinationReminderScheduleService.createMedicalVaccinationReminderSchedule(medicalVaccinationReminderScheduleData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  parentVaccinationReminderSchedule: null,
  medicalVaccinationReminderSchedule: null,
  parentLoading: false,
  parentError: null,
  medicalLoading: false,
  medicalError: null,
};

const vaccinationReminderScheduleSlice = createSlice({
  name: "vaccinationReminderSchedule",
  initialState,
  reducers: {
    clearVaccinationReminderScheduleError: (state) => {
      state.parentError = null;
      state.medicalError = null;
    },
    clearVaccinationReminderScheduleLoading: (state) => {
      state.parentLoading = false;
      state.medicalLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Parent Vaccination Reminder fetch
      .addCase(fetchParentVaccinationReminderSchedule.pending, (state) => {
        state.parentLoading = true;
        state.parentError = null;
      })
      .addCase(fetchParentVaccinationReminderSchedule.fulfilled, (state, action) => {
        state.parentLoading = false;
        state.parentVaccinationReminderSchedule = action.payload;
      })
      .addCase(fetchParentVaccinationReminderSchedule.rejected, (state, action) => {
        state.parentLoading = false;
        state.parentError = action.payload;
      })

      // Medical Vaccination Reminder fetch
      .addCase(fetchMedicalVaccinationReminderSchedule.pending, (state) => {
        state.medicalLoading = true;
        state.medicalError = null;
      })
      .addCase(fetchMedicalVaccinationReminderSchedule.fulfilled, (state, action) => {
        state.medicalLoading = false;
        state.medicalVaccinationReminderSchedule = action.payload;
      })
      .addCase(fetchMedicalVaccinationReminderSchedule.rejected, (state, action) => {
        state.medicalLoading = false;
        state.medicalError = action.payload;
      })

      // Create Parent Vaccination Reminder
      .addCase(createParentVaccinationReminderSchedule.pending, (state) => {
        state.parentLoading = true;
        state.parentError = null;
      })
      .addCase(createParentVaccinationReminderSchedule.fulfilled, (state, action) => {
        state.parentLoading = false;
        state.parentVaccinationReminderSchedule = action.payload;
      })
      .addCase(createParentVaccinationReminderSchedule.rejected, (state, action) => {
        state.parentLoading = false;
        state.parentError = action.payload;
      })

      // Create Medical Vaccination Reminder
      .addCase(createMedicalVaccinationReminderSchedule.pending, (state) => {
        state.medicalLoading = true;
        state.medicalError = null;
      })
      .addCase(createMedicalVaccinationReminderSchedule.fulfilled, (state, action) => {
        state.medicalLoading = false;
        state.medicalVaccinationReminderSchedule = action.payload;
      })
      .addCase(createMedicalVaccinationReminderSchedule.rejected, (state, action) => {
        state.medicalLoading = false;
        state.medicalError = action.payload;
      });
  },
});

export const {
  clearVaccinationReminderScheduleError,
  clearVaccinationReminderScheduleLoading,
} = vaccinationReminderScheduleSlice.actions;

export default vaccinationReminderScheduleSlice.reducer;
