'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type TeamInvite = {
  _id: string;
  name: string;
  side: string;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    pricePerPlayer: number;
    image: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  member: {
    paid: boolean;
    accepted: boolean;
  };
};

export default function UnpaidInvitesPage() {
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch('/api/teams/invites/unpaid');
        if (!res.ok) {
          throw new Error('Failed to fetch unpaid invites');
        }
        const data = await res.json();
        setInvites(data.teams);
      } catch (err) {
        console.error('Failed to fetch unpaid invites:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, []);

  const handlePay = async (eventId: string) => {
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError(data.error || 'Payment could not be started');
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError('An error occurred while initiating payment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Unpaid Invites</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
              <div className="bg-gray-200 h-48 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Invites</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">No Unpaid Invites</h1>
          <p className="text-gray-600 mb-6">
            You don't have any unpaid team invites at the moment.
          </p>
          <button
            onClick={() => router.push('/dashboard/browse-events')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Unpaid Invites</h1>
        <p className="text-gray-600 mt-2">
          You have {invites.length} unpaid team invite{invites.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {invites.map((invite) => (
          <div
            key={invite._id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative h-48">
              <Image
                src={invite.event.image}
                alt={`Event banner for ${invite.event.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {invite.event.title}
              </h2>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {invite.event.location}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(invite.event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Created by: {invite.createdBy.name}
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Team {invite.name}</p>
                    <p className="text-sm text-gray-600">
                      {invite.side === 'A' ? 'Side A' : 'Side B'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price per player</p>
                    <p className="text-lg font-bold text-blue-600">
                      ₦{invite.event.pricePerPlayer.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePay(invite.event._id)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                aria-label={`Pay for ${invite.event.title}`}
              >
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}