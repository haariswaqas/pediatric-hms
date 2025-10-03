// essentials/components/Statistics.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Statistics = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-500 to-indigo-600">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-4xl font-bold text-white mb-2">1000+</div>
            <div className="text-blue-100">Healthcare Providers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-4xl font-bold text-white mb-2">50k+</div>
            <div className="text-blue-100">Patients Served</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-blue-100">System Uptime</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-100">Support Available</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;