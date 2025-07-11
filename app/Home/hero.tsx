'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <section 
      className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
      id="hero"
    >
      {/* Background pattern (optional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[120%] h-[120%] opacity-5">
          <svg viewBox="0 0 1200 1200" className="w-full h-full">
            <pattern id="pattern-hex" width="50" height="50" patternUnits="userSpaceOnUse">
              <polygon points="25,0 50,15 50,40 25,55 0,40 0,15" className="fill-blue-600" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern-hex)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Text Content */}
          <motion.div variants={fadeInUp}>
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
              variants={fadeInUp}
            >
              Find, Join or Host{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Soccer Games</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-blue-100/70 -z-0" style={{ bottom: '10%' }} />
              </span>{' '}
              Easily
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed"
              variants={fadeInUp}
            >
              SoccerZone connects footballers and organizers, making it super easy to discover games,
              collect payments, and manage events — all in one place.
            </motion.p>
            
            <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeInUp}>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-full text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-lg hover:shadow-blue-500/20"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard/browse-events"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3.5 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Browse Events
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg aspect-square">
              <Image
                src="/images/soccer.png"
                alt="Illustration of soccer players celebrating a goal"
                fill
                className="object-contain"
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;