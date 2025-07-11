'use client';

import { motion, easeOut } from 'framer-motion';
import Link from 'next/link';

const CoreFeatures = () => {
  const features = [
    {
      icon: '💸',
      title: 'Split Payments',
      description: 'Payments are automatically split — 80% to the organizer, 20% to the platform.',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100',
    },
    {
      icon: '🎫',
      title: 'Digital Tickets',
      description: 'Players get QR-based digital passes instantly after payment.',
      color: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100',
    },
    {
      icon: '🛡️',
      title: 'Player Verification',
      description: 'Event hosts can scan or manually verify each participant on arrival.',
      color: 'text-green-600',
      gradient: 'from-green-50 to-green-100',
    },
    {
      icon: '📊',
      title: 'Event Dashboard',
      description: 'Organizers get a dashboard to manage events, track payments, and check-in players.',
      color: 'text-orange-600',
      gradient: 'from-orange-50 to-orange-100',
    },
    {
      icon: '🗓️',
      title: 'Booking & Scheduling',
      description: 'Players can browse by date, time, or location — everything is structured.',
      color: 'text-red-600',
      gradient: 'from-red-50 to-red-100',
    },
    {
      icon: '📜',
      title: 'Match History',
      description: 'Players build a personal match record — like a football resume.',
      color: 'text-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Football field background */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-green-500/10 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border-2 border-green-500/10 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="inline-block px-4 py-2 mb-4 text-sm font-medium rounded-full bg-blue-100 text-blue-800 shadow-sm"
            whileHover={{ scale: 1.05 }}
          >
            Powerful Features
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Core <span className="text-blue-600">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to host or join a football event — structured, simple, and secure.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 shadow-lg group`}
            >
              <div className="relative h-full bg-white rounded-[15px] p-8">
                <div className="flex items-start space-x-4">
                  <div className={`text-4xl ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${feature.color} mb-2`}>{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ⚽
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-500 p-0.5 shadow-2xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl"></div>
            <div className="relative bg-white rounded-[22px] p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Ready to experience the future of football organization?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of players and organizers already using SoccerZone.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link href="/signin">
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/30 cursor-pointer text-center"
  >
    Sign Up Free
  </motion.div>
</Link>
                
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoreFeatures;