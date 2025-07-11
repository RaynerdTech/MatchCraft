'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JoinedEventsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJoinedEvents = async () => {
      const userId = session?.user?._id;
      
      // Validate user ID format
      if (!userId || !/^[0-9a-f]{24}$/i.test(userId)) {
        setError('Invalid user session');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/dashset/events/${userId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        if (data.transactions) {
          setTransactions(data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error loading joined events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
  }, [session?.user?._id]);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading your events...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 inline mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!transactions.length) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No Joined Events Yet</h2>
          <p className="text-gray-500 mb-6">
            You haven't registered for any events yet. Explore exciting events waiting for you!
          </p>
          <Link
            href="/dashboard/browse-events"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Joined Events</h1>
        <p className="text-gray-500 mt-1">
          {transactions.length} {transactions.length === 1 ? 'event' : 'events'} found
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => {
          if (!tx.event) return null;

          const isUsed = Boolean(tx.usedAt);
          const eventDate = new Date(tx.event.date);
          const now = new Date();
          const isPastEvent = eventDate < now;

          return (
            <div
              key={tx._id}
              className={`bg-white p-5 rounded-xl shadow-sm border ${
                isPastEvent ? 'opacity-80' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {tx.event.image && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {/* Inline img would normally be used here */}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {tx.event.title}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        <span className="mx-2">•</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {tx.event.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-sm space-y-1.5 text-gray-700">
                  <p>
                    <span className="font-medium">Amount:</span>{' '}
                    <span className="text-green-600 font-medium">
                      ₦{tx.amount.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span
                      className={`capitalize ${
                        tx.status === 'success'
                          ? 'text-green-600'
                          : tx.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-medium">Ticket:</span>{' '}
                    <span
                      className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isUsed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isUsed ? 'Used' : 'Active'}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/events/players/${tx.event._id}`}
                    className="text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Ticket
                  </Link>
                  {isPastEvent && (
                    <button
                      disabled
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Event ended
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}