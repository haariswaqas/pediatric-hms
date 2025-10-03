import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DrugService from '../../services/drugs/DrugService';

export const fetchDrugs = createAsyncThunk(
    'drugs/fetchDrugs',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.fetchDrugs(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchDrugById = createAsyncThunk(
    'drugs/fetchDrugById',
    async(drugId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.fetchDrugById(drugId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const bulkUploadDrugs = createAsyncThunk(
    'drugs/bulkUploadDrugs',
    async(file, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.bulkUploadDrugs(file, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const searchDrugs = createAsyncThunk(
    'drugs/searchDrugs',
    async(query, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.searchDrugs(query, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createDrug = createAsyncThunk(
    'drugs/createDrug',
    async(drugData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.createDrug(drugData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateDrug = createAsyncThunk(
    'drugs/updateDrug',
    async({drugId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.updateDrug(drugId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteDrug = createAsyncThunk(
    'drugs/deleteDrug',
    async(drugId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DrugService.deleteDrug(drugId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const drugSlice = createSlice({
    name: 'drug',
    initialState: {
        drugs: [],
        searchResults: [],
        bulkUploadResults: [],
        selectedDrug: null,
        loading: false, 
        error: null, 
    }, 

    reducers: {
        clearSelectedDrug: (state) => {
          state.selectedDrug = null;
          state.error = null;
        },
        clearDrugError: (state) => {
          state.error = null;
        },
        clearDrugLoading: (state) => {
          state.loading = false;
        },
        clearSearchResults: (state) => {
          state.searchResults = [];
        },
        clearBulkUploadResults: (state) => {
          state.bulkUploadResults = [];
          state.uploadError = null;
        },
      },

    extraReducers: (builder) => {
        builder
            .addCase(fetchDrugs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            
            .addCase(fetchDrugs.fulfilled, (state, action) => {
                state.loading = false;
                state.drugs = action.payload;
            })
            .addCase(fetchDrugs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(bulkUploadDrugs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUploadDrugs.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkUploadResults = action.payload;
            })
            .addCase(bulkUploadDrugs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(searchDrugs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchDrugs.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchDrugs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchDrugById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchDrugById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDrug = action.payload;
            })

            .addCase(fetchDrugById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createDrug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createDrug.fulfilled, (state, action) => {
                state.loading = false;
                state.drugs.push(action.payload);
            })

            .addCase(createDrug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateDrug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateDrug.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.drugs.findIndex(drug => drug.id === action.payload.id);
                if (idx !== -1) state.drugs[idx] = action.payload;
            })

            .addCase(updateDrug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteDrug.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(deleteDrug.fulfilled, (state, action) => {
                state.loading = false;
                state.drugs = state.drugs.filter(drug => drug.id !== action.payload.id);
            })

            .addCase(deleteDrug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
})

export const { clearSelectedDrug, clearDrugError, clearBulkUploadResults, clearDrugLoading, clearSearchResults } = drugSlice.actions;
export default drugSlice.reducer;
