"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const HowItWorks = () => {
  const steps = [
    {
      emoji: "🔍",
      title: "Discover",
      description:
        "Find football events near you or browse open matches and tournaments.",
      color: "from-blue-100 to-blue-50",
      border: "border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      emoji: "💳",
      title: "Pay",
      description:
        "Securely book your slot — we handle the split between organizer & platform.",
      color: "from-purple-100 to-purple-50",
      border: "border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      emoji: "🎟️",
      title: "Get Ticket",
      description:
        "Receive your digital ticket and QR pass instantly for entry and verification.",
      color: "from-green-100 to-green-50",
      border: "border-green-200",
      iconColor: "text-green-600",
    },
    {
      emoji: "⚽",
      title: "Play",
      description:
        "Show up, scan your ticket, and enjoy the beautiful game with no stress.",
      color: "from-orange-100 to-orange-50",
      border: "border-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      id="how-it-works"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="#3b82f6" />
            </pattern>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#pattern-circles)"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium rounded-full bg-blue-100 text-blue-800 shadow-sm">
            Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            How <span className="text-blue-600">SoccerHub</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a player or an organizer, we've made the process
            incredibly simple and smooth.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -8 }}
              className={`relative bg-white rounded-2xl p-6 shadow-lg border ${step.border} overflow-hidden group`}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
              />

              {/* Step number */}
              <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-sm font-medium">
                0{index + 1}
              </div>

              {/* Emoji icon */}
              <div
                className={`text-5xl mb-6 transition-transform duration-300 group-hover:scale-110 ${step.iconColor}`}
              >
                {step.emoji}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>

              {/* Animated arrow */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className={`w-6 h-6 ${step.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting line (desktop only) */}
        <div className="hidden lg:block relative mt-8 mb-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-gray-200" />
          </div>
          <div className="relative flex justify-between">
            {steps.map((_, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white"
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Ready to transform your football experience?
          </h3>
          <div className="inline-flex bg-gradient-to-r from-blue-600 to-blue-500 p-0.5 rounded-full shadow-lg">
            <Link href="/signin">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-blue-500/30 cursor-pointer text-center"
              >
                Get Started
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
