'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  CalendarIcon,
  UsersIcon,
  SparklesIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'; // Using Heroicons for a modern look

export default function DashboardHome() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?._id;

  const [role, setRole] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [position, setPosition] = useState('N/A');
  const [skillLevel, setSkillLevel] = useState('N/A');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch full user details
        const userRes = await fetch(`/api/users/${userId}/id`);
        if (!userRes.ok) {
          throw new Error(`Failed to fetch user data: ${userRes.statusText}`);
        }
        const userData = await userRes.json();
        setPosition(userData.position || 'N/A');
        setSkillLevel(userData.skillLevel || 'N/A');
        setRole(userData.role || null);

        // 2. Fetch event count
        const endpoint =
          userData.role === 'organizer' || userData.role === 'admin'
            ? `/api/dashset/events/created/${userId}`
            : `/api/dashset/events/${userId}`;

        const eventsRes = await fetch(endpoint);
        if (!eventsRes.ok) {
          throw new Error(`Failed to fetch events data: ${eventsRes.statusText}`);
        }
        const eventsData = await eventsRes.json();

        const count = eventsData?.count !== undefined
          ? eventsData.count
          : Array.isArray(eventsData) ? eventsData.length : 0;

        setEventCount(count);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const statCards = [
    {
      label: role === 'organizer' || role === 'admin' ? 'Events Created' : 'Events Joined',
      value: String(eventCount),
      icon: <CalendarIcon className="h-6 w-6 text-indigo-500" />
    },
    {
      label: 'Teams',
      value: '1', // This is hardcoded; ideally, it would be fetched
      icon: <UsersIcon className="h-6 w-6 text-emerald-500" />
    },
    {
      label: 'Skill Level',
      value: skillLevel,
      icon: <SparklesIcon className="h-6 w-6 text-rose-500" />
    },
    {
      label: 'Position',
      value: position,
      icon: <MapPinIcon className="h-6 w-6 text-amber-500" />
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
        <p className="text-xl font-semibold mb-4">Error loading dashboard:</p>
        <p className="text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-10 pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="relative flex-shrink-0">
              <Image
                src={user?.image || '/default-avatar.png'}
                alt="User avatar"
                width={80}
                height={80}
                className="rounded-full object-cover border-4 border-white shadow-lg"
              />
              {role && (
                <span className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-white text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full shadow-md capitalize border border-indigo-200">
                  {role}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="mt-2 text-indigo-100 text-lg">
                {role === 'organizer' || role === 'admin'
                  ? "Let's organize something amazing today."
                  : "Ready to conquer the competition?"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- */}

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className="p-3 bg-opacity-15 rounded-xl"
                  style={{ backgroundColor: `${card.icon.props.className.split(' ').find(c => c.startsWith('text-'))?.replace('text-', '')}-100` }}
                >
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- */}

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/dashboard/browse-events" passHref>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Browse Events
              </motion.button>
            </Link>

            <Link href="/dashboard/teams" passHref>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center px-6 py-3 border border-indigo-400 text-indigo-700 bg-white font-semibold rounded-lg shadow-md hover:bg-indigo-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <UsersIcon className="h-5 w-5 mr-2" />
                My Teams
              </motion.button>
            </Link>

            {(role === 'organizer' || role === 'admin') && (
              <Link href="/dashboard/events" passHref>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Event
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}