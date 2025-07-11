'use client';

import { motion } from 'framer-motion';
import { FaHardHat, FaTools, FaClock } from 'react-icons/fa';

export default function ComingSoon() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <motion.div
        animate={{
          y: [-5, 5, -5],
          rotate: [0, 2, -2, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8 text-6xl text-yellow-500"
      >
        <FaHardHat />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
      >
        Coming Soon
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-gray-600 max-w-lg mb-8"
      >
        We're hard at work building something amazing for you! This feature is currently under construction and will be available soon.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4 max-w-md"
      >
        <div className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
          <FaTools className="text-blue-500 mr-2" />
          <span className="text-gray-700">In Development</span>
        </div>
        
        <div className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
          <FaClock className="text-purple-500 mr-2" />
          <span className="text-gray-700">Launching Shortly</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-sm text-gray-500 flex items-center"
      >
        <span className="animate-pulse mr-2">•</span>
        Stay tuned for updates
        <span className="animate-pulse ml-2">•</span>
      </motion.div>
    </motion.div>
  );
}