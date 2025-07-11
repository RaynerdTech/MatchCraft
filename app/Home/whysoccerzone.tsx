'use client';

import { motion } from 'framer-motion';
import {
  XCircle,
  CheckCircle2,
  Users,
  QrCode,
  Wallet,
  MapPin,
  ShieldCheck,
  History,
  ChevronRight
} from 'lucide-react';
import React from 'react';

// A custom component for the gradient border hover effect
const BentoCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className={`relative p-0.5 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 via-transparent to-transparent group ${className}`}
  >
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="bg-white/60 backdrop-blur-lg rounded-[15px] h-full w-full p-6">
      {children}
    </div>
  </motion.div>
);

const WhySoccerZone = () => {
  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const problems = [
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Difficulty finding where to play" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "No easy way to book or join matches" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Frustration organizing games — players bail, payments are messy" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Just WhatsApp groups and word of mouth — no structure" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "No proof of participation — no tickets, no history" }
  ];

  const solutions = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Discover & Join",
      description: "Find and join football events happening near you in just a few taps.",
      colSpan: 'lg:col-span-2'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Organize with Ease",
      description: "Create, manage, and promote your own matches effortlessly.",
      colSpan: 'lg:col-span-1'
    },
    {
      icon: <Wallet className="w-8 h-8 text-blue-600" />,
      title: "Automated Payments",
      description: "Secure online payments with automated splits for organizers.",
      colSpan: 'lg:col-span-1'
    },
    {
      icon: <QrCode className="w-8 h-8 text-blue-600" />,
      title: "Digital Tickets",
      description: "Get digital tickets with QR codes for seamless check-ins.",
      colSpan: 'lg:col-span-1'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      title: "Verified Players",
      description: "Track attendance and build a community of reliable players.",
      colSpan: 'lg:col-span-1'
    },
    {
      icon: <History className="w-8 h-8 text-blue-600" />,
      title: "Build Your Match History",
      description: "Keep a permanent record of every game you play.",
      colSpan: 'lg:col-span-2'
    },
  ];

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
      {/* Immersive Aurora Background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-green-200 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeIn} className="mb-4">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              Our Mission
            </span>
          </motion.div>
          
          <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            From Chaos to Community.
          </motion.h2>
          
          <motion.p variants={fadeIn} className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
            We saw the passion for football in Nigeria getting lost in disorganization. 
            <span className="text-blue-600 font-semibold"> SoccerZone</span> is our answer.
          </motion.p>
        </motion.div>

        {/* Main Grid: Sticky Narrative + Scrolling Solutions */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start">
          
          {/* Left Column (Sticky) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-2 lg:sticky lg:top-24 space-y-8"
          >
            {/* The Problems */}
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200/80">
              <h3 className="text-xl font-bold text-gray-800 mb-4">The Common Headaches</h3>
              <ul className="space-y-3">
                {problems.map((problem, index) => (
                  <motion.li key={index} variants={fadeIn} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{problem.icon}</div>
                    <span className="text-gray-700">{problem.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Founder's Quote */}
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200/80">
               <p className="text-gray-700 leading-relaxed italic">
                 "As a developer and footballer, I lived these frustrations. I built <strong className="text-blue-600 not-italic font-semibold">SoccerZone</strong> to bring the <strong className="text-blue-600 not-italic font-semibold">structure, trust, and ease</strong> our beautiful game deserves."
               </p>
               <div className="mt-4 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                   AR
                 </div>
                 <div>
                  <p className="font-semibold text-gray-900">Abdulrahmon</p>
                  <p className="text-sm text-gray-500">Founder of SoccerZone</p>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Right Column (Solutions Bento Grid) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-3 mt-12 lg:mt-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {solutions.map((solution, index) => (
                <BentoCard key={index} className={solution.colSpan}>
                  <div className="flex flex-col h-full">
                    <div className="mb-4">{solution.icon}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{solution.title}</h4>
                    <p className="text-gray-600 text-sm flex-1">{solution.description}</p>
                  </div>
                </BentoCard>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhySoccerZone;