'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EventPage({ params }: { params: { eventId: string } }) {
  const searchParams = useSearchParams();
  const [showFailed, setShowFailed] = useState(false);

  useEffect(() => {
    if (searchParams.get('payment') === 'failed') {
      setShowFailed(true);
      toast.error('❌ Payment failed or was cancelled.');
    }
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      {showFailed ? (
        <div className="bg-red-50 border border-red-300 text-red-700 p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
          <p className="mb-4">Your ticket payment could not be completed.</p>
          <Link href="/dashboard" className="text-blue-600 underline">
            ← Return to Dashboard
          </Link>
        </div>
      ) : (
        <div>
          {/* normal event page content here */}
          <h1 className="text-2xl font-bold">Event Info</h1>
          <p>Show the regular event info here...</p>
        </div>
      )}
    </div>
  );
}
