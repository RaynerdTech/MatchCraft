'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CreateEventForm from '../components/CreateEventForm';

export const dynamic = 'force-dynamic'; // Required for Next.js 15

type SessionUser = {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onboardingComplete?: boolean;
  role?: 'player' | 'organizer' | 'admin';
};

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as SessionUser | undefined;

  useEffect(() => {
    if (status === 'loading') return;
    if (!user?._id) {
      router.push('/signin?callbackUrl=/create-event');
    }
  }, [status, user?._id, router]);

  if (status === 'loading') return <LoadingSkeleton />;
  if (!user) return null;

  const userRole = user.role || 'player';

  if (userRole !== 'organizer' && userRole !== 'admin') {
    return <AccessDenied />;
  }

 // The form is now a direct child of the main layout container
return (
  <div className="max-w-3xl mx-auto px-4 sm:px-6">
    <h1 className="text-2xl font-bold mb-2">Create New Event</h1>
    <p className="text-gray-600 mb-6">
      Fill out the form below to list your event
    </p>

    <CreateEventForm
      userId={user._id}
      onSuccess={() => router.push('/events')}
    />
  </div>
);
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function AccessDenied() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="mb-4">
          Only organizers and administrators can create events.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/contact')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Become an Organizer
          </button>
          <button
            onClick={() => router.push('/dashboard/browse-events')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}
