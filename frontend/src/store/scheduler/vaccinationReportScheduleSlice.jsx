import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import VaccinationReportScheduleService from "../../services/scheduler/VaccinationReportScheduleService";

export const fetchVaccinationReportSchedule = createAsyncThunk(
    'vaccinationReportSchedule/fetchVaccinationReportSchedule',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccinationReportScheduleService.fetchVaccinationReportSchedule(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createVaccinationReportSchedule = createAsyncThunk(
    'vaccinationReportSchedule/createVaccinationReportSchedule',
    async (vaccinationReportScheduleData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccinationReportScheduleService.createVaccinationReportSchedule(vaccinationReportScheduleData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const vaccinationReportScheduleSlice = createSlice({
    name: 'vaccinationReportSchedule',
    initialState: {
        vaccinationReportSchedule: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearVaccinationReportScheduleError: (state) => {
            state.error = null;
        },
        clearVaccinationReportScheduleLoading: (state) => {
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVaccinationReportSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVaccinationReportSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccinationReportSchedule = action.payload;
            })
            .addCase(fetchVaccinationReportSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createVaccinationReportSchedule.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVaccinationReportSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccinationReportSchedule = action.payload;
            })
            .addCase(createVaccinationReportSchedule.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearVaccinationReportScheduleError,
    clearVaccinationReportScheduleLoading
} = vaccinationReportScheduleSlice.actions;

export default vaccinationReportScheduleSlice.reducer;
