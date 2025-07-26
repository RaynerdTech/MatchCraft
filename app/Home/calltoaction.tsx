"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const CallToAction = () => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const [balls, setBalls] = useState<
    { top: string; left: string; rotate: number; duration: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 12 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      duration: 5 + Math.random() * 10,
    }));
    setBalls(generated);
  }, []);

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
      {/* Floating footballs background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {balls.map((ball, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              top: ball.top,
              left: ball.left,
              transform: `rotate(${ball.rotate}deg)`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: ball.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ⚽
          </motion.div>
        ))}
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id="grid-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.h2
          variants={item}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight justify-center text-center"
        >
          Ready to Play <span className="text-yellow-300">Smarter</span>{" "}
          Football?
        </motion.h2>

        <motion.p
          variants={item}
          className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto opacity-90 leading-relaxed text-center"
        >
          Join thousands of players and organizers using SoccerHub to connect,
          play, and manage games — the easy way.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/signin"
            className="relative overflow-hidden px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-full hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/30 group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started Now
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={item}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base opacity-80"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/150?img=${
                      i + 10
                    })`,
                    backgroundSize: "cover",
                  }}
                />
              ))}
            </div>
            <span>5,000+ Active Players</span>
          </div>

          <div className="h-4 w-px bg-white/30" />

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 border-2 border-white/30">
              ⭐
            </div>
            <span>4.9/5 Average Rating</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CallToAction;
