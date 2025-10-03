import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LabRequestItemService from "../../services/lab/LabRequestItemService";

export const fetchLabRequestItems = createAsyncThunk(
    'labRequestItem/fetchLabRequestItems', 
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestItemService.fetchLabRequestItems(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const fetchLabRequestItemById = createAsyncThunk(
    'labRequestItem/fetchLabRequestItemById',
    async(labRequestItemId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestItemService.fetchLabRequestItemById(labRequestItemId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createLabRequestItem = createAsyncThunk(
    'labRequestItem/createLabRequestItem',
    async(labRequestItemData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestItemService.createLabRequestItem(labRequestItemData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const updateLabRequestItem = createAsyncThunk(
    'labRequestItem/updateLabRequestItem',
    async({labRequestItemId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestItemService.updateLabRequestItem(labRequestItemId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const deleteLabRequestItem = createAsyncThunk(
    'labRequestItem/deleteLabRequestItem',
    async(labRequestItemId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await LabRequestItemService.deleteLabRequestItem(labRequestItemId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)



const labRequestItemSlice = createSlice({
    name: 'labRequestItem', 
    initialState: {
        labRequestItems: [], 
        selectedLabRequestItem: null, 
        loading: false, 
        error: null,
    }, 

    reducers: {
        clearSelectedLabRequestItem: (state) => {
            state.selectedLabRequestItem = null;
            state.error = null;
        },
        clearLabRequestItemError: (state) => {
            state.error = null;
        },
        clearLabRequestItemLoading: (state) => {
            state.loading = false;
        },
        
      
    }, 

    extraReducers: (builder) => {
        builder
            .addCase(fetchLabRequestItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

             .addCase(fetchLabRequestItems.fulfilled, (state, action) => {
                state.loading = false;
                state.labRequestItems = action.payload;
            })
            .addCase(fetchLabRequestItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(fetchLabRequestItemById.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
                        .addCase(fetchLabRequestItemById.fulfilled, (state, action) => {
                            state.loading = false;
                            state.selectedLabRequestItem = action.payload;
                        })
            
                        .addCase(fetchLabRequestItemById.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        })  
            .addCase(createLabRequestItem.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
            
            .addCase(createLabRequestItem.fulfilled, (state, action) => {
                state.loading = false;
                state.labRequestItems.push(action.payload);
            })
            
            .addCase(createLabRequestItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
                         .addCase(updateLabRequestItem.pending, (state) => {
                            state.loading = true;
                            state.error = null;
                        })
                                       
            .addCase(updateLabRequestItem.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.labRequestItems.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.labRequestItems[index] = action.payload;
            })
                        
            .addCase(updateLabRequestItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteLabRequestItem.pending, (state) => {
                state.loading = true;
                state.error = null;
                                                })
                                    
            .addCase(deleteLabRequestItem.fulfilled, (state, action) => {
                            state.loading = false;
                            state.labRequestItems = state.labRequestItems.filter(labRequestItem => labRequestItem.id !== action.payload.id);
                        })
                                    
            .addCase(deleteLabRequestItem.rejected, (state, action) => {
                            state.loading = false;
                            state.error = action.payload;
                        });
            

    }
})

export const { clearSelectedLabRequestItem, clearLabRequestItemError, clearLabRequestItemLoading} = labRequestItemSlice.actions;
export default labRequestItemSlice.reducer;