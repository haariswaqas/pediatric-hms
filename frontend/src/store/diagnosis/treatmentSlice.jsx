import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import TreatmentService from '../../services/diagnosis/TreatmentService';


export const fetchTreatments = createAsyncThunk(
    'treatment/fetchTreatments',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await TreatmentService.fetchTreatments(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)



export const fetchTreatmentById = createAsyncThunk(
    'treatment/fetchTreatmentById',
    async(treatmentId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await TreatmentService.fetchTreatmentById(treatmentId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createTreatment = createAsyncThunk(
    'treatment/createTreatment',
    async(treatmentData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await TreatmentService.createTreatment(treatmentData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateTreatment = createAsyncThunk(
    'treatment/updateTreatment',
    async({treatmentId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await TreatmentService.updateTreatment(treatmentId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteTreatment = createAsyncThunk(
    'treatment/deleteTreatment',
    async(treatmentId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await TreatmentService.deleteTreatment(treatmentId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const treatmentSlice = createSlice({
    name: 'treatment',
    initialState: {
  
        treatments: [], 
        selectedTreatment: null,
        loading: false, 
        error: null
    }, 

    reducers: { 
        clearSelectedTreatment: (state) => {
            state.selectedTreatment = null;
            state.error = null;
        },
        clearTreatmentError: (state) => {
            state.error = null;
        },
        clearTreatmentLoading: (state) => {
            state.loading = false;
        }
    }, 

    extraReducers: (builder) => {
        builder
            .addCase(fetchTreatments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTreatments.fulfilled, (state, action) => {
                state.loading = false;
                state.treatments = action.payload;
            })
            .addCase(fetchTreatments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
       
            .addCase(fetchTreatmentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTreatmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedTreatment = action.payload;
            })
            .addCase(fetchTreatmentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateTreatment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTreatment.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.treatments.findIndex(treatment => treatment.id === action.payload.id);
                if (idx !== -1) state.treatments[idx] = action.payload;
            })
            .addCase(updateTreatment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteTreatment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTreatment.fulfilled, (state, action) => {
                state.loading = false;
                state.treatments = state.treatments.filter(treatment => treatment.id !== action.payload);
            })
            .addCase(deleteTreatment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTreatment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTreatment.fulfilled, (state, action) => {
                state.loading = false;
                state.treatments.push(action.payload);
            })
            .addCase(createTreatment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    }       

})
export const {clearSelectedTreatment, clearTreatmentError, clearTreatmentLoading} = treatmentSlice.actions
export default treatmentSlice.reducer