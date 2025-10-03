// src/store/report/reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ReportService from '../../services/report/ReportService';

// Fetch list of reports
export const fetchReports = createAsyncThunk(
  'report/fetchReports',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await ReportService.fetchReports(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch one report by id (metadata)
export const fetchReportById = createAsyncThunk(
  'report/fetchReportById',
  async (reportId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await ReportService.fetchReportById(reportId, token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a report
export const deleteReportById = createAsyncThunk(
  'report/deleteReport',
  async (reportId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await ReportService.deleteReport(reportId, token);
      return reportId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Download (blob‑fetch) a report
export const downloadReport = createAsyncThunk(
  'report/downloadReport',
  async ({ downloadUrl }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      await ReportService.downloadReport(downloadUrl, token);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  downloadStatus: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetDownloadStatus(state) {
      state.downloadStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchReportById
      .addCase(fetchReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteReportById
      .addCase(deleteReportById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter(r => r.id !== action.payload);
      })
      .addCase(deleteReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // downloadReport
      .addCase(downloadReport.pending, (state) => {
        state.downloadStatus = 'downloading';
        state.error = null;
      })
      .addCase(downloadReport.fulfilled, (state) => {
        state.downloadStatus = 'success';
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.downloadStatus = 'error';
        state.error = action.payload;
      });
  },
});

export const { clearError, resetDownloadStatus } = reportSlice.actions;
export default reportSlice.reducer;
