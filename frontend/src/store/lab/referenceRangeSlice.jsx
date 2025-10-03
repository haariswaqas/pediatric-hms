import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReferenceRangeService from '../../services/lab/ReferenceRangeService';

export const fetchReferenceRanges = createAsyncThunk(
    'referenceRange/fetchReferenceRanges',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            return await ReferenceRangeService.fetchReferenceRanges(token);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchReferenceRangeById = createAsyncThunk(
    'referenceRange/fetchReferenceRangeById',
    async (referenceRangeId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            return await ReferenceRangeService.fetchReferenceRangeById(referenceRangeId, token);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createReferenceRange = createAsyncThunk(
    'referenceRange/createReferenceRange',
    async (referenceRangeData, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            return await ReferenceRangeService.createReferenceRange(referenceRangeData, token);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const bulkUploadReferenceRanges = createAsyncThunk(
    'referenceRange/bulkUploadReferenceRanges',
    async(file, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await ReferenceRangeService.bulkUploadReferenceRanges(file, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateReferenceRange = createAsyncThunk(
    'referenceRange/updateReferenceRange',
    async ({ referenceRangeId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            return await ReferenceRangeService.updateReferenceRange(referenceRangeId, updatedData, token);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteReferenceRange = createAsyncThunk(
    'referenceRange/deleteReferenceRange',
    async (referenceRangeId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            return await ReferenceRangeService.deleteReferenceRange(referenceRangeId, token);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const referenceRangeSlice = createSlice({
    name: 'referenceRange',
    initialState: {
        referenceRanges: [],
        bulkUploadResults: [],
        selectedReferenceRange: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearSelectedReferenceRange: (state) => {
            state.selectedReferenceRange = null;
            state.error = null;
        },
        clearReferenceRangeError: (state) => {
            state.error = null;
        },
        clearReferenceRangeLoading: (state) => {
            state.loading = false;
        },
        clearBulkUploadResults: (state) => {
            state.bulkUploadResults = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReferenceRanges.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReferenceRanges.fulfilled, (state, action) => {
                state.loading = false;
                state.referenceRanges = action.payload;
            })
            .addCase(fetchReferenceRanges.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchReferenceRangeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReferenceRangeById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedReferenceRange = action.payload;
            })
            .addCase(fetchReferenceRangeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
   .addCase(bulkUploadReferenceRanges.pending, (state) => {
                                                    state.loading = true;
                                                    state.error = null;
                                                })
                                                .addCase(bulkUploadReferenceRanges.fulfilled, (state, action) => {
                                                    state.loading = false;
                                                    state.bulkUploadResults = action.payload;
                                                })
                                                .addCase(bulkUploadReferenceRanges.rejected, (state, action) => {
                                                    state.loading = false;
                                                    state.error = action.payload;
                                                })
            .addCase(createReferenceRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReferenceRange.fulfilled, (state, action) => {
                state.loading = false;
                state.referenceRanges.push(action.payload);
            })
            .addCase(createReferenceRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateReferenceRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReferenceRange.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.referenceRanges.findIndex(referenceRange => referenceRange.id === action.payload.id);
                if (index !== -1) state.referenceRanges[index] = action.payload;
            })
            .addCase(updateReferenceRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteReferenceRange.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReferenceRange.fulfilled, (state, action) => {
                state.loading = false;
                state.referenceRanges = state.referenceRanges.filter(
                    (referenceRange) => referenceRange.id !== action.payload.id
                );
            })
            .addCase(deleteReferenceRange.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearSelectedReferenceRange,
    clearReferenceRangeError,
    clearReferenceRangeLoading,
    clearBulkUploadResults,
} = referenceRangeSlice.actions;

export default referenceRangeSlice.reducer;
