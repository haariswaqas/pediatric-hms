// src/store/shifts/shiftAssignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  DoctorShiftAssignmentService,
  NurseShiftAssignmentService,
  PharmacistShiftAssignmentService,
  LabTechShiftAssignmentService
} from '../../services/shift/ShiftAssignmentService';

// Thunks
export const fetchDoctorAssignments = createAsyncThunk(
  'shiftAssignment/fetchDoctor',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.access;
      return await DoctorShiftAssignmentService.fetchAll(token);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
// (Similarly define create/update/delete for doctor, and fetch/create/update/delete for nurse, pharmacist, labtech)

const slice = createSlice({
  name: 'shiftAssignment',
  initialState: {
    doctor: { items: [], loading: false, error: null },
    nurse: { items: [], loading: false, error: null },
    pharmacist: { items: [], loading: false, error: null },
    labtech: { items: [], loading: false, error: null }
  },
  reducers: {},
  extraReducers: builder => {
    // ==== FETCH CASES ====
    builder
      // Doctor fetch
      .addCase(fetchDoctorAssignments.pending, state => {
        state.doctor.loading = true; state.doctor.error = null;
      })
      .addCase(fetchDoctorAssignments.fulfilled, (state, action) => {
        state.doctor.loading = false; state.doctor.items = action.payload;
      })
      .addCase(fetchDoctorAssignments.rejected, (state, action) => {
        state.doctor.loading = false; state.doctor.error = action.payload;
      })
      // Nurse fetch
      .addCase(fetchNurseAssignments.pending, state => {
        state.nurse.loading = true; state.nurse.error = null;
      })
      .addCase(fetchNurseAssignments.fulfilled, (state, action) => {
        state.nurse.loading = false; state.nurse.items = action.payload;
      })
      .addCase(fetchNurseAssignments.rejected, (state, action) => {
        state.nurse.loading = false; state.nurse.error = action.payload;
      })
      // Pharmacist fetch
      .addCase(fetchPharmacistAssignments.pending, state => {
        state.pharmacist.loading = true; state.pharmacist.error = null;
      })
      .addCase(fetchPharmacistAssignments.fulfilled, (state, action) => {
        state.pharmacist.loading = false; state.pharmacist.items = action.payload;
      })
      .addCase(fetchPharmacistAssignments.rejected, (state, action) => {
        state.pharmacist.loading = false; state.pharmacist.error = action.payload;
      })
      // LabTech fetch
      .addCase(fetchLabTechAssignments.pending, state => {
        state.labtech.loading = true; state.labtech.error = null;
      })
      .addCase(fetchLabTechAssignments.fulfilled, (state, action) => {
        state.labtech.loading = false; state.labtech.items = action.payload;
      })
      .addCase(fetchLabTechAssignments.rejected, (state, action) => {
        state.labtech.loading = false; state.labtech.error = action.payload;
      });

    // ==== MATCHERS FOR CREATE/UPDATE/DELETE ====

    // Doctor
    builder
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/createDoctor') &&
          action.type.endsWith('/pending'),
        state => { state.doctor.loading = true; }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/createDoctor') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.doctor.loading = false;
          state.doctor.items.push(action.payload);
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/updateDoctor') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.doctor.loading = false;
          const idx = state.doctor.items.findIndex(i => i.id === action.payload.id);
          if (idx !== -1) state.doctor.items[idx] = action.payload;
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/deleteDoctor') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.doctor.loading = false;
          state.doctor.items = state.doctor.items.filter(i => i.id !== action.meta.arg);
        }
      );

    // Nurse
    builder
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/createNurse') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.nurse.loading = false;
          state.nurse.items.push(action.payload);
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/updateNurse') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.nurse.loading = false;
          const idx = state.nurse.items.findIndex(i => i.id === action.payload.id);
          if (idx !== -1) state.nurse.items[idx] = action.payload;
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/deleteNurse') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.nurse.loading = false;
          state.nurse.items = state.nurse.items.filter(i => i.id !== action.meta.arg);
        }
      );

    // Pharmacist
    builder
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/createPharmacist') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.pharmacist.loading = false;
          state.pharmacist.items.push(action.payload);
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/updatePharmacist') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.pharmacist.loading = false;
          const idx = state.pharmacist.items.findIndex(i => i.id === action.payload.id);
          if (idx !== -1) state.pharmacist.items[idx] = action.payload;
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/deletePharmacist') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.pharmacist.loading = false;
          state.pharmacist.items = state.pharmacist.items.filter(i => i.id !== action.meta.arg);
        }
      );

    // LabTech
    builder
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/createLabTech') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.labtech.loading = false;
          state.labtech.items.push(action.payload);
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/updateLabTech') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.labtech.loading = false;
          const idx = state.labtech.items.findIndex(i => i.id === action.payload.id);
          if (idx !== -1) state.labtech.items[idx] = action.payload;
        }
      )
      .addMatcher(
        action =>
          action.type.startsWith('shiftAssignment/deleteLabTech') &&
          action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.labtech.loading = false;
          state.labtech.items = state.labtech.items.filter(i => i.id !== action.meta.arg);
        }
      );
  }
});

export default slice.reducer;
