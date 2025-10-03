import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LabTestService from '../../services/lab/LabTestService';

export const fetchLabTests = createAsyncThunk(
    'labTest/fetchLabTests', 
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.fetchLabTests(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchLabTestById = createAsyncThunk(
    'labTest/fetchLabTestById',
    async(labTestId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.fetchLabTestById(labTestId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const bulkUploadLabTests = createAsyncThunk(
    'labTest/bulkUploadLabTests',
    async(file, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.bulkUploadLabTests(file, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createLabTest = createAsyncThunk(
    'labTest/createLabTest',
    async(labTestData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.createLabTest(labTestData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const updateLabTest = createAsyncThunk(
    'labTest/updateLabTest',
    async({labTestId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.updateLabTest(labTestId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteLabTest = createAsyncThunk(
    'labTest/deleteLabTest',
    async(labTestId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabTestService.deleteLabTest(labTestId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const labTestSlice = createSlice({
    name: 'labTest', 
    initialState: {
        labTests: [], 
        bulkUploadResults: [],
        selectedLabTest: null, 
        loading: false, 
        error: null,
    }, 

    reducers: {
        clearSelectedLabTest: (state) => {
            state.selectedLabTest = null;
            state.error = null;
        },
        clearLabTestError: (state) => {
            state.error = null;
        },
        clearLabTestLoading: (state) => {
            state.loading = false;
        },
        clearBulkUploadResults: (state) => {
            state.bulkUploadResults = [];
        },
      
    }, 

    extraReducers: (builder) => {
        builder
            .addCase(fetchLabTests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

             .addCase(fetchLabTests.fulfilled, (state, action) => {
                state.loading = false;
                state.labTests = action.payload;
            })
            .addCase(fetchLabTests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(fetchLabTestById.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
                        .addCase(fetchLabTestById.fulfilled, (state, action) => {
                            state.loading = false;
                            state.selectedLabTest = action.payload;
                        })
            
                        .addCase(fetchLabTestById.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })
            .addCase(createLabTest.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
                        .addCase(createLabTest.fulfilled, (state, action) => {
                            state.loading = false;
                            state.labTests.push(action.payload);
                        })
            
                        .addCase(createLabTest.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })
                         .addCase(updateLabTest.pending, (state) => {
                                        state.loading = true;
                                        state.error = null;
                                    })
                                       .addCase(bulkUploadLabTests.pending, (state) => {
                                                    state.loading = true;
                                                    state.error = null;
                                                })
                                                .addCase(bulkUploadLabTests.fulfilled, (state, action) => {
                                                    state.loading = false;
                                                    state.bulkUploadResults = action.payload;
                                                })
                                                .addCase(bulkUploadLabTests.rejected, (state, action) => {
                                                    state.loading = false;
                                                    state.error = action.payload;
                                                })
                        
                                    .addCase(updateLabTest.fulfilled, (state, action) => {
                                           state.loading = false;
                                           const index = state.labTests.findIndex(i => i.id === action.payload.id);
                                           if (index !== -1) state.labTests[index] = action.payload;
                                         })
                        
                                    .addCase(updateLabTest.rejected, (state, action) => {
                                        state.loading = false;
                                        state.error = action.payload;
                                    })

                                     .addCase(deleteLabTest.pending, (state) => {
                                                    state.loading = true;
                                                    state.error = null;
                                                })
                                    
                                                .addCase(deleteLabTest.fulfilled, (state, action) => {
                                                    state.loading = false;
                                                    state.labTests = state.labTests.filter(labTest => labTest.id !== action.payload.id);
                                                })
                                    
                                                .addCase(deleteLabTest.rejected, (state, action) => {
                                                    state.loading = false;
                                                    state.error = action.payload;
                                                });
            

    }
})

export const { clearSelectedLabTest, clearLabTestError, clearLabTestLoading, clearBulkUploadResults} = labTestSlice.actions;
export default labTestSlice.reducer;