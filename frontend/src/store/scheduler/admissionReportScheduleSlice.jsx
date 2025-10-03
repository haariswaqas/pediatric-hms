import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AdmissionReportScheduleService from "../../services/scheduler/AdmissionReportScheduleService";

export const fetchAdmissionReportSchedule = createAsyncThunk(
    'admissionReportSchedule/fetchAdmissionReportSchedule',
    async(_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionReportScheduleService.fetchAdmissionReportSchedule(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createAdmissionReportSchedule = createAsyncThunk(
    'admissionReportSchedule/createAdmissionReportSchedule',
    async(admissionReportScheduleData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionReportScheduleService.createAdmissionReportSchedule(admissionReportScheduleData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const admissionReportScheduleSlice = createSlice({
    name: 'admissionReportSchedule',
    initialState: {
        admissionReportSchedule: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearAdmissionReportScheduleError: (state) => {
            state.error = null;
        },
        clearAdmissionReportScheduleLoading: (state) => {
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdmissionReportSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdmissionReportSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.admissionReportSchedule = action.payload;
            })
            .addCase(fetchAdmissionReportSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAdmissionReportSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAdmissionReportSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.admissionReportSchedule = action.payload; // Replace instead of pushing
            })
            .addCase(createAdmissionReportSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const {
    clearAdmissionReportScheduleError,
    clearAdmissionReportScheduleLoading
} = admissionReportScheduleSlice.actions;

export default admissionReportScheduleSlice.reducer;
