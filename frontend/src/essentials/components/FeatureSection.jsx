// essentials/components/FeatureSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import RoleCard from './RoleCard';
import { DoctorIcon, NurseIcon, MedicineIcon, LabIcon, ParentIcon, SecurityIcon } from './icons/RoleIcons';

const FeatureSection = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Designed for Everyone in Pediatric Care
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform connects all stakeholders in pediatric healthcare to streamline communication, 
            enhance patient care, and improve health outcomes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <RoleCard
            icon={<DoctorIcon />}
            title="For Doctors"
            description="Access patient records, schedule appointments, and communicate with other healthcare providers seamlessly."
            delay={0.1}
          />
          <RoleCard
            icon={<NurseIcon />}
            title="For Nurses"
            description="Manage patient care plans, track vital signs, and coordinate with the healthcare team efficiently."
            delay={0.2}
          />
          <RoleCard
            icon={<MedicineIcon />}
            title="For Pharmacists"
            description="Process prescriptions, manage medication inventory, and provide medication guidance to patients."
            delay={0.3}
          />
          <RoleCard
            icon={<LabIcon />}
            title="For Lab Technicians"
            description="Record test results, manage lab orders, and share diagnostic information with the care team."
            delay={0.4}
          />
          <RoleCard
            icon={<ParentIcon />}
            title="For Parents"
            description="View your child's health records, communicate with doctors, and schedule appointments online."
            delay={0.5}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white"
          >
            <SecurityIcon />
            <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-blue-100">Built with the highest security standards and full compliance with healthcare regulations.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;