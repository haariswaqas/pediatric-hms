import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdmissionReportSchedule } from '../store/scheduler/admissionReportScheduleSlice';
import { fetchAppointmentReminderSchedule, fetchDoctorAppointmentReminderSchedule } from '../store/scheduler/appointmentReminderScheduleSlice';
import { fetchVaccinationReportSchedule } from '../store/scheduler/vaccinationReportScheduleSlice';
import { fetchParentVaccinationReminderSchedule, fetchMedicalVaccinationReminderSchedule } from '../store/scheduler/vaccinationReminderScheduleSlice';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Bell, 
  Shield, 
  Stethoscope, 
  Users, 
  Plus, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
  Syringe,
  UserPlus,
  Heart
} from 'lucide-react';

const ScheduledTasksList = () => {
  const dispatch = useDispatch();

  // Admission report selectors
  const admissionSchedule = useSelector(
    (state) => state.admissionReportSchedule.admissionReportSchedule
  );
  const admissionLoading = useSelector(
    (state) => state.admissionReportSchedule.loading
  );
  const admissionError = useSelector(
    (state) => state.admissionReportSchedule.error
  );

  // Vaccination report selectors
  const vaccinationSchedule = useSelector(
    (state) => state.vaccinationReportSchedule.vaccinationReportSchedule
  );
  const vaccinationLoading = useSelector(
    (state) => state.vaccinationReportSchedule.loading
  );
  const vaccinationError = useSelector(
    (state) => state.vaccinationReportSchedule.error
  );

  // Appointment reminder selectors
  const appointmentReminderSchedule = useSelector(
    (state) => state.appointmentReminderSchedule.appointmentReminderSchedule
  );
  const appointmentReminderLoading = useSelector(
    (state) => state.appointmentReminderSchedule.loading
  );
  const appointmentReminderError = useSelector(
    (state) => state.appointmentReminderSchedule.error
  );

  // Doctor appointment reminder selectors
  const doctorAppointmentReminderSchedule = useSelector(
    (state) => state.appointmentReminderSchedule.doctorAppointmentReminderSchedule
  );
  const doctorAppointmentLoading = useSelector(
    (state) => state.appointmentReminderSchedule.doctorLoading
  );
  const doctorAppointmentError = useSelector(
    (state) => state.appointmentReminderSchedule.doctorError
  );

  // Parent vaccination reminder selectors
  const parentVaccinationReminderSchedule = useSelector(
    (state) => state.vaccinationReminderSchedule.parentVaccinationReminderSchedule
  );
  const parentVaccinationLoading = useSelector(
    (state) => state.vaccinationReminderSchedule.parentLoading
  );
  const parentVaccinationError = useSelector(
    (state) => state.vaccinationReminderSchedule.parentError
  );

  // Medical vaccination reminder selectors
  const medicalVaccinationReminderSchedule = useSelector(
    (state) => state.vaccinationReminderSchedule.medicalVaccinationReminderSchedule
  );
  const medicalVaccinationLoading = useSelector(
    (state) => state.vaccinationReminderSchedule.medicalLoading
  );
  const medicalVaccinationError = useSelector(
    (state) => state.vaccinationReminderSchedule.medicalError
  );

  useEffect(() => {
    dispatch(fetchAdmissionReportSchedule());
    dispatch(fetchVaccinationReportSchedule());
    dispatch(fetchAppointmentReminderSchedule());
    dispatch(fetchDoctorAppointmentReminderSchedule());
    dispatch(fetchParentVaccinationReminderSchedule());
    dispatch(fetchMedicalVaccinationReminderSchedule());
  }, [dispatch]);

  const scheduledTasks = [
    {
      id: 'admission',
      title: 'Admission Report Schedule',
      description: 'Automated reports for patient admissions',
      icon: ClipboardList,
      color: 'blue',
      data: admissionSchedule,
      loading: admissionLoading,
      error: admissionError,
    },
    {
      id: 'vaccination',
      title: 'Vaccination Report Schedule',
      description: 'Periodic vaccination status reports',
      icon: Syringe,
      color: 'green',
      data: vaccinationSchedule,
      loading: vaccinationLoading,
      error: vaccinationError,
    },
    {
      id: 'appointment',
      title: 'Appointment Reminder Schedule',
      description: 'Patient appointment notifications',
      icon: Bell,
      color: 'purple',
      data: appointmentReminderSchedule,
      loading: appointmentReminderLoading,
      error: appointmentReminderError,
    },
    {
      id: 'doctorAppointmentReminder',
      title: 'Doctor Appointment Reminder Schedule',
      description: 'Doctor-specific appointment alerts',
      icon: Stethoscope,
      color: 'teal',
      data: doctorAppointmentReminderSchedule,
      loading: doctorAppointmentLoading,
      error: doctorAppointmentError,
    },
    {
      id: 'parentVaccinationReminder',
      title: 'Parent Vaccination Reminder Schedule',
      description: 'Vaccination reminders for parents',
      icon: Users,
      color: 'orange',
      data: parentVaccinationReminderSchedule,
      loading: parentVaccinationLoading,
      error: parentVaccinationError,
    },
    {
      id: 'medicalVaccinationReminder',
      title: 'Medical Vaccination Reminder Schedule',
      description: 'Internal vaccination tracking alerts',
      icon: Heart,
      color: 'red',
      data: medicalVaccinationReminderSchedule,
      loading: medicalVaccinationLoading,
      error: medicalVaccinationError,
    },
  ];

  const noDataMessages = {
    appointment: "No appointment reminder schedule set yet.",
    vaccination: "No vaccination report schedule set yet.",
    parentVaccinationReminder: "No parent vaccination reminder schedule set yet.",
    medicalVaccinationReminder: "No medical vaccination reminder schedule set yet.",
    doctorAppointmentReminder: "No doctor appointment reminder schedule set yet.",
    admission: "No admission report schedule set yet.",
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        accent: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        accent: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        accent: 'bg-purple-600'
      },
      teal: {
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        accent: 'bg-teal-600'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        accent: 'bg-orange-600'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        accent: 'bg-red-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const getStatusBadge = (enabled) => {
    if (enabled) {
      return (
        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
          <CheckCircle className="w-3 h-3" />
          <span>Active</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600">
          <XCircle className="w-3 h-3" />
          <span>Inactive</span>
        </div>
      );
    }
  };

  const formatScheduleInfo = (task) => {
    if (task.id === 'doctorAppointmentReminder') {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
            </div>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg font-mono">
              {String(task.data.hour).padStart(2, '0')}:{String(task.data.minute).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {getStatusBadge(task.data.enabled)}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Every:</span>
              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                {task.data.every}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</span>
              <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded capitalize">
                {task.data.period}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {getStatusBadge(task.data.enabled)}
          </div>
        </div>
      );
    }
  };

  const renderTaskCard = (task) => {
    const Icon = task.icon;
    const colorClasses = getColorClasses(task.color);

    return (
      <div key={task.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.border} border`}>
                <Icon className={`w-6 h-6 ${colorClasses.text}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {task.description}
                </p>
              </div>
            </div>
            
            {/* Quick status indicator */}
            {task.data && !task.loading && !task.error && (
              <div className={`w-3 h-3 rounded-full ${task.data.enabled ? 'bg-green-500' : 'bg-gray-400'}`} 
                   title={task.data.enabled ? 'Active' : 'Inactive'} />
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {task.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-slate-600 dark:text-slate-400">Loading schedule...</span>
              </div>
            </div>
          ) : task.error ? (
            <div className="space-y-4">
              {(task.error.toLowerCase().includes('not found') || task.error.toLowerCase().includes('no data')) ? (
                <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-slate-500" />
                  <p className="text-slate-600 dark:text-slate-400 italic">
                    {noDataMessages[task.id] || "No schedule is set."}
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-400">
                    <span className="font-medium">Error:</span> {task.error}
                  </p>
                </div>
              )}
              
              <Link to="/schedules/create" className="block">
                <button className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${colorClasses.text} border-2 ${colorClasses.border} rounded-xl hover:${colorClasses.bg} transition-all duration-200 font-medium`}>
                  <Plus className="w-4 h-4" />
                  <span>Create Schedule</span>
                </button>
              </Link>
            </div>
          ) : task.data ? (
            <div className="space-y-4">
              {formatScheduleInfo(task)}
              
            
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-slate-500" />
                <p className="text-slate-600 dark:text-slate-400 italic">
                  {noDataMessages[task.id] || "No schedule is set."}
                </p>
              </div>
              
              <Link to="/schedules/create" className="block">
                <button className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${colorClasses.text} border-2 ${colorClasses.border} rounded-xl hover:${colorClasses.bg} transition-all duration-200 font-medium`}>
                  <Plus className="w-4 h-4" />
                  <span>Create Schedule</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title and Description */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Scheduled Tasks
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Manage automated system schedules and notifications
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Tasks: <span className="font-semibold text-slate-900 dark:text-white">{scheduledTasks.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Active: <span className="font-semibold text-slate-900 dark:text-white">
                      {scheduledTasks.filter(task => task.data?.enabled).length}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Create Schedule Button */}
            <div>
              <Link to="/schedules/create">
                <button className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/25">
                  <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Create New Schedule
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scheduledTasks.map(renderTaskCard)}
        </div>

        {/* Footer Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">Note:</span> 
                Scheduled tasks run automatically in the background. Make sure to configure them properly to avoid missed notifications or reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledTasksList;