import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AdmissionService from "../../services/admissions/AdmissionService";

export const fetchAdmissions = createAsyncThunk(
    'admissions/fetchAdmissions',
    async(_, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.fetchAdmissions(token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const searchAdmissions = createAsyncThunk(
    'admissions/searchAdmissions',
    async(query, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.searchAdmissions(query, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)


export const dischargeChild = createAsyncThunk(
    'admissions/dischargeChild',
    async (admissionId, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await AdmissionService.dischargeChild(admissionId, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );
export const fetchAdmissionById = createAsyncThunk(
    'admissions/fetchAdmissionById',
    async(admissionId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.fetchAdmissionById(admissionId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createAdmission = createAsyncThunk(
    'admissions/createAdmission',
    async(admissionData, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.createAdmission(admissionData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const generateAdmissionReport = createAsyncThunk(
  'admissions/generateAdmissionReport',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      // No appointmentData parameter needed
      const response = await AdmissionService.generateAdmissionReport(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdmission = createAsyncThunk(
    'admissions/updateAdmission',
    async({admissionId, updatedData}, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.updateAdmission(admissionId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteAdmission = createAsyncThunk(
    'admissions/deleteAdmission',
    async(admissionId, {getState, rejectWithValue}) => {
        try {
            const token = getState().auth.access;
            const response = await AdmissionService.deleteAdmission(admissionId, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const admissionSlice = createSlice({
    name: 'admission',
    initialState: {
        admissions: [],
        searchResults: [],
        reportData: null,
        selectedAdmission: null, 
        loading: false, 
        error: null,
    },

    reducers: { 
        clearSelectedAdmission: (state) => {
            state.selectedAdmission = null;
            state.error = null;
        },
        clearAdmissionError: (state) => {
            state.error = null;
        },
        clearAdmissionLoading: (state) => {
            state.loading = false;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
          },
          clearReportData: (state) => {
      state.reportData = null;
    },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAdmissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.admissions = action.payload;
            })
            .addCase(fetchAdmissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

                .addCase(searchAdmissions.pending, (state) => {
                          state.loading = true;
                          state.error = null;
                        })
                        .addCase(searchAdmissions.fulfilled, (state, action) => {
                          state.loading = false;
                          state.searchResults = action.payload;
                        })
                        .addCase(searchAdmissions.rejected, (state, action) => {
                          state.loading = false;
                          state.error = action.payload;
                        })
  .addCase(dischargeChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dischargeChild.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.admissions.findIndex(admission => admission.id === action.payload.id);
        if (index !== -1) {
          state.admissions[index] = action.payload;
        }
      })
      .addCase(dischargeChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            .addCase(fetchAdmissionById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdmissionById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAdmission = action.payload;
            })
            .addCase(fetchAdmissionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
             .addCase(generateAdmissionReport.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                  })
                  .addCase(generateAdmissionReport.fulfilled, (state, action) => {
                    state.loading = false;
                    state.reportData = action.payload;
                  })
                  .addCase(generateAdmissionReport.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                  })

            .addCase(createAdmission.pending, (state) => {
                state.loading = true;
            })
            .addCase(createAdmission.fulfilled, (state, action) => {
                state.loading = false;
                state.admissions.push(action.payload);
            })
            .addCase(createAdmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateAdmission.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAdmission.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.admissions.findIndex(admission => admission.id === action.payload.id);
                if (idx !== -1) state.admissions[idx] = action.payload;
            })
            .addCase(updateAdmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteAdmission.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAdmission.fulfilled, (state, action) => {
                state.loading = false;
                state.admissions = state.admissions.filter(admission => admission.id !== action.payload.id);
            })
            .addCase(deleteAdmission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
})

export const { clearSelectedAdmission, clearAdmissionError, clearSearchResults, clearAdmissionLoading, clearReportData } = admissionSlice.actions;
export default admissionSlice.reducer;