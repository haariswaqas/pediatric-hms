import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AdmissionVitalService from "../../services/admissions/AdmissionVitalService";

export const fetchAdmissionVitals = createAsyncThunk(
    'admissions/fetchAdmissionVitals',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.fetchAdmissionVitals(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchAdmissionVitalById = createAsyncThunk(
    'admissions/fetchAdmissionVitalById',
    async(admissionVitalId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.fetchAdmissionVitalById(admissionVitalId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchVitalHistories = createAsyncThunk(
    'admissions/fetchVitalHistories',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.fetchVitalHistories(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchVitalHistoryById = createAsyncThunk(
    'admissions/fetchVitalHistoryById',
    async(admissionVitalId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.fetchVitalHistoryById(admissionVitalId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createAdmissionVital = createAsyncThunk(
    'admissions/createAdmissionVital',
    async(admissionVitalData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.createAdmissionVital(admissionVitalData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateAdmissionVital = createAsyncThunk(
    'admissions/updateAdmissionVital',
    async({admissionVitalId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.updateAdmissionVital(admissionVitalId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteAdmissionVital = createAsyncThunk(
    'admissions/deleteAdmissionVital',
    async(admissionVitalId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionVitalService.deleteAdmissionVital(admissionVitalId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const admissionVitalSlice = createSlice({
    name: 'admissionVital',
    initialState: {
        admissionVitals: [],
        vitalHistories: [],
        selectedAdmissionVital: null,
        selectedVitalHistory: null, 
        loading: false, 
        error: null,
    }, 

    reducers: {
        clearSelectedAdmissionVital: (state) => {
            state.selectedAdmissionVital = null;
            state.error = null;
        },
        clearSelectedVitalHistory: (state) => {
            state.selectedVitalHistory = null;
            state.error = null;
        },
        clearAdmissionVitalError: (state) => {
            state.error = null;
        },
        clearVitalHistoryError: (state) => {
            state.error = null;
        },
        clearAdmissionVitalLoading: (state) => {
            state.loading = false;
        },
        clearVitalHistoryLoading: (state) => {
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdmissionVitals.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdmissionVitals.fulfilled, (state, action) => {
                state.loading = false;
                state.admissionVitals = action.payload;
            })
            .addCase(fetchAdmissionVitals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
          
            .addCase(fetchVitalHistories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchVitalHistories.fulfilled, (state, action) => {
                state.loading = false;
                state.vitalHistories = action.payload;
            })
            .addCase(fetchVitalHistories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(fetchAdmissionVitalById.pending, (state) => {
                            state.loading = true;
                        })
                        .addCase(fetchAdmissionVitalById.fulfilled, (state, action) => {
                            state.loading = false;
                            state.selectedAdmissionVital = action.payload;
                        })
                        .addCase(fetchAdmissionVitalById.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })
                        .addCase(fetchVitalHistoryById.pending, (state) => {
                            state.loading = true;
                        })
                        .addCase(fetchVitalHistoryById.fulfilled, (state, action) => {
                            state.loading = false;
                            state.selectedVitalHistory = action.payload;
                        })
                        .addCase(fetchVitalHistoryById.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })

              .addCase(createAdmissionVital.pending, (state) => {
                            state.loading = true;
                        })
                        .addCase(createAdmissionVital.fulfilled, (state, action) => {
                            state.loading = false;
                            state.admissionVitals.push(action.payload);
                        })
                        .addCase(createAdmissionVital.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })

                        .addCase(updateAdmissionVital.pending, (state) => {
                            state.loading = true;
                        })
                        .addCase(updateAdmissionVital.fulfilled, (state, action) => {
                            state.loading = false;
                            const idx = state.admissionVitals.findIndex(admissionVital => admissionVital.id === action.payload.id);
                            if (idx !== -1) state.admissionVitals[idx] = action.payload;
                        })
                        .addCase(updateAdmissionVital.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })

                        .addCase(deleteAdmissionVital.pending, (state) => {
                            state.loading = true;
                        })
                        .addCase(deleteAdmissionVital.fulfilled, (state, action) => {
                            state.loading = false;
                            state.admissionVitals = state.admissionVitals.filter(admissionVital => admissionVital.id !== action.payload.id);
                        })
                        .addCase(deleteAdmissionVital.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })}})

export const { clearSelectedAdmissionVital, clearAdmissionVitalError, clearAdmissionVitalLoading,
    clearSelectedVitalHistory, clearVitalHistoryError, clearVitalHistoryLoading } = admissionVitalSlice.actions;
export default admissionVitalSlice.reducer;
