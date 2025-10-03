import React from 'react';
import {
  Home,
  Users,Activity, FlaskConical,
  ShieldCheck,
  CalendarCheck,
  UserCheck,
  Syringe,
  Pill,
  Package,
  ClipboardList,
  Bed,
  Clock,
  CalendarClock,
  FileText,
  BarChart,
  TrendingUp,
  Calendar,
  PlusCircle,
  Stethoscope, CheckCircle,
  Microscope,
  Beaker,
  Database,
  Plus,
  List,
  HeartPulse
} from 'lucide-react';

export const adminItems = [
  {
    label: 'General',
    icon: <Home />,
    items: [
      { to: '/home/dashboard', label: 'Dashboard', icon: <Home /> },
      { to: '/users/view-all', label: 'Users', icon: <Users /> },
      { to: '/role-management', label: 'Roles & Permissions', icon: <ShieldCheck /> }
    ]
  },
  {
    label: 'Clinical',
    icon: <UserCheck />,
    items: [
      { to: '/appointments', label: 'Appointments', icon: <CalendarCheck /> },
      { to: '/children', label: 'Patients', icon: <Users /> },
      { to: '/admissions', label: 'View Admissions', icon: <List /> },
      { to: '/vaccines/vaccination-records', label: 'Vaccinations', icon: <Syringe /> }
    ]
  },
  {
    label: 'Pharmacy',
    icon: <Pill />,
    items: [
      { to: '/drugs', label: 'Drugs', icon: <Pill /> },
      { to: '/drugs/drug-dispenses', label: 'Drug Dispenses', icon: <Package /> },
      { to: '/prescriptions/items', label: 'Prescriptions', icon: <ClipboardList /> }
    ]
  },
  {
    label: 'Hospital',
    icon: <Bed />,
    items: [
      { to: '/wards', label: 'Wards & Beds', icon: <Bed /> },
      { to: '/shifts', label: 'Shifts', icon: <Clock /> },
      { to: '/billing/bill-items', label: 'View Bills', icon: <FileText /> },
      { to: '/billing/payments', label: 'Payments', icon: <Syringe /> },
      { to: '/shifts/assignments', label: 'All Shift Assignments', icon: <CalendarClock /> }
    ]
  },
  {
    label: 'System',
    icon: <FileText />,
    items: [
      { to: '/logging/system-logs', label: 'System Logs', icon: <FileText /> },
      { to: '/reports', label: 'Reports', icon: <BarChart /> }
    ]
  },
  {
    label: 'System Analytics',
    icon: <TrendingUp />,
    items: [
      { to: '/logging/log-analytics', label: 'System Analytics', icon: <TrendingUp /> },
      { to: '/users/user-analytics', label: 'User Analytics', icon: <Users /> }
    ]
  }, 
// for this part, no drop-dwon
  {
    label: 'Lab Management',
    icon: <Beaker />,
    items: [
      { to: '/labs', label: 'Lab Tests', icon: <Beaker /> },
      { to: '/labs/lab-request-items', label: 'Lab Request Items', icon: <ClipboardList /> },
      { to: '/labs/lab-results', label: 'Lab Results', icon: <CheckCircle /> },
      { to: '/labs/lab-result-parameters', label: 'Lab Result Parameters', icon: <Database /> },

    ]
  },

];

export const doctorItems = [
  {
    label: 'Admissions',
    icon: <UserCheck />,
    items: [
      { to: '/admissions/add', label: 'Admit Patient', icon: <PlusCircle /> },
      { to: '/admissions', label: 'View Admissions', icon: <List /> },
      { to: '/admissions/vital-histories', label: 'View Patient Vitals', icon: <HeartPulse /> }
    ]
  },
  {
    label: 'Appointments',
    icon: <Calendar />,
    items: [
      { to: '/appointments', label: 'View Appointments', icon: <Calendar /> },
      { to: '/appointments/add', label: 'Schedule Appointments', icon: <CalendarClock /> }
    ]
  },
  {
    label: 'Patients & Diagnosis',
    icon: <Users />,
    items: [
      { to: '/children', label: 'Manage Patients', icon: <UserCheck /> },
      { to: '/diagnosis', label: 'Diagnosis', icon: <Stethoscope /> }
    ]
  },
  {
    label: 'Prescriptions',
    icon: <ClipboardList />,
    items: [
      { to: '/prescriptions/add', label: 'Add Prescription', icon: <PlusCircle /> },
      { to: '/prescriptions/items', label: 'View Prescriptions', icon: <ClipboardList /> }
    ]
  },
  {
    label: 'Vaccinations',
    icon: <Syringe />,
    items: [
      { to: '/vaccines/vaccination-records', label: 'Records', icon: <ClipboardList /> },
      { to: '/vaccines/vaccination-records/add', label: 'Schedule', icon: <PlusCircle /> }
    ]
  },
  {
    label: 'Lab',
    icon: <Microscope />,
    items: [
      { to: '/labs/lab-request-items', label: 'Lab Requests', icon: <Microscope /> },
      { to: '/labs/add-lab-request', label: 'Add Lab Request', icon: <Plus /> }
    ]
  },
  {
    label: 'Reports',
    icon: <BarChart />,
    items: [
      { to: '/reports', label: 'Patient Reports', icon: <BarChart /> }
    ]
  }
];

export const nurseItems = [
  {
    label: 'Admissions',
    icon: <UserCheck />,
    items: [
      { to: '/admissions/add', label: 'Admit Patient', icon: <PlusCircle /> },
      { to: '/admissions', label: 'View Admissions', icon: <List /> },
      { to: '/admissions/add-vitals', label: 'Record Vitals', icon: <HeartPulse /> },
      { to: '/admissions/vital-histories', label: 'View Patient Vitals', icon: <Activity /> }
    ]
  },
  {
    label: 'Appointments',
    icon: <Calendar />,
    items: [
      { to: '/appointments', label: "Today's Appointments", icon: <CalendarCheck /> }
    ]
  },
  {
    label: 'Patients',
    icon: <Users />,
    items: [
      { to: '/children', label: 'View Patients', icon: <Users /> }
    ]
  },
  {
    label: 'Vaccinations',
    icon: <Syringe />,
    items: [
      { to: '/vaccines/vaccination-records', label: 'Vaccination Records', icon: <ClipboardList /> }
    ]
  },
  {
    label: 'Prescriptions',
    icon: <ClipboardList />,
    items: [
      { to: '/prescriptions/items', label: 'View Prescriptions', icon: <ClipboardList /> }
    ]
  },
  {
    label: 'Lab',
    icon: <Microscope />,
    items: [
      { to: '/labs/lab-request-items', label: 'Lab Requests', icon: <FlaskConical /> },
      { to: '/labs/lab-result-parameters', label: 'Lab Results', icon: <Microscope /> }
    ]
  },
  {
    label: 'Reports',
    icon: <BarChart />,
    items: [
      { to: '/reports', label: 'Reports', icon: <FileText /> }
    ]
  }
];


export const labTechItems = [
  {
    label: 'Lab Tests',
    icon: <Beaker />,
    items: [
      { to: '/labs', label: 'Lab Tests', icon: <Beaker /> },
      { to: '/labs/add', label: 'Add Lab Test', icon: <PlusCircle /> }
    ]
  },
  {
    label: 'Lab Request Items',
    icon: <ClipboardList />,
    items: [
      { to: '/labs/lab-request-items', label: 'Lab Request Items', icon: <ClipboardList /> }
    ]
  },
  {
    label: 'Lab Results',
    icon: <CheckCircle />,
    items: [
      { to: '/labs/lab-results', label: 'Lab Results', icon: <CheckCircle /> },
      { to: '/labs/add-lab-result', label: 'Add Lab Result', icon: <PlusCircle /> }
    ]
  },
  {
    label: 'Lab Result Parameters',
    icon: <Database />,
    items: [
      { to: '/labs/lab-result-parameters', label: 'Lab Result Parameters', icon: <Database /> },
      { to: '/labs/add-lab-result-parameter', label: 'Add Lab Result Parameter', icon: <PlusCircle /> }
    ]
  },
  {
    label: 'Reports',
    icon: <BarChart />,
    items: [
      { to: '/reports', label: 'Patient Reports', icon: <BarChart /> }
    ]
  }
];

export const parentItems = [
  {
    label: 'Chatbot',
    icon: <UserCheck />,
    items: [
      { to: '/chatbot/chat', label: 'Chat', icon: <UserCheck /> }
    ]
  },

  {
    label: 'My Children',
    icon: <UserCheck />,
    items: [
      { to: '/children', label: 'Chat', icon: <UserCheck /> }
    ]
  },
  {
    label: 'Appointments',
    icon: <UserCheck />,
    items: [
      { to: '/appointments', label: 'Chat', icon: <UserCheck /> }
    ]
  },
  {
    label: 'Vaccination Records',
    icon: <UserCheck />,
    items: [
      { to: '/appointments', label: 'Chat', icon: <UserCheck /> }
    ]
  }
];