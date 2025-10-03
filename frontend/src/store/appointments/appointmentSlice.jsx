// src/store/appointments/appointmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AppointmentService from '../../services/appointments/AppointmentService';

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  'appointment/fetchAppointments',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.fetchAppointments(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
    'appointment/fetchAppointmentById',
    async (appointmentId, { getState, rejectWithValue }) => {
      const token = getState().auth.access;
      try {
        const response = await AppointmentService.fetchAppointmentById(appointmentId, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

// Fetch children (patients) for appointment creation
export const fetchChildren = createAsyncThunk(
  'appointment/fetchChildren',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.fetchChildren(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch doctors for appointment creation
export const fetchDoctors = createAsyncThunk(
  'appointment/fetchDoctors',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.fetchDoctors(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new appointment
export const createAppointment = createAsyncThunk(
  'appointment/createAppointment',
  async (appointmentData, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.createAppointment(appointmentData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateAppointmentReport = createAsyncThunk(
  'appointment/generateAppointmentReport',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      // No appointmentData parameter needed
      const response = await AppointmentService.generateAppointmentReport(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const autoCompleteAll = createAsyncThunk(
  'appointment/autoCompleteAll',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.autoCompleteAll(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



// Update existing appointment
export const updateAppointment = createAsyncThunk(
  'appointment/updateAppointment',
  async ({ appointmentId, updatedData }, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      const response = await AppointmentService.updateAppointment(appointmentId, updatedData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete an appointment
export const deleteAppointment = createAsyncThunk(
  'appointment/deleteAppointment',
  async (appointmentId, { getState, rejectWithValue }) => {
    const token = getState().auth.access;
    try {
      await AppointmentService.deleteAppointment(appointmentId, token);
      return appointmentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Activate a user
export const confirmAppointment = createAsyncThunk(
    'appointment/confirmAppointment',
    async (appointmentId, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await AppointmentService.confirmAppointment(appointmentId, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

export const cancelAppointment = createAsyncThunk(
    'appointment/cancelAppointment',
    async (appointmentId, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await AppointmentService.cancelAppointment(appointmentId, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );  

  export const searchAppointments = createAsyncThunk(
    'appointment/searchAppointments',
    async (query, { getState, rejectWithValue }) => {
      try {
        const token = getState().auth.access;
        const response = await AppointmentService.searchAppointments(query, token);
        return response;
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState: {
    appointments: [],
    children: [],
    doctors: [],
    
    selectedAppointment: null,
    searchResults: [],
    reportData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
      state.error = null;
    },
    clearReportData: (state) => {
      state.reportData = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
// fetchAppointmentById
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch children
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

      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(generateAppointmentReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAppointmentReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload; // Store in reportData instead of appointments
      })
      .addCase(generateAppointmentReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(autoCompleteAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoCompleteAll.fulfilled, (state, action) => {
        state.loading = false;
        // Replace appointments with updated list if returned
        if (Array.isArray(action.payload)) {
          state.appointments = action.payload;
        }
      })
      .addCase(autoCompleteAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.appointments.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.appointments[idx] = action.payload;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })


      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(a => a.id !== action.payload);
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(confirmAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //cancel
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

           .addCase(searchAppointments.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(searchAppointments.fulfilled, (state, action) => {
              state.loading = false;
              state.searchResults = action.payload;
            })
            .addCase(searchAppointments.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            });
  },
});

export const { clearAppointmentError, clearSearchResults, clearSelectedAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;
