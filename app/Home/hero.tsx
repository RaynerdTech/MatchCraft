'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Play, PlusCircle, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define a type for the animated properties to ensure type safety
type WaveStyle = {
  width: string;
  duration: number;
};

const HeroSection = () => {
  // State to hold the random values, initialized to a default non-random state
  const [waveStyles, setWaveStyles] = useState<WaveStyle[]>([]);

  // useEffect runs only on the client-side, after hydration
  useEffect(() => {
    // Generate random values for the wave animations once the component has mounted
    const styles = [...Array(5)].map(() => ({
      width: `${10 + Math.random() * 10}%`,
      duration: 1.5 + Math.random(),
    }));
    setWaveStyles(styles);

    // Counter animation logic
    const animateCounter = (target: number, setter: React.Dispatch<React.SetStateAction<number>>, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16); // ~60fps
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    };

    animateCounter(550, setMatchesCount, 2000);
    animateCounter(850, setPlayersCount, 2000);
    animateCounter(80, setVenuesCount, 2000);

  }, []); // Empty dependency array ensures this runs only once on mount

  // Parallax and scroll effects
  const y = useMotionValue(0);
  const yInput = [-100, 0, 100];
  const yRange = useTransform(y, yInput, [-20, 0, 20]);

  // Animated counter for stats
  const [matchesCount, setMatchesCount] = useState(0);
  const [playersCount, setPlayersCount] = useState(0);
  const [venuesCount, setVenuesCount] = useState(0);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
    }
  } as const;

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4
      }
    }
  } as const;

  const ballAnimation = {
    hidden: { x: -100, opacity: 0, rotate: -45 },
    visible: {
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: 0.6
      }
    }
  } as const;

  // Floating confetti elements
  const ConfettiElement = ({ x, y, delay, icon }: { x: string, y: string, delay: number, icon: React.ReactNode }) => (
    <motion.div
      className="absolute text-yellow-400 z-10"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0.8],
        y: [0, -40, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear"
      }}
    >
      {icon}
    </motion.div>
  );

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      id="hero"
      style={{ perspective: '1000px' }}
    >
      {/* Stadium background with enhanced parallax */}
      <motion.div
        className="absolute inset-0 bg-blue-900/30 z-0"
        style={{ y: yRange }}
      >
        <Image
          src="/images/pitchfield.jpg"
          alt="Messi celebrating with stadium crowd"
          fill
          className="object-cover"
          priority
          quality={100}
          style={{ objectPosition: 'center 30%' }}
        />

        {/* Enhanced spotlight and gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-transparent to-blue-900/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(3,7,18,0.8)_100%)]"></div>

        {/* Subtle animated crowd noise waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          {waveStyles.length > 0 && [...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 h-1 bg-white/20 rounded-full"
              style={{
                left: `${i * 20}%`,
                // Use the state value for width. It will be undefined on server/initial render.
                width: waveStyles[i]?.width,
              }}
              animate={{
                height: [4, 12, 4],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                // Use the state value for duration.
                duration: waveStyles[i]?.duration || 2, // Provide a default duration
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating confetti elements */}
      <ConfettiElement x="10%" y="20%" delay={0.2} icon={<Trophy size={24} />} />
      <ConfettiElement x="85%" y="30%" delay={0.5} icon={<MapPin size={20} />} />
      <ConfettiElement x="40%" y="15%" delay={0.8} icon={<Users size={18} />} />
      <ConfettiElement x="70%" y="25%" delay={1.1} icon={<Calendar size={22} />} />

      {/* Rolling football animation with enhanced motion */}
      <motion.div
        className="absolute left-8 bottom-8 z-20 w-16 h-16 md:w-24 md:h-24 opacity-90"
        initial="hidden"
        animate="visible"
        variants={ballAnimation}
        whileHover={{ scale: 1.1, rotate: 45 }}
      >
        <Image
          src="/images/football-icon.png"
          alt="Football"
          fill
          className="object-contain drop-shadow-lg"
        />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10 py-24">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Text Content with enhanced typography */}
          <motion.div variants={fadeInUp} className="text-center lg:text-left">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight"
              variants={fadeInUp}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 block mb-4">
                Revolutionize
              </span>
              <span className="relative inline-block">
                <span className="relative z-10 text-white">How You Play</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-blue-600/80 -z-0" style={{ bottom: '15%' }} />
              </span>{' '}
              <span className="text-blue-400">Football</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              variants={fadeInUp}
            >
              <span className="font-bold text-white">Book.</span> <span className="font-bold text-white">Join.</span>{' '}
              <span className="font-bold text-white">Host.</span> <span className="font-bold text-white">Compete.</span>
            </motion.p>

            {/* Animated stats */}
           <motion.div
  className="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto lg:mx-0 min-w-0"
  variants={fadeInUp}
>
  {[ 
    { count: matchesCount, label: 'Matches' }, 
    { count: playersCount, label: 'Players' }, 
    { count: venuesCount, label: 'Venues' } 
  ].map((item, i) => (
    <div
      key={i}
      className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center border border-white/10 min-w-0"
    >
      <div className="text-2xl sm:text-3xl font-bold text-white break-words truncate">
        {item.count.toLocaleString()}+
      </div>
      <div className="text-blue-200 text-sm">{item.label}</div>
    </div>
  ))}
</motion.div>


            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" variants={fadeInUp}>
              <Link
                href="/dashboard/browse-events"
                className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 shadow-xl hover:shadow-blue-500/30 group hover-glow"
              >
                <span>Join a Match</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  <Play className="w-5 h-5" />
                </span>
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white/80 hover:border-white text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 backdrop-blur-sm hover-glow"
              >
                <span>Organize Event</span>
                <PlusCircle className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Player cards with more dynamic effects */}
          <motion.div
            className="relative hidden lg:block h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Messi with hover effect */}
            <motion.div
              className="absolute left-0 top-0 w-64 h-80 z-20"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/messi.png"
                  alt="Lionel Messi"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold text-lg">Lionel Messi</div>
                  <div className="text-blue-300 text-sm">8 Time Ballon d'Or</div>
                </div>
              </div>
            </motion.div>

            {/* Ronaldo with hover effect */}
            <motion.div
              className="absolute right-8 top-12 w-60 h-72 z-10"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/ronaldo.png"
                  alt="Cristiano Ronaldo"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold text-lg">Cristiano Ronaldo</div>
                  <div className="text-blue-300 text-sm">5 Time UCL Winner</div>
                </div>
              </div>
            </motion.div>

            {/* Mbappé with hover effect */}
            <motion.div
              className="absolute left-12 bottom-0 w-56 h-64 z-30"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/mbappe.png"
                  alt="Kylian Mbappé"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-bold text-lg">Kylian Mbappé</div>
                  <div className="text-blue-300 text-sm">World Cup Champion</div>
                </div>
              </div>
            </motion.div>

            {/* Animated football passing effect */}
            <motion.div
              className="absolute z-40 w-8 h-8"
              animate={{
                x: [0, 100, 200, 100, 0],
                y: [0, 50, 0, -50, 0],
                rotate: [0, 180, 360, 540, 720]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Image
                src="/images/football-icon.png"
                alt="Passing football"
                width={32}
                height={32}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
