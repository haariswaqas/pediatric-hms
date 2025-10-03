import React from 'react';
import { User, Stethoscope, FlaskConical, Baby, Pill, Shield} from 'lucide-react';

export const roleConfig = {
    parent: { 
      title: 'Parent', 
      icon: <Baby size={20} />, 
      bg: 'bg-purple-100', 
      text: 'text-purple-600', 
      hover: 'hover:bg-purple-200',
      gradient: 'from-purple-300/70 to-purple-400/60',
      cardBg: 'bg-white/95',
      textColor: 'text-gray-800'
    },
    doctor: { 
      title: 'Doctor', 
      icon: <Stethoscope size={20} />, 
      bg: 'bg-blue-100', 
      text: 'text-blue-600', 
      hover: 'hover:bg-blue-200',
      gradient: 'from-blue-300/70 to-blue-400/60',
      cardBg: 'bg-white/95',
      textColor: 'text-gray-800'
    },
    nurse: { 
      title: 'Nurse', 
      icon: <User size={20} />, 
      bg: 'bg-green-100', 
      text: 'text-green-600', 
      hover: 'hover:bg-green-200',
      gradient: 'from-green-300/70 to-green-400/60',
      cardBg: 'bg-white/95',
      textColor: 'text-gray-800'
    },
    pharmacist: { 
      title: 'Pharmacist', 
      icon: <Pill size={20} />, 
      bg: 'bg-orange-100', 
      text: 'text-orange-600', 
      hover: 'hover:bg-orange-200',
      gradient: 'from-orange-300/70 to-orange-400/60',
      cardBg: 'bg-white/95',
      textColor: 'text-gray-800'
    },
    lab_tech: { 
      title: 'Lab Tech', 
      icon: <FlaskConical size={20} />, 
      bg: 'bg-red-100', 
      text: 'text-red-600', 
      hover: 'hover:bg-red-200',
      gradient: 'from-red-300/70 to-red-400/60',
      cardBg: 'bg-white/95',
      textColor: 'text-gray-800'
    },
    admin: { 
      title: 'Admin', 
      icon: <Shield size={20} />, 
      bg: 'bg-gray-800', 
      text: 'text-white', 
      hover: 'hover:bg-gray-700',
      gradient: 'from-gray-800/80 to-gray-900/70',
      cardBg: 'bg-gray-900/95',
      textColor: 'text-white'
    },
  };
  