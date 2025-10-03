import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PrescriptionService from "../../services/prescriptions/PrescriptionService";
import { fetchChildren } from "../children/childManagementSlice";


// Thunks
export const fetchPrescriptions = createAsyncThunk(
    'prescription/fetchPrescriptions', 
    async(_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.fetchPrescriptions(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPrescriptionById = createAsyncThunk(
    'prescription/fetchPrescriptionById', 
    async(prescriptionId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.fetchPrescriptionById(prescriptionId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const autoExpireAll = createAsyncThunk(
    'prescription/autoExpireAll', 
    async(_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.autoExpireAll(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const autoCompleteAll = createAsyncThunk(
    'prescription/autoCompleteAll', 
    async(_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.autoCompleteAll(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const createPrescription = createAsyncThunk(
    'prescription/createPrescription', 
    async(prescriptionData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.createPrescription(prescriptionData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePrescription = createAsyncThunk(
    'prescription/updatePrescription', 
    async({ prescriptionId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await PrescriptionService.updatePrescription(prescriptionId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePrescription = createAsyncThunk(
    'prescription/deletePrescription', 
    async(prescriptionId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            await PrescriptionService.deletePrescription(prescriptionId, token);
            return prescriptionId; // return the ID for local removal
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const prescriptionSlice = createSlice({
    name: 'prescription',
    initialState: {
        prescriptions: [],
        selectedPrescription: null,
        loading: false,
        error: null
    },

    reducers: {
        clearSelectedPrescription: (state) => {
            state.selectedPrescription = null;
            state.error = null;
        },
        clearPrescriptionError: (state) => {
            state.error = null;
        },
        clearPrescriptionLoading: (state) => {
            state.loading = false;
        }
    },

    extraReducers: (builder) => {
        builder
            // Fetch prescriptions
            .addCase(fetchPrescriptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrescriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptions = action.payload;
            })
            .addCase(fetchPrescriptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch prescription by ID
            .addCase(fetchPrescriptionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPrescription = action.payload;
            })
            .addCase(fetchPrescriptionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(autoExpireAll.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(autoExpireAll.fulfilled, (state, action) => {
                state.loading = false;
                // Replace prescriptions with updated list if returned
                if (Array.isArray(action.payload)) {
                    state.prescriptions = action.payload;
        }
      })

      .addCase(autoExpireAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(autoCompleteAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoCompleteAll.fulfilled, (state, action) => {
        state.loading = false;
        // Replace prescriptions with updated list if returned
        if (Array.isArray(action.payload)) {
            state.prescriptions = action.payload;
        }
      })
      .addCase(autoCompleteAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            // Create prescription
            .addCase(createPrescription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPrescription.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptions.push(action.payload);
            })
            .addCase(createPrescription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update prescription
            .addCase(updatePrescription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePrescription.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.prescriptions.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.prescriptions[index] = action.payload;
                }
            })
            .addCase(updatePrescription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete prescription
            .addCase(deletePrescription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePrescription.fulfilled, (state, action) => {
                state.loading = false;
                state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
            })
            .addCase(deletePrescription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            

            // Fetch children
            .addCase(fetchChildren.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChildren.fulfilled, (state, action) => {
                state.loading = false;
                state.children = action.payload;
            })
            .addCase(fetchChildren.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearSelectedPrescription,
    clearPrescriptionError,
    clearPrescriptionLoading
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
