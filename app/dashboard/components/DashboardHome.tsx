'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?._id;

  const [role, setRole] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [position, setPosition] = useState('N/A');
  const [skillLevel, setSkillLevel] = useState('N/A');

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // 1. Fetch full user details
        const userRes = await fetch(`/api/users/${userId}/id`);
        const userData = await userRes.json();
        setPosition(userData.position || 'N/A');
        setSkillLevel(userData.skillLevel || 'N/A');
        setRole(userData.role || null);

        // 2. Fetch events based on role
        const endpoint =
          userData.role === 'organizer' || userData.role === 'admin'
            ? `/api/dashset/events/created/${userId}`
            : `/api/dashset/events/${userId}`;

        const eventsRes = await fetch(endpoint);
        const eventsData = await eventsRes.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };

    fetchData();
  }, [userId]);

  const statCards = [
    {
      label: role === 'organizer' || role === 'admin' ? 'Events Created' : 'Events Joined',
      value: String(events.length),
    },
    { label: 'Teams', value: '1' },
    { label: 'Skill Level', value: skillLevel },
    { label: 'Position', value: position },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <Image
          src={user?.image || '/default-avatar.png'}
          alt="User avatar"
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Player'} 👋</h1>
          <p className="text-sm text-gray-500">Ready to kick some goals today?</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      {/* Actions */}
      <div className="space-x-3">
        <Link href="/dashboard/browse-events">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Browse Events
          </button>
        </Link>
        <Link href="/dashboard/teams">
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
            My Teams
          </button>
        </Link>
      </div>
    </motion.section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-blue-600">{value}</p>
    </div>
  );
}
