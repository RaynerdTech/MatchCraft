'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id: string;
  amount: number;
  status: string;
  usedAt?: Date;
  event: {
    _id: string;
    title: string;
    location: string;
    date: Date;
    image?: string;
  };
}

export default function JoinedEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null); // null means not loaded yet
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    const fetchJoinedEvents = async () => {
      const userId = session?.user?._id;
      
      if (!session) {
        setError('Please login to view your events');
        router.push('/signin');
        return;
      }

      if (!userId || !/^[0-9a-f]{24}$/i.test(userId)) {
        setError('Invalid user session. Please logout and login again.');
        return;
      }

      try {
        const res = await fetch(`/api/dashset/events/${userId}`);
        
        if (res.status === 401 || res.status === 403) {
          const errorData = await res.json();
          throw new Error(errorData.error);
        }

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Error loading joined events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setTransactions([]); // Set empty array to prevent loading state
      }
    };

    fetchJoinedEvents();
  }, [session, status, router]);

  // Session loading state
  if (status === 'loading' || transactions === null) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Event Dashboard</h1>
        <p className="text-gray-600 mt-2">
          You've joined {transactions.length} {transactions.length === 1 ? 'event' : 'events'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((tx) => (
          <EventCard key={tx._id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}

// Loading Skeleton (prevents layout shift)
function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error }: { error: string }) {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-flex items-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="bg-blue-50 text-blue-700 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
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
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Events Yet</h2>
      <p className="text-gray-600 mb-6">
        You haven't joined any events yet. Discover amazing experiences waiting for you!
      </p>
      <Link
        href="/dashboard/browse-events"
        className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
        Browse Events
      </Link>
    </div>
  );
}

// Event Card Component
function EventCard({ transaction }: { transaction: Transaction }) {
  const isUsed = Boolean(transaction.usedAt);
  const eventDate = new Date(transaction.event.date);
  const now = new Date();
  const isPastEvent = eventDate < now;
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
        isPastEvent ? 'opacity-90' : ''
      }`}
    >
      {transaction.event.image && (
        <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={transaction.event.image}
            alt={transaction.event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {transaction.event.title}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isPastEvent
                ? 'bg-gray-100 text-gray-500'
                : isUsed
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isPastEvent ? 'Past' : isUsed ? 'Used' : 'Active'}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          <span className="line-clamp-1">{transaction.event.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          <span>
            {formattedDate} • {formattedTime}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-blue-600">
          ₦{transaction.amount.toLocaleString()}
        </div>
        <Link
          href={`/dashboard/events/players/${transaction.event._id}`}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Ticket
        </Link>
      </div>
    </div>
  );
}