// essentials/components/Testimonial.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Testimonial = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Trusted by Healthcare Professionals
          </h2>
        </motion.div>

        <motion.div 
          className="bg-white shadow-xl rounded-xl p-8 max-w-3xl mx-auto border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-700 text-lg italic mb-6">
            "This platform has revolutionized how we manage pediatric care. The integration between 
            departments has significantly improved patient outcomes and streamlined our workflows."
          </p>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">
              DR
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-900">Dr. Rebecca Johnson</div>
              <div className="text-gray-500 text-sm">Chief of Pediatrics, Central Children's Hospital</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonial;