// src/essentials/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div
      className="relative py-20 text-center bg-cover bg-center"
      style={{ backgroundImage: "url('/api/placeholder/1200/600')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80" />
      <motion.div
        className="relative max-w-3xl mx-auto px-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to Pediatric Hospital Management System</h1>
        <p className="text-lg md:text-xl mb-8">
          A hospital management system built for pediatric care.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth/login">
            <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-3 bg-blue-600 rounded-lg text-white font-medium">
              Get Started
            </motion.button>
          </Link>
          <Link to="/about">
            <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-3 border-2 border-white rounded-lg text-white font-medium">
              Learn More
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
