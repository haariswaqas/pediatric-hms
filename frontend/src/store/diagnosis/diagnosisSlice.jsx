// src/store/diagnosis/diagnosisSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import DiagnosisService from '../../services/diagnosis/DiagnosisService';

export const fetchDiagnoses = createAsyncThunk(
    'diagnosis/fetchDiagnoses',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.fetchDiagnoses(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const searchDiagnoses = createAsyncThunk(
    'diagnosis/searchDiagnoses',
    async(query, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.searchDiagnoses(query, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchDiagnosisById = createAsyncThunk(
    'diagnosis/fetchDiagnosisById',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.fetchDiagnosisById(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchICDCodes = createAsyncThunk(
    'diagnosis/fetchICDCode',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.searchICDCodes(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createDiagnosis = createAsyncThunk(
    'diagnosis/createDiagnosis',
    async(diagnosisData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.createDiagnosis(diagnosisData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateDiagnosis = createAsyncThunk(
    'diagnosis/updateDiagnosis',
    async({diagnosisId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.updateDiagnosis(diagnosisId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteDiagnosis = createAsyncThunk(
    'diagnosis/deleteDiagnosis',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.deleteDiagnosis(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)



// STATUS CHANGE ACTIONS
export const markDiagnosisResolved = createAsyncThunk(
    'diagnosis/markDiagnosisResolved',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisResolved(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const markDiagnosisChronic = createAsyncThunk(
    'diagnosis/markDiagnosisChronic',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisChronic(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const markDiagnosisActive = createAsyncThunk(
    'diagnosis/markDiagnosisActive',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisActive(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const markDiagnosisRecurrent = createAsyncThunk(
    'diagnosis/markDiagnosisRecurrent',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisRecurrent(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const markDiagnosisProvisional = createAsyncThunk(
    'diagnosis/markDiagnosisProvisional',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisProvisional(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const markDiagnosisRuleOut = createAsyncThunk(
    'diagnosis/markDiagnosisRuleOut',
    async(diagnosisId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await DiagnosisService.markDiagnosisRuleOut(diagnosisId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const diagnosisSlice = createSlice({
    name: 'diagnosis',
    initialState: {
        diagnoses: [],
        
        searchResults: [],
       
        selectedDiagnosis: null,
        loading: false, 
        error: null,
    },

    reducers: {
        clearSelectedDiagnosis: (state) => {
            state.selectedDiagnosis = null;
            state.error = null;
        },
        clearDiagnosisError: (state) => {
            state.error = null;
        },
        clearDiagnosisLoading: (state) => {
            state.loading = false;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
          },
    }, 
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiagnoses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiagnoses.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses = action.payload;
            })
            .addCase(fetchDiagnoses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchDiagnoses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchDiagnoses.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchDiagnoses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
           
            .addCase(fetchDiagnosisById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiagnosisById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDiagnosis = action.payload;
            })
            .addCase(fetchDiagnosisById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses = state.diagnoses.filter(diagnosis => diagnosis.id !== action.payload);
            })
            .addCase(deleteDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                state.diagnoses.push(action.payload);
            })
            .addCase(createDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateDiagnosis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDiagnosis.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.diagnoses.findIndex(diagnosis => diagnosis.id === action.payload.id);
                if (idx !== -1) state.diagnoses[idx] = action.payload;
            })
            .addCase(updateDiagnosis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

              // markDiagnosisResolved
              .addCase(markDiagnosisResolved.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markDiagnosisResolved.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.diagnoses.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.diagnoses[index] = action.payload;
                }
            })
            .addCase(markDiagnosisResolved.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // markDiagnosisChronic
            .addCase(markDiagnosisChronic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markDiagnosisChronic.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.diagnoses.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.diagnoses[index] = action.payload;
                }
            })
            .addCase(markDiagnosisChronic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

             // markDiagnosisActive
        .addCase(markDiagnosisActive.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(markDiagnosisActive.fulfilled, (state, action) => {
            state.loading = false;
            updateDiagnosisInState(state, action.payload);
        })
        .addCase(markDiagnosisActive.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // markDiagnosisRecurrent
        .addCase(markDiagnosisRecurrent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(markDiagnosisRecurrent.fulfilled, (state, action) => {
            state.loading = false;
            updateDiagnosisInState(state, action.payload);
        })
        .addCase(markDiagnosisRecurrent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // markDiagnosisProvisional
        .addCase(markDiagnosisProvisional.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(markDiagnosisProvisional.fulfilled, (state, action) => {
            state.loading = false;
            updateDiagnosisInState(state, action.payload);
        })
        .addCase(markDiagnosisProvisional.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // markDiagnosisRuleOut
        .addCase(markDiagnosisRuleOut.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(markDiagnosisRuleOut.fulfilled, (state, action) => {
            state.loading = false;
            updateDiagnosisInState(state, action.payload);
        })
        .addCase(markDiagnosisRuleOut.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
            
         
    }
})

export const {clearSelectedDiagnosis, clearDiagnosisError, clearSearchResults} = diagnosisSlice.actions
export default diagnosisSlice.reducer