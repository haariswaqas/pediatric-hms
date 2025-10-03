import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import LabRequestService from '../../services/lab/LabRequestService';

export const fetchLabRequests = createAsyncThunk(
    'labRequest/fetchLabRequests', 
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestService.fetchLabRequests(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchLabRequestById = createAsyncThunk(
    'labRequest/fetchLabRequestById',
    async(labRequestId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestService.fetchLabRequestById(labRequestId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const createLabRequest = createAsyncThunk(
    'labRequest/createLabRequest',
    async(labRequestData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestService.createLabRequest(labRequestData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const updateLabRequest = createAsyncThunk(
    'labRequest/updateLabRequest',
    async({labRequestId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestService.updateLabRequest(labRequestId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteLabRequest = createAsyncThunk(
    'labRequest/deleteLabRequest',
    async(labRequestId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestService.deleteLabRequest(labRequestId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const labRequestSlice = createSlice({
    name: 'labRequest', 
    initialState: {
        labRequests: [], 
        bulkUploadResults: [],
        selectedLabRequest: null, 
        loading: false, 
        error: null,
    }, 

    reducers: {
        clearSelectedLabRequest: (state) => {
            state.selectedLabRequest = null;
            state.error = null;
        },
        clearLabRequestError: (state) => {
            state.error = null;
        },
        clearLabRequestLoading: (state) => {
            state.loading = false;
        },
        
      
    }, 

    extraReducers: (builder) => {
        builder
            .addCase(fetchLabRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

             .addCase(fetchLabRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.labRequests = action.payload;
            })
            .addCase(fetchLabRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(fetchLabRequestById.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
                        .addCase(fetchLabRequestById.fulfilled, (state, action) => {
                            state.loading = false;
                            state.selectedLabRequest = action.payload;
                        })
            
                        .addCase(fetchLabRequestById.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })  
            .addCase(createLabRequest.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
                        .addCase(createLabRequest.fulfilled, (state, action) => {
                            state.loading = false;
                            state.labRequests.push(action.payload);
                        })
            
                        .addCase(createLabRequest.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })
                         .addCase(updateLabRequest.pending, (state) => {
                                        state.loading = true;
                                        state.error = null;
                                    })
                                       
                        
                                    .addCase(updateLabRequest.fulfilled, (state, action) => {
                                           state.loading = false;
                                           const index = state.labRequests.findIndex(i => i.id === action.payload.id);
                                           if (index !== -1) state.labRequests[index] = action.payload;
                                         })
                        
                                    .addCase(updateLabRequest.rejected, (state, action) => {
                                        state.loading = false;
                                        state.error = action.payload;
                                    })

                                     .addCase(deleteLabRequest.pending, (state) => {
                                                    state.loading = true;
                                                    state.error = null;
                                                })
                                    
                                                .addCase(deleteLabRequest.fulfilled, (state, action) => {
                                                    state.loading = false;
                                                    state.labRequests = state.labRequests.filter(labRequest => labRequest.id !== action.payload.id);
                                                })
                                    
                                                .addCase(deleteLabRequest.rejected, (state, action) => {
                                                    state.loading = false;
                                                    state.error = action.payload;
                                                });
            

    }
})

export const { clearSelectedLabRequest, clearLabRequestError, clearLabRequestLoading} = labRequestSlice.actions;
export default labRequestSlice.reducer;