import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
// Import all your create-thunks
import { createAdmissionReportSchedule } from "../store/scheduler/admissionReportScheduleSlice";
import {
  createAppointmentReminderSchedule,
  createDoctorAppointmentReminderSchedule,
} from "../store/scheduler/appointmentReminderScheduleSlice";

import { createParentVaccinationReminderSchedule, createMedicalVaccinationReminderSchedule } from "../store/scheduler/vaccinationReminderScheduleSlice";
import { createVaccinationReportSchedule } from "../store/scheduler/vaccinationReportScheduleSlice";
// import { createLabReportSchedule } from "../store/scheduler/labReportScheduleSlice";
// import { createDoctorShiftSchedule } from "../store/scheduler/doctorShiftScheduleSlice";

const ScheduleTask = () => {
  const dispatch = useDispatch();

  // Form inputs for interval-based tasks
  const [every, setEvery] = useState(1);
  const [period, setPeriod] = useState("minutes");

  // Form inputs for doctor appointment reminder (clocked schedule)
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  const [enabled, setEnabled] = useState(true);

  // Selected task
  const [selectedTask, setSelectedTask] = useState("admission");

  // Define a lookup for thunks by task id
  const thunkLookup = {
    admission: createAdmissionReportSchedule,
    appointment: createAppointmentReminderSchedule,
    vaccination: createVaccinationReportSchedule,
    doctorAppointmentReminder: createDoctorAppointmentReminderSchedule,
    parentVaccinationReminder: createParentVaccinationReminderSchedule,
    medicalVaccinationReminder: createMedicalVaccinationReminderSchedule,
    // lab: createLabReportSchedule,
    // doctor: createDoctorShiftSchedule,
  };

  // Period options for all tasks except appointment and vaccination which restrict to 'days'
  const allPeriodOptions = [
    { value: "seconds", label: "Seconds" },
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
  ];

  const appointmentVaccinationPeriodOptions = [{ value: "days", label: "Days" }];

  // Reset fields based on selected task
  useEffect(() => {
    if (selectedTask === "appointment" || selectedTask === "vaccination") {
      setPeriod("days");
      setEvery(1);
    } else if (selectedTask === "doctorAppointmentReminder") {
      // For doctor reminder, hour and minute default to 0
      setHour(0);
      setMinute(0);
    } else {
      setPeriod("minutes");
      setEvery(1);
    }
  }, [selectedTask]);

  const handleCreateSchedule = () => {
    const thunk = thunkLookup[selectedTask];
    if (!thunk) return;

    if (selectedTask === "doctorAppointmentReminder") {
      // Dispatch with hour, minute, enabled
      dispatch(
        thunk({
          hour,
          minute,
          enabled,
        })
      );
    } else {
      // Dispatch with every, period, enabled
      dispatch(
        thunk({
          every,
          period,
          enabled,
        })
      );
    }
  };

  // Choose period options based on selectedTask
  const periodOptions =
    selectedTask === "appointment" || selectedTask === "vaccination"
      ? appointmentVaccinationPeriodOptions
      : allPeriodOptions;

  return (
    <div className="p-4 border rounded shadow-md bg-white space-y-4">
      <h2 className="text-xl font-bold">Create a Schedule</h2>

      {/* Task selection */}
      <div>
        <label className="block mb-1 font-medium">Task:</label>
        <select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="admission">Admission Report Schedule</option>
          <option value="appointment">Appointment Reminder Schedule</option>
          <option value="vaccination">Vaccination Report Schedule</option>
          <option value="parentVaccinationReminder">
            Parent Vaccination Reminder Schedule
          </option>
          <option value="medicalVaccinationReminder">
            Medical Vaccination Reminder Schedule
          </option>
          <option value="doctorAppointmentReminder">
            Doctor Appointment Reminder Schedule
          </option>
          {/* <option value="lab">Lab Report Schedule</option> */}
          {/* <option value="doctor">Doctor Shift Schedule</option> */}
        </select>
      </div>

      {/* Conditionally render inputs based on selected task */}

      {/* Interval-based scheduling inputs */}
      {selectedTask !== "doctorAppointmentReminder" && (
        <>
          <div>
            <label className="block mb-1 font-medium">Every:</label>
            <input
              type="number"
              value={every}
              onChange={(e) => setEvery(Number(e.target.value))}
              min={1}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border p-2 rounded w-full"
              disabled={selectedTask === "appointment" || selectedTask === "vaccination"} // disable if only one option
            >
              {periodOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Clocked schedule inputs for doctor appointment reminder */}
      {selectedTask === "doctorAppointmentReminder" && (
        <>
          <div>
            <label className="block mb-1 font-medium">Hour (0-23):</label>
            <input
              type="number"
              value={hour}
              onChange={(e) =>
                setHour(Math.min(23, Math.max(0, Number(e.target.value))))
              }
              min={0}
              max={23}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Minute (0-59):</label>
            <input
              type="number"
              value={minute}
              onChange={(e) =>
                setMinute(Math.min(59, Math.max(0, Number(e.target.value))))
              }
              min={0}
              max={59}
              className="border p-2 rounded w-full"
            />
          </div>
        </>
      )}

      <div className="flex items-center space-x-2">
        <input
          id="enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <label htmlFor="enabled">Enabled</label>
      </div>

      {/* Dispatch */}
      <button
        onClick={handleCreateSchedule}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Schedule
      </button>
    </div>
  );
};

export default ScheduleTask;
