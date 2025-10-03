import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Statistics from './components/Statistics';
import Testimonial from './components/Testimonial';
import CallToAction from './components/CallToAction';
import DashboardApp from '../apps/DashboardApp';
import {
  DoctorIcon,
  MedicineIcon,
  NurseIcon,
  LabIcon,
  ParentIcon
} from './components/RoleIcons';

const roles = [
  {
    icon: <DoctorIcon />,
    title: 'For Doctors',
    description: 'Manage patient records and appointments.',
    delay: 0.1
  },
  {
    icon: <NurseIcon />,
    title: 'For Nurses',
    description: 'Coordinate care plans and monitor vitals.',
    delay: 0.2
  },
  {
    icon: <MedicineIcon />,
    title: 'For Pharmacists',
    description: 'Process prescriptions and manage inventory.',
    delay: 0.3
  },
  {
    icon: <LabIcon />,
    title: 'For Lab Technicians',
    description: 'Upload and track diagnostic results.',
    delay: 0.4
  },
  {
    icon: <ParentIcon />,
    title: 'For Parents',
    description: 'Access your child’s health records securely.',
    delay: 0.5
  }
];

const RoleCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    aria-label={title}
  >
    <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-700">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, yoyo: Infinity }}
          className="text-2xl md:text-3xl font-semibold text-blue-600 dark:text-blue-300 animate-pulse"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) return <DashboardApp />;

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <HeroSection />

        {/* Role Cards Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
              Who is this platform for?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {roles.map((role, index) => (
                <RoleCard key={index} {...role} />
              ))}
            </div>
          </div>
        </section>

       
       
        <Footer />
      </div>
    </>
  );
}
