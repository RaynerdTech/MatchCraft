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
  ChevronRight,
  Calendar,
  Trophy,
  Frown,
  Smile
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const BentoCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className={`relative p-0.5 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent group ${className}`}
  >
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="bg-white/80 backdrop-blur-lg rounded-[15px] h-full w-full p-6">
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
    { icon: <Frown className="w-5 h-5 text-red-500" />, text: "Last-minute cancellations" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Chasing payments in cash" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "No-show players ruining games" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "Disorganized WhatsApp groups" },
    { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "No record of past matches" }
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

  const timeline = [
    {
      icon: <Frown className="w-6 h-6 text-red-500" />,
      title: "The Frustration",
      description: "Struggling to find reliable games and players",
      image: "/images/timeline-frustration.svg"
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      title: "The Idea",
      description: "Why not build a platform for footballers?",
      image: "/images/timeline-idea.svg"
    },
    {
      icon: <Trophy className="w-6 h-6 text-green-500" />,
      title: "The Solution",
      description: "SoccerZone was born to organize the chaos",
      image: "/images/timeline-solution.svg"
    },
    {
      icon: <Smile className="w-6 h-6 text-blue-500" />,
      title: "The Community",
      description: "Thousands of games played every week",
      image: "/images/timeline-community.svg"
    }
  ];

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Pitch Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50 to-white">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pitch-lines.svg')] bg-cover bg-center"></div>
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
            <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Football Revolution
            </span>
          </motion.div>
          
          <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            From <span className="text-red-500">Frustration</span> to <span className="text-blue-600">Freedom</span>
          </motion.h2>
          
          <motion.p variants={fadeIn} className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
            The journey from chaotic pick-up games to organized football bliss
          </motion.p>
        </motion.div>

        {/* Main Grid */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start">
          
          {/* Left Column - Founder's Story */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-2 lg:sticky lg:top-24 space-y-8"
          >
            {/* Founder's Quote */}
            <BentoCard className="bg-gradient-to-br from-blue-600/10 to-green-500/10">
              <div className="relative h-full">
                <div className="absolute -top-4 -left-4 w-16 h-16">
                  <Image
                    src="/images/football-icon.png"
                    alt="Football icon"
                    width={64}
                    height={64}
                    className="opacity-20"
                  />
                </div>
                <blockquote className="relative z-10 text-2xl font-medium text-gray-800 leading-relaxed">
                  "I built SoccerZone because I was tired of inconsistent games. Football deserves <span className="text-blue-600 font-bold">structure</span> and <span className="text-blue-600 font-bold">respect</span>."
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500">
                    <Image
                      src="/images/founder-ray.jpg"
                      alt="Ray, Founder of SoccerZone"
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Ray</p>
                    <p className="text-sm text-gray-500">Founder & Football Addict</p>
                    <div className="mt-1 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Trophy key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Timeline */}
            <BentoCard>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Our Journey</h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <motion.div 
                    key={index}
                    variants={fadeIn}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="absolute left-1/2 top-full w-0.5 h-6 bg-blue-200 transform -translate-x-1/2"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      <div className="mt-2 w-16 h-16 relative">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </BentoCard>
          </motion.div>

          {/* Right Column - Solutions */}
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
                    <div className="mb-4 p-2 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      {solution.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h4>
                    <p className="text-gray-600 flex-1">{solution.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-end">
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
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