// src/store/children/childManagementSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ChildManagementService from '../../services/children/ChildManagementService';

// -------------------- Existing Thunks --------------------

// Fetch all children
export const fetchChildren = createAsyncThunk(
  'childManagement/fetchChildren',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await ChildManagementService.fetchChildren(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all parents (for dropdowns)
export const fetchParents = createAsyncThunk(
  'childManagement/fetchParents',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await ChildManagementService.fetchParents(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch a single child by ID
export const fetchChildById = createAsyncThunk(
  'childManagement/fetchChildById',
  async (childId, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await ChildManagementService.fetchChildById(childId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new child
export const createChild = createAsyncThunk(
  'childManagement/createChild',
  async (childData, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await ChildManagementService.createChild(childData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing child
export const updateChild = createAsyncThunk(
  'childManagement/updateChild',
  async ({ childId, updatedData }, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await ChildManagementService.updateChild(childId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a child
export const deleteChild = createAsyncThunk(
  'childManagement/deleteChild',
  async (childId, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      await ChildManagementService.deleteChild(childId, token);
      return childId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Search children
export const searchChildren = createAsyncThunk(
  'childManagement/searchChildren',
  async (query, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      const response = await ChildManagementService.searchChildren(query, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// -------------------- NEW: Medical History PDF --------------------
export const fetchMedicalHistoryPdf = createAsyncThunk(
  'childManagement/fetchMedicalHistoryPdf',
  async (childId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access || localStorage.getItem('access_token');
      const fileUrl = await ChildManagementService.fetchMedicalHistoryPdf(childId, token);
      return { childId, fileUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const downloadMedicalHistoryPdf = createAsyncThunk(
  'childManagement/downloadMedicalHistoryPdf',
  async (childId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access || localStorage.getItem('access_token');
      await ChildManagementService.downloadMedicalHistoryPdf(childId, token);
      return childId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const bulkUploadChildren = createAsyncThunk(
  'children/bulkUploadChildren',
  async(file, {getState, rejectWithValue}) => {
      try {
          const token = getState().auth.access;
          const response = await ChildManagementService.bulkUploadChildren(file, token);
          return response;
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
)

// -------------------- Slice --------------------
const childManagementSlice = createSlice({
  name: 'childManagement',
  initialState: {
    children: [],
    parents: [],
    selectedChild: null,
    searchResults: [],
    bulkUploadResults: [],
    loading: false,
    error: null,
    // NEW: Store medical history PDFs
    historyPdfs: {}, // { [childId]: fileUrl }
  },
  reducers: {
    clearSelectedChild: (state) => {
      state.selectedChild = null;
      state.error = null;
    },
    clearMedicalHistoryPdf: (state, action) => {
      delete state.historyPdfs[action.payload];
    },
    clearBulkUploadResults: (state) => {
      state.bulkUploadResults = [];
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchChildren
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
      })

      // fetchParents
      .addCase(fetchParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParents.fulfilled, (state, action) => {
        state.loading = false;
        state.parents = action.payload;
      })
      .addCase(fetchParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchChildById
      .addCase(fetchChildById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChild = action.payload;
      })
      .addCase(fetchChildById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createChild
      .addCase(createChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChild.fulfilled, (state, action) => {
        state.loading = false;
        state.children.push(action.payload);
      })
      .addCase(createChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateChild
      .addCase(updateChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.children.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.children[idx] = action.payload;
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteChild
      .addCase(deleteChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.loading = false;
        state.children = state.children.filter(c => c.id !== action.payload);
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // bulkUploadChildren
      .addCase(bulkUploadChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUploadChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkUploadResults = action.payload;
      })
      .addCase(bulkUploadChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // searchChildren
      .addCase(searchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMedicalHistoryPdf
      .addCase(fetchMedicalHistoryPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalHistoryPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.historyPdfs[action.payload.childId] = action.payload.fileUrl;
      })
      .addCase(fetchMedicalHistoryPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // downloadMedicalHistoryPdf
      .addCase(downloadMedicalHistoryPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadMedicalHistoryPdf.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadMedicalHistoryPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedChild, clearMedicalHistoryPdf, clearBulkUploadResults } = childManagementSlice.actions;
export default childManagementSlice.reducer;
