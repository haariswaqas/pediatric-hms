import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AttachmentService from '../../services/diagnosis/AttachmentService';
import { fetchDiagnoses } from './diagnosisSlice';

export const fetchAttachments = createAsyncThunk(
    'attachment/fetchAttachments',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AttachmentService.fetchAttachments(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchAttachmentById = createAsyncThunk(
    'attachment/fetchAttachmentById',
    async(attachmentId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AttachmentService.fetchAttachmentById(attachmentId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createAttachment = createAsyncThunk(
    'attachment/createAttachment',
    async(attachmentData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AttachmentService.createAttachment(attachmentData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateAttachment = createAsyncThunk(
    'attachment/updateAttachment',
    async({attachmentId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AttachmentService.updateAttachment(attachmentId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteAttachment = createAsyncThunk(
    'attachment/deleteAttachment',
    async(attachmentId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AttachmentService.deleteAttachment(attachmentId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


const attachmentSlice = createSlice({
    name: 'attachment', 
    initialState: {
        attachments: [],
        diagnoses: [],
        selectedAttachment: null,
        loading: false, 
        error: null
    },

    reducer: {
        clearSelectedAttachment: (state) => {
            state.selectedAttachment = null;
            state.error = null;
        },
        clearAttachmentError: (state) => {
            state.error = null;
        },
        clearAttachmentLoading: (state) => {
            state.loading = false;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAttachments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttachments.fulfilled, (state, action) => {
                state.loading = false;
                state.attachments = action.payload;
            })
            .addCase(fetchAttachments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

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

            .addCase(fetchAttachmentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttachmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAttachment = action.payload;
            })
            .addCase(fetchAttachmentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createAttachment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAttachment.fulfilled, (state, action) => {
                state.loading = false;
                state.attachments.push(action.payload);
            })
            .addCase(createAttachment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateAttachment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAttachment.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.attachments.findIndex(attachment => attachment.id === action.payload.id);
                if (idx !== -1) state.attachments[idx] = action.payload;
            })
            .addCase(updateAttachment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteAttachment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAttachment.fulfilled, (state, action) => {
                state.loading = false;
                state.attachments = state.attachments.filter(attachment => attachment.id !== action.payload);
            })
            .addCase(deleteAttachment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

           
    }
})

export const {clearSelectedAttachment, clearAttachmentError, clearAttachmentLoading} = attachmentSlice.actions
export default attachmentSlice.reducer