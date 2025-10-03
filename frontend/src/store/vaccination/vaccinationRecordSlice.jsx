// src/store/appointments/vaccinationRecordSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import VaccinationRecordService from '../../services/vaccination/VaccinationRecordService';
import { clearSelectedVaccine } from './vaccineSlice';

export const fetchVaccinationRecords = createAsyncThunk(
    'vaccinationRecord/fetchVaccinationRecords',
    async(_, {getState, rejectWithValue}) => {
        
        try {
            const token = getState().auth.access;
            const response = await VaccinationRecordService.fetchVaccinationRecords(token);
return response;
        } catch(error) {
return rejectWithValue(error.message);
        }
    }
);

export const fetchVaccinationRecordById = createAsyncThunk(
    'vaccinationRecord/fetchVaccinationRecordById', 
    async(vaccinationRecordId, {getState, rejectWithValue}) => {
       
        try { const token = getState().auth.access;
const response = await VaccinationRecordService.fetchVaccinationRecordById(vaccinationRecordId, token)
return response;        
} catch (error) {
return rejectWithValue(error.message)
        }
    }
)

export const fetchChildren = createAsyncThunk(
    'vaccinationRecord/fetchChildren',
    async(_, {getState, rejectWithValue}) => {
        
     try {const token = getState().auth.access;
const response = await  VaccinationRecordService.fetchChildren(token)
return response
     }  catch(error) {
        return rejectWithValue(error.message);


     } 
    }
);

export const fetchVaccines = createAsyncThunk(
    'vaccinationRecord/fetchVaccines',
    async(_, {getState, rejectWithValue}) =>
    {
        
        try {
            const token = getState().auth.access;
const response = await VaccinationRecordService.fetchVaccines(token)
return response
        } catch(error) {
            return rejectWithValue(error.message)
        }
    }
);

export const deleteVaccinationRecord = createAsyncThunk(
    'vaccinationRecord/deleteVaccinationRecord',
    async(vaccinationRecordId, {getState, rejectWithValue}) => {
      
        try { 
            const token = getState().auth.access;
           await VaccinationRecordService.deleteVaccinationRecord(vaccinationRecordId, token);
           return vaccinationRecordId;
        } catch(error) {
            return rejectWithValue(error.message);
        }
    }

);

export const createVaccinationRecord = createAsyncThunk(
    'vaccinationRecord/createVaccinationRecord', 
    async(vaccinationRecordData, {getState, rejectWithValue}) => {
        
        try {
            const token = getState().auth.access;
            const response = await VaccinationRecordService.createVaccinationRecord(vaccinationRecordData, token);
            return response;
        } catch(error){ 
            return rejectWithValue(error.message)

        }
    }
)

export const updateVaccinationRecord = createAsyncThunk(
    'vaccinationRecord/updateVaccinationRecord',
    async({ vaccinationRecordId, updatedData }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.access;
            const response = await VaccinationRecordService.updateVaccinationRecord(vaccinationRecordId, updatedData, token);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const vaccinationRecordSlice = createSlice({
    name: 'vaccinationRecord',
    initialState: {
        vaccinationRecords: [],
        children: [],
        vaccines: [],
        selectedVaccinationRecord: null,
        //searchResults = []

        loading: false, 
        error: null,
    },

    reducers: {
        clearSelectedVaccinationRecord: (state) => {
            state.selectedVaccinationRecord = null;
            state.error = null;
        }, 
        clearVaccinationRecordError: (state) => {
            state.error = null;
        },

        //clearSearchResults: (state) => {
          //  state.searchResults = [];
          //},
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchVaccinationRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVaccinationRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccinationRecords = action.payload;
            })
            .addCase(fetchVaccinationRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

// continue the remaining 

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
            } )

            .addCase(fetchVaccines.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVaccines.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccines = action.payload;
            })
            .addCase(fetchVaccines.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createVaccinationRecord.pending, (state) => {
                state.loading = true; 
                state.error = null;
            })
            .addCase(createVaccinationRecord.fulfilled, (state, action) => {
                state.loading = false; 
                state.vaccinationRecords.push(action.payload);
            })
            .addCase(createVaccinationRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchVaccinationRecordById.pending, (state) => {
                state.loading = true; 
                state.error = null;
            })
            .addCase(fetchVaccinationRecordById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVaccinationRecord = action.payload;
            }) 
            .addCase(fetchVaccinationRecordById.rejected, (state, action) => {
                state.loading = false; 
                state.error = action.payload;
            })

            .addCase(updateVaccinationRecord.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVaccinationRecord.fulfilled, (state, action) =>{ 
                state.loading = false; 
                const idx = state.vaccinationRecords.findIndex(a => a.id === action.payload.id);
                if (idx !== -1) state.vaccinationRecords[idx] = action.payload;
            })
            .addCase(updateVaccinationRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteVaccinationRecord.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVaccinationRecord.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;

            })

            .addCase(deleteVaccinationRecord.fulfilled, (state, action) => {
                state.loading = false;
                state.vaccinationRecords = state.vaccinationRecords.filter(a => a.id !== action.payload);
            });


    },
})

export const {clearSelectedVaccinationRecord, clearVaccinationRecordError} = vaccinationRecordSlice.actions
export default vaccinationRecordSlice.reducer;